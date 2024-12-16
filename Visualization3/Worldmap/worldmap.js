const width = 1000;
const height = 600;

const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height - 100);

const projection = d3.geoMercator()
  .scale(150)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

let selectedCountry = null;

//for summary
const dataSummary = d3.select("#data-summary");

//tooltip
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

//load data
d3.queue()
  .defer(d3.json, "../Visualization3/Worldmap/geo.json")
  .defer(d3.csv, "../data/combined_data.csv") // Load the dataset
  .await(ready);

function ready(error, geoData, data) {
  if (error) {
    console.error("Error loading the data:", error);
    return;
  }

  //to draw the map
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
    .on("mouseout", function (d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  //update map when dropdown changes
  d3.selectAll("#country-select, #year-select, #data-type-select").on("change", function () {
    const country = d3.select("#country-select").property("value");
    const year = d3.select("#year-select").property("value"); //i think we need to change it to match the data cols
    const dataType = d3.select("#data-type-select").property("value");
    updateHighlight(country, geoData);
    updateSummary(country, year, dataType, data);
  });
}

//highlight the selected country
function updateHighlight(country, geoData) {
  svg.selectAll(".country")
    .style("fill", d => (d.properties.name === country ? "#F2B15F" : "#ccc"));
}

//update the data summary
function updateSummary(country, year, dataType, data) {
  // Find the corresponding data row
  const row = data.find(d => d.Country === country && d.Year === year && d.DataType === dataType);

  //text to display
  const summaryText = document.getElementById("summary-text");

  if (row) {
    const value = row.Value || "No data available";
    const unit = dataType === "Alcohol" ? "liters of pure Alcohol" : "units";
    summaryText.textContent = `In ${year}, ${country} recorded ${value} ${unit} for ${dataType}.`;
  } else {
    summaryText.textContent = `No data available for ${country} in ${year} for ${dataType}.`;
  }

}