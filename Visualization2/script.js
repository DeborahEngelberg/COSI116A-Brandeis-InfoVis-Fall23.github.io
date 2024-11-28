// Load the CSV file
d3.csv("cause_of_deaths.csv").then(data => {
    console.log("Data loaded:", data); // Debugging
    const years = [...new Set(data.map(d => d.Year))];
    const causes = Object.keys(data[0]).slice(3); // Causes of death

    years.forEach(year => yearSelect.append("option").text(year).attr("value", year));
    causes.forEach(cause => causeSelect.append("option").text(cause).attr("value", cause));
});


// Default values
yearSelect.property("value", years[0]);
causeSelect.property("value", causes[0]);

// Set up color scale
const colorScale = d3.scaleSequential(d3.interpolateBlues);

// Function to update map
function updateMap() {
    const selectedYear = yearSelect.property("value");
    const selectedCause = causeSelect.property("value");
    const selectedColor = colorSelect.property("value");

    colorScale.interpolator(d3[`interpolate${selectedColor}`]);

    // Filter data by year
    const yearData = data.filter(d => d.Year === selectedYear);

    // Update map visualization
    svg.selectAll("path")
        .data(yearData, d => d["Country/Territory"]) // Match countries
        .join("path")
        .attr("id", d => d.Code) // Country Code
        .attr("d", d => d.Path) // SVG path, if available
        .style("fill", d => colorScale(d[selectedCause]))
        .style("stroke", "#eee")
        .style("stroke-width", 0.25);
}

// Event listeners for interactivity
yearSelect.on("change", updateMap);
causeSelect.on("change", updateMap);
colorSelect.on("change", updateMap);

// Initial render
updateMap();
