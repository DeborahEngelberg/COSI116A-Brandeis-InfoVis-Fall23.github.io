const width = 1500;
const height = 600;

const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height - 110);

const projection = d3.geoMercator()
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);


// Create a tooltip (for displaying country names and data)
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load the data
d3.queue()
  .defer(d3.json, "../Visualization1/Worldmap/geo.json")
  .defer(d3.csv, "../data/alc00-09.csv")
  .defer(d3.csv, "../data/alc09-19.csv")
  .await(ready);

function ready(error, geoData, data00_09, data09_19) {
  if (error) {
    console.error("Error loading the data:", error);
    return;
  }

  // Function to update the map based on the selected year
  function updateMap(year) {
    const data = {};

    //Get the data for the selected year
    if (year >= 2010 && year <= 2019) {
      for (const d of data09_19) {
        if (d["Beverage Types"] && d["Beverage Types"].trim() === "All types") {
          data[d["Countries, territories and areas"].trim()] = +d[` ${year}`];
        }
      }
    } else if (year >= 2000 && year <= 2009) {
      for (const d of data00_09) {
        if (d["Beverage Types"] && d["Beverage Types"].trim() === "All types") {
          data[d["Countries, territories and areas"].trim()] = +d[` ${year}`];
        }
      }
    }

    // Create a color scale
    const colorScale = d3.scaleQuantize()
      .domain([0, d3.max(Object.values(data))])
      .range([
        "#f7fbff",
        "#deebf7",
        "#c6dbef",
        "#9ecae1",
        "#6baed6",
        "#4292c6",
        "#2171b5",
        "#08519c",
        "#08306b"
      ]);

    // Create a map
    svg.selectAll(".country")
      .data(geoData.features)
      .enter().append("path")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", d => {
        const value = data[d.properties.name];
        return value ? colorScale(value) : "#ccc";
      })
      .on("mouseover", function (d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(d.properties.name + "<br/>" + year + ": " + (data[d.properties.name] || "No data"))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Create a legend
    const legendWidth = 15;
    const legendHeight = 425;

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendWidth + 150},${legendHeight - 370})`);
      

    // Title for the legend
    legend.append("text")
      .attr("class", "legend-title")
      .attr("x", -40)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Legend");

    // Create a scale for the legend
    const maxValue = Math.floor(d3.max(Object.values(data)));
    const legendScale = d3.scaleLinear()
      .domain([0, d3.max(Object.values(data))])
      .range([legendHeight, 0]);

    // Create an axis for the legend
    const legendAxis = d3.axisRight(legendScale)
      .tickValues(d3.range(0, maxValue + 1, Math.floor(maxValue / 6))); //More customizable tick marks

    const legendData = colorScale.range().map(d => {
      const extent = colorScale.invertExtent(d);
      if (!extent[0]) extent[0] = legendScale.domain()[0];
      if (!extent[1]) extent[1] = legendScale.domain()[1];
      return extent;
    });

    legend.selectAll("rect")
      .data(legendData)
      .enter().append("rect")
      .attr("x", 0)
      .attr("y", d => legendScale(d[1]))
      .attr("width", legendWidth)
      .attr("height", d => legendScale(d[0]) - legendScale(d[1]))
      .style("fill", d => colorScale(d[0]));
    
    legend.append("g")
      .attr("class", "legend-axis")
      .attr("transform", `translate(${legendWidth},0)`)
      .call(legendAxis);
  }

  // Set default year to 2000
  updateMap("2000");

  // Update map with the range slider
  d3.select("#yearSlider").on("input", function () {
    const selectedYear = d3.select(this).property("value");
    svg.selectAll(".country").remove();
    svg.selectAll(".legend").remove();
    updateMap(selectedYear); // Update map with the selected year
    d3.select("#yearTitle").text(selectedYear); // Update the title
  });

  
}

