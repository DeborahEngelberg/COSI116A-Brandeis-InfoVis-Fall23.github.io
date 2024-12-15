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

// Create a tooltip (for displaying country names and data)
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load the data
d3.queue()
  .defer(d3.json, "../Visualization3/Worldmap/geo.json") // Correct path to your geo.json
  .defer(d3.csv, "../data/vis3_data.csv") // Correct path to your dataset
  .await(ready);

function ready(error, geoData, data) {
  if (error) {
    console.error("Error loading the data:", error);
    return;
  }

  // Create a map
  svg.selectAll(".country")
    .data(geoData.features)
    .enter().append("path")
    .attr("class", "country")
    .attr("d", path)
    .style("fill", "#ccc")
    .style("stroke", "grey")
    .style("stroke-width", "0.5px")
    .on("mouseover", function (d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(d.properties.name)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Update map when dropdown changes
  d3.selectAll("#country-select, #year-select, #data-type-select").on("change", function () {
    const country = d3.select("#country-select").property("value");
    const year = d3.select("#year-select").property("value");
    const dataType = d3.select("#data-type-select").property("value");
    updateSummary(country, year, dataType, data);
  });
}

// Function to update the data summary
function updateSummary(country, year, dataType, data) {
  // Find the corresponding data row
  const row = data.find(d => d.Country === country && d.Year === year);

  const summaryText = document.getElementById("summary-text");
  if (row) {
    if (dataType === "AlcoholConsumption") {
      summaryText.textContent = `In ${year}, alcohol, recorded per capita (15+ years) consumption (in liters of pure alcohol) was ${row.AlcoholConsumption}.`;
    } else if (dataType === "TotalDeaths") {
      summaryText.textContent = `In ${year}, the total number of deaths recorded was ${row.TotalDeaths}.`;
    } else {
      summaryText.textContent = "Data type not supported yet.";
    }
  } else {
    summaryText.textContent = "No data available for the selected country and year.";
  }
}
