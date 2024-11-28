// Set up SVG dimensions
const width = 800, height = 600;

// Append the SVG object to the body of the page
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Define a projection (e.g., Mercator projection)
const projection = d3.geoMercator()
    .scale(130)  // Scale for the world map
    .translate([width / 2, height / 2]);  // Center the map

// Define a path generator using the projection
const path = d3.geoPath().projection(projection);

// Load GeoJSON data and draw the map using d3.queue
d3.queue()
  .defer(d3.json, "geo.json")  // Adjust the path as necessary
  .await(function(error, geoData) {
    if (error) {
      console.error("Error loading the GeoJSON data:", error);
      if (error.target && error.target.status) {
        console.error("HTTP Status Code:", error.target.status);
      }
      return;
    }

    console.log("GeoJSON data loaded:", geoData);
    if (!geoData || !geoData.features) {
      throw new Error("Invalid GeoJSON data");
    }

    // Bind GeoJSON features to paths
    svg.selectAll(".country")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", "lightblue")
      .on("mouseover", function () {
        d3.select(this).attr("fill", "orange");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "lightblue");
      });

    // Loop through the GeoJSON data to get the name and coordinates
    geoData.features.forEach(function(d) {
      const name = d.properties.name;
      const coordinates = d.geometry.coordinates;
      console.log("Country: " + name);
      console.log("Coordinates: ", coordinates);
    });
  });