const width = 1500;
const height = 1000;

const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const projection = d3.geoMercator()
  .scale(150)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Create a tooltip
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load data
d3.queue()
  .defer(d3.json, "../Worldmap/geo.json") // Ensure path to geo.json is correct
  .defer(d3.csv, "../data/cause_of_deaths.csv") // Update path for cause_of_deaths.csv
  .await(ready);

function ready(error, geoData, data) {
  if (error) {
    console.error("Error loading data:", error);
    return;
  }

  // Extract unique years and causes of death
  const years = Array.from(new Set(data.map(d => d.Year)));
  const causes = Object.keys(data[0]).slice(4);

  // Populate the year dropdown
  const yearDropdown = d3.select("#year")
    .selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  // Populate the cause dropdown
  const causeDropdown = d3.select("#cause")
    .selectAll("option")
    .data(causes)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  // Function to update the map
  function updateMap(selectedYear, selectedCause) {
    const filteredData = data.filter(d => d.Year == selectedYear);
    const causeData = {};
    filteredData.forEach(d => {
      causeData[d.Country] = +d[selectedCause];
    });

    const colorScale = d3.scaleQuantize()
      .domain(d3.extent(Object.values(causeData)))
      .range([
        "#f7fbff", "#deebf7", "#c6dbef", "#9ecae1",
        "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"
      ]);

    svg.selectAll(".country").remove(); // Clear existing paths
    svg.selectAll(".legend").remove(); // Clear existing legend

    svg.selectAll(".country")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", d => {
        const countryName = d.properties?.name; // Use optional chaining
        const value = countryName ? causeData[countryName] : null;
        return value ? colorScale(value) : "#ccc";
      })
      .style("stroke", "black")
      .style("stroke-width", "0.5px")
      .on("mouseover", function (event, d) {
        const countryName = d.properties?.name || "Unknown";
        const value = countryName ? causeData[countryName] : "No data";
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`${countryName}<br>${selectedCause}: ${value}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Add a legend
    const legendWidth = 300;
    const legendHeight = 20;
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - legendWidth - 20}, ${height - legendHeight - 20})`);

    const legendScale = d3.scaleLinear()
      .domain(d3.extent(Object.values(causeData)))
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale).ticks(5);

    const legendData = colorScale.range().map(d => {
      const extent = colorScale.invertExtent(d);
      if (!extent[0]) extent[0] = legendScale.domain()[0];
      if (!extent[1]) extent[1] = legendScale.domain()[1];
      return extent;
    });

    legend.selectAll("rect")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", d => legendScale(d[0]))
      .attr("y", 0)
      .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
      .attr("height", legendHeight)
      .style("fill", d => colorScale(d[0]));

    legend.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis);
  }

  // Load the initial map with the first year and cause
  const initialYear = years[0];
  const initialCause = causes[0];
  updateMap(initialYear, initialCause);

  // Update the map when the dropdown changes
  d3.select("#year").on("change", function () {
    const selectedYear = d3.select(this).property("value");
    const selectedCause = d3.select("#cause").property("value");
    updateMap(selectedYear, selectedCause);
  });

  d3.select("#cause").on("change", function () {
    const selectedYear = d3.select("#year").property("value");
    const selectedCause = d3.select(this).property("value");
    updateMap(selectedYear, selectedCause);
  });
}
