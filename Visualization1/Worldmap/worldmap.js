const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const projection = d3.geoMercator()
  .scale(Math.min(width, height) / 2.5)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);


// Create a tooltip (for displaying country names and data)
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load the data
d3.queue()
  .defer(d3.json, "../Worldmap/geo.json")
  .defer(d3.csv, "../data/alc00-09.csv")
  .defer(d3.csv, "../data/alc09-19.csv")
  .defer(d3.csv, "../data/alc80-99.csv")
  .await(ready);

function ready(error, geoData, data00_09, data09_19, data80_99) {
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

          console.log("In the 2010-2019 area");
        }
      }
    } else if (year >= 2000 && year <= 2009) {
      for (const d of data00_09) {
        if (d["Beverage Types"] && d["Beverage Types"].trim() === "All types") {
          data[d["Countries, territories and areas"].trim()] = +d[` ${year}`];

          console.log("In the 2000-2009 area");
        }
      }
    } else if (year >= 1980 && year <= 1999) { // NOTE: Data from 80-99 causes error w/ <rect> attribute
      for (const d of data80_99) {
        if (d["Beverage Types"] && d["Beverage Types"].trim() === "All types") {
          data[d["Countries, territories and areas"].trim()] = +d[` ${year}`];

          console.log("In the 1980-1999 area");
        }
      }
    }

    // console.log("Processed Data:", data);

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
        // console.log("Country:", d.properties.name, "Value:", value); 
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
    const legendWidth = 300;
    const legendHeight = 25;

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - legendWidth - 90},${height - legendHeight - 90})`);

    // Title for the legend
    legend.append("text")
      .attr("class", "legend-title")
      .attr("x", 0)
      .attr("y", -20)
      .attr("text-anchor", "start")
      .text("Pure Alcohol Consumption (liters per capita)");

    // Define a linear gradient -- DECIDE WHETHER TO USE THIS OR NOT, MAY BE DIFFICULT TO READ
    const defs = svg.append("defs");

    const linearGradient = defs.append("linearGradient")
      .attr("id", "legend-gradient");

    linearGradient.selectAll("stop")
      .data(colorScale.ticks().map((t, i, n) => ({
        offset: `${100 * i / n.length}%`,
        color: colorScale(t)
      })))
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);


    // Create a scale for the legend
    const maxValue = Math.floor(d3.max(Object.values(data)));
    const legendScale = d3.scaleLinear()
      .domain([0, d3.max(Object.values(data))])
      .range([0, legendWidth]);

    // Create an axis for the legend
    const legendAxis = d3.axisBottom(legendScale)
      .tickValues(d3.range(0, maxValue + 1, Math.floor(maxValue / 5))); //More customizable tick marks

    const legendData = colorScale.range().map(d => {
      const extent = colorScale.invertExtent(d);
      if (!extent[0]) extent[0] = legendScale.domain()[0];
      if (!extent[1]) extent[1] = legendScale.domain()[1];
      return extent;
    });

    legend.selectAll("rect")
      .data(legendData)
      .enter().append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");
    legend.append("g")
      .attr("transform", `translate(0,${legendHeight})`)
      .call(legendAxis);
  }

  // Set default year to 2019
  updateMap("2019");

  d3.select("#year-select").on("change", function () {
    const selectedYear = d3.select(this).property("value");
    //Reset map & legend when year is changed
    svg.selectAll(".country").remove();
    svg.selectAll(".legend").remove();
    updateMap(selectedYear); // Update map with the selected year
  });
}

