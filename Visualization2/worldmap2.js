// Set initial width and height to match the viewport
let width = window.innerWidth;
let height = window.innerHeight;

// Adjust the scale dynamically based on the smaller viewport dimension
const calculateScale = () => Math.min(width, height) / 7; // Slightly reduce scale

// Create the SVG container
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Create a group for the map elements
const mapGroup = svg.append("g")
  .attr("class", "map-group"); // Add a class for debugging

// Create the projection and path generator
const projection = d3.geoMercator()
  .scale(calculateScale())
  .translate([width / 2, height / 2.2]); // Center the map and adjust vertically

const path = d3.geoPath().projection(projection); // Ensure global accessibility of `path`

// Define zoom behavior
const zoom = d3.zoom()
  .scaleExtent([1, 8]) // Limit zoom scale
  .on("zoom", function () {
    mapGroup.attr("transform", d3.event.transform); // Apply zoom transformations
  });

// Apply zoom behavior to the SVG
svg.call(zoom);

// Create a tooltip div that is hidden by default
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background", "rgba(0, 0, 0, 0.8)")
  .style("color", "#fff")
  .style("padding", "5px 10px")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("opacity", 0);

// Store global variables for years, causes, and current color
let years = [];
let causes = [];
let geoData = [];
let data = [];
let currentColor = "#4292c6";

// Declare a global variable to store the current cause data
let currentCauseData = {};

// Load data
d3.queue()
  .defer(d3.json, "../Visualization2/geo.json")
  .defer(d3.csv, "../data/cause_of_deaths.csv", function (d) {
    d.Year = parseInt(d.Year);
    return d;
  })
  .await((error, loadedGeoData, loadedData) => {
    if (error) {
      console.error("Error loading data:", error);
      return;
    }

    // Assign loaded data to global variables
    geoData = loadedGeoData;
    data = loadedData;

    // Extract years and causes
    years = Array.from(new Set(data.map(d => d.Year).filter(year => !isNaN(year))));
    causes = Object.keys(data[0]).slice(4);

    // Initialize dropdown menus and map
    initializeDropdowns();
    updateMap(years[0], causes[0]);
  });

// Initialize dropdowns for year, cause, and color
function initializeDropdowns() {
  d3.select("#year")
    .selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  d3.select("#cause")
    .selectAll("option")
    .data(causes)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  d3.select("#year").on("change", function () {
    const selectedYear = d3.select(this).property("value");
    const selectedCause = d3.select("#cause").property("value");
    updateMap(selectedYear, selectedCause, currentColor);
  });

  d3.select("#cause").on("change", function () {
    const selectedYear = d3.select("#year").property("value");
    const selectedCause = d3.select(this).property("value");
    updateMap(selectedYear, selectedCause, currentColor);
  });

  d3.select("#color").on("input", debounce(() => {
    currentColor = d3.select("#color").property("value");
    updateColorsOnly(currentColor);
  }, 100));
}

// Debounce function to limit update frequency
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Update the map visualization
function updateMap(selectedYear, selectedCause, baseColor = currentColor) {
  const filteredData = data.filter(d => d.Year == selectedYear);
  const causeData = {};

  filteredData.forEach(d => {
    causeData[d.Country.trim().toLowerCase()] = +d[selectedCause] || 0;
  });

  currentCauseData = causeData;

  const colorScale = d3.scaleLinear()
    .domain([0, d3.max(Object.values(causeData))])
    .range(["#ffffff", baseColor]);

  const countries = mapGroup.selectAll(".Country")
    .data(geoData.features);

  countries.enter()
    .append("path")
    .attr("class", "Country")
    .merge(countries)
    .attr("d", path)
    .style("fill", d => {
      const countryName = d.properties && d.properties.name ? d.properties.name.toLowerCase() : null;
      const value = countryName ? causeData[countryName] : null;
      return value ? colorScale(value) : "#ccc";
    })
    .style("stroke", "black")
    .style("stroke-width", "0.5px")
    .on("mouseover", function (d) {
      const countryName = d.properties && d.properties.name ? d.properties.name.toLowerCase() : null;
      const value = countryName ? currentCauseData[countryName] : null;

      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);

      tooltip.html(
        `${d.properties && d.properties.sovereignt ? d.properties.sovereignt : 'Unknown'}<br/>${value !== null && value !== undefined ? value : "No data"}`
      )
        // Use d3.event.pageX and d3.event.pageY instead of event.pageX and event.pageY
        .style("left", `${d3.event.pageX}px`)
        .style("top", `${d3.event.pageY - 28}px`);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });


  countries.exit().remove();

  const minValue = 0;
  const maxValue = d3.max(Object.values(causeData));
  updateLegend(minValue, maxValue, baseColor);
}

// Adjust the map on window resize
window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;

  svg.attr("width", width).attr("height", height);
  projection
    .scale(calculateScale())
    .translate([width / 2, height / 2.2]);
  svg.selectAll(".Country").attr("d", path);
});

// Update only the colors of the countries
function updateColorsOnly(baseColor) {
  const selectedYear = d3.select("#year").property("value");
  const selectedCause = d3.select("#cause").property("value");

  const filteredData = data.filter(d => d.Year == selectedYear);
  const causeData = {};
  filteredData.forEach(d => {
    causeData[d.Country.trim().toLowerCase()] = +d[selectedCause] || 0;
  });

  const colorScale = d3.scaleLinear()
    .domain([0, d3.max(Object.values(causeData))])
    .range(["#ffffff", baseColor]);

  mapGroup.selectAll(".Country")
    .style("fill", d => {
      const countryName = d.properties && d.properties.name ? d.properties.name.toLowerCase() : null;
      const value = countryName ? causeData[countryName] : null;
      return value ? colorScale(value) : "#ccc";
    });

  const minValue = 0;
  const maxValue = d3.max(Object.values(causeData));
  updateLegend(minValue, maxValue, baseColor);
}

// Update legend
function updateLegend(min, max, baseColor) {
  const legendContainer = d3.select("#legend-container");

  legendContainer.selectAll("*").remove();

  legendContainer.append("span")
    .attr("class", "legend-label")
    .text(min);

  legendContainer.append("div")
    .attr("class", "legend-bar")
    .style("background", `linear-gradient(to right, #ffffff, ${baseColor})`);

  legendContainer.append("span")
    .attr("class", "legend-label")
    .text(max);
}
