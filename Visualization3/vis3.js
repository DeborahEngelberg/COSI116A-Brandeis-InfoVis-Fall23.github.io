const width = 1000;
const height = 600;

const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const projection = d3.geoMercator()
  .scale(150)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Load the GeoJSON and data
Promise.all([
    d3.json("geo.json"), // World map GeoJSON file
    d3.csv("data.csv")   // CSV file with alcohol data
]).then(([geoData, data]) => {
    const countries = geoData.features.map(d => d.properties.name);
    const years = [...new Set(data.map(d => d.Year))].sort();
    
    // Populate dropdowns
    const countrySelect = d3.select("#country-select");
    countries.forEach(country => {
        countrySelect.append("option").text(country).attr("value", country);
    });

    const yearSelect = d3.select("#year-select");
    years.forEach(year => {
        yearSelect.append("option").text(year).attr("value", year);
    });

    // Initial Map Rendering
    updateMap("2018", "alcohol");

    // Event Listeners
    yearSelect.on("change", () => updateMap(yearSelect.property("value"), "alcohol"));
    countrySelect.on("change", () => updateCountry(countrySelect.property("value"), yearSelect.property("value"), "alcohol"));

    function updateMap(selectedYear, dataType) {
        const yearData = data.filter(d => d.Year == selectedYear && d.Type == dataType);

        const dataMap = {};
        yearData.forEach(d => {
            dataMap[d.Country] = +d.Value;
        });

        const colorScale = d3.scaleSequential(d3.interpolateOranges)
            .domain([0, d3.max(Object.values(dataMap))]);

        svg.selectAll(".country")
            .data(geoData.features)
            .join("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", d => {
                const value = dataMap[d.properties.name];
                return value ? colorScale(value) : "#ccc";
            })
            .attr("stroke", "#333")
            .attr("stroke-width", 0.5)
            .on("click", (event, d) => {
                const country = d.properties.name;
                updateCountry(country, selectedYear, dataType);
            });
    }

    function updateCountry(country, selectedYear, dataType) {
        const countryData = data.find(d => d.Country === country && d.Year == selectedYear && d.Type == dataType);
        const globalAvg = d3.mean(data.filter(d => d.Year == selectedYear && d.Type == dataType).map(d => +d.Value));

        const summaryText = countryData
            ? `In ${selectedYear}, ${dataType} consumption in ${country} was ${countryData.Value.toFixed(2)} liters. This is ${(countryData.Value - globalAvg).toFixed(2)} liters ${countryData.Value > globalAvg ? "above" : "below"} the global average.`
            : `No data available for ${country} in ${selectedYear}.`;

        d3.select("#summary").html(`<p>${summaryText}</p>`);
    }
});
