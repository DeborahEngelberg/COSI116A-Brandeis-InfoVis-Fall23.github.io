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

// Create the projection and path generator
const projection = d3.geoMercator()
  .scale(calculateScale()) // Dynamically scale based on viewport dimensions
  .translate([width / 2, height / 2.2]); // Center the map and adjust vertically

const path = d3.geoPath().projection(projection);

// Create a tooltip
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Debounce function to limit the frequency of updates
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Store global variables for years, causes, and current color
let years = [];
let causes = [];
let geoData = [];
let data = [];
let currentColor = "#4292c6";

// Load data
d3.queue()
  .defer(d3.json, "../Visualization2/geo.json")
  .defer(d3.csv, "../data/cause_of_deaths.csv") // Update path for cause_of_deaths.csv
  .await((error, loadedGeoData, loadedData) => {
    if (error) {
      console.error("Error loading data:", error);
      return;
    }

    // Assign loaded data to global variables
    geoData = loadedGeoData;
    data = loadedData;

    // Extract years and causes
    years = Array.from(new Set(data.map(d => d.Year)));
    causes = Object.keys(data[0]).slice(4);

    // Initialize dropdown menus and map
    initializeDropdowns();
    updateMap(years[0], causes[0]);
  });

function initializeDropdowns() {
  // Populate the year dropdown
  d3.select("#year")
    .selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  // Populate the cause dropdown
  d3.select("#cause")
    .selectAll("option")
    .data(causes)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  // Set up event listeners
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

  // Set up the color input event listener
  d3.select("#color").on("input", debounce(() => {
    currentColor = d3.select("#color").property("value");
    updateColorsOnly(currentColor);
  }, 100));
}

function updateLegend(min, max, baseColor) {
  const legendContainer = d3.select("#legend-container");

  // Clear any existing legend
  legendContainer.selectAll("*").remove();

  // Add min label
  legendContainer.append("span")
    .attr("class", "legend-label")
    .text(min);

  // Create the color gradient bar
  legendContainer.append("div")
    .attr("class", "legend-bar")
    .style("background", `linear-gradient(to right, #ffffff, ${baseColor})`);

  // Add max label
  legendContainer.append("span")
    .attr("class", "legend-label")
    .text(max);
}

// Update colors only (avoid full re-render)
function updateColorsOnly(baseColor) {
  const selectedYear = d3.select("#year").property("value");
  const selectedCause = d3.select("#cause").property("value");

  const filteredData = data.filter(d => d.Year == selectedYear);
  const causeData = {};
  filteredData.forEach(d => {
    causeData[d.Country] = +d[selectedCause];
  });

  const colorScale = d3.scaleLinear()
    .domain([0, d3.max(Object.values(causeData))])
    .range(["#ffffff", baseColor]);

  // Update only the colors of the countries
  svg.selectAll(".country")
    .style("fill", d => {
      const countryName = d.properties?.name;
      const value = countryName ? causeData[countryName] : null;
      return value ? colorScale(value) : "#ccc"; // Default grey for no data
    });

  // Update legend
  const minValue = 0;
  const maxValue = d3.max(Object.values(causeData));
  updateLegend(minValue, maxValue, baseColor);
}

function updateMap(selectedYear, selectedCause, baseColor = currentColor) {
  const filteredData = data.filter(d => d.Year == selectedYear);
  const causeData = {};
  filteredData.forEach(d => {
    causeData[d.Country] = +d[selectedCause];
  });

  const colorScale = d3.scaleLinear()
    .domain([0, d3.max(Object.values(causeData))])
    .range(["#ffffff", baseColor]);

  // Update countries
  const countries = svg.selectAll(".country")
    .data(geoData.features);

  countries.enter()
    .append("path")
    .attr("class", "country")
    .merge(countries)
    .attr("d", path)
    .style("fill", d => {
      const countryName = d.properties?.name;
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

  countries.exit().remove();

  // Update legend
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
  svg.selectAll(".country").attr("d", path);
});
