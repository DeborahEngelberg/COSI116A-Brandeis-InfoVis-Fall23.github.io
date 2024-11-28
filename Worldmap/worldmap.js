// Set up SVG dimensions
const width = 1000;
const height = 600;

// Append the SVG object to the body of the page
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Define a projection (e.g., Mercator projection)
const projection = d3.geoMercator()
  .scale(150)
  .translate([width / 2, height / 2]);

// Define a path generator using the projection
const path = d3.geoPath().projection(projection);

// Create a tooltip
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load GeoJSON data and draw the map
d3.json("../Worldmap/geo.json", function(error, geoData) {
  if (error) {
    console.error("Error loading the GeoJSON data:", error);
    return;
  }

  // Bind GeoJSON features to paths
  svg.selectAll(".country")
    .data(geoData.features)
    .enter().append("path")
    .attr("class", "country")
    .attr("d", path)
    .on("mouseover", function(d) {
    //   d3.select(this).style("fill", "orange");
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(d.properties.name)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
    //   d3.select(this).style("fill", "lightblue");
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
});