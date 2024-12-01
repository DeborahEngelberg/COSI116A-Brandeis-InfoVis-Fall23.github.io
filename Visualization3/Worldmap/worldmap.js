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
  .defer(d3.json, "../Worldmap/geo.json")
  .defer(d3.csv, "../data/alc00-09.csv")
  .defer(d3.csv, "../data/alc09-19.csv")
  .defer(d3.csv, "../data/alc80-99.csv")
  .defer(d3.csv, "../data/birth-death.csv")
  .defer(d3.csv, "../data/cause_of_deaths.csv")
  .await(ready);

function ready(error, geoData, data00_09, data09_19, data80_99, finaldata) {
  if (error) {
    console.error("Error loading the data:", error);
    return;
  }

  // Function to update the map based on the selected year
  function updateMap(year) {
    const data = {};
    //for alc00-09.csv, alc09-19, alc80-99 country columns are labeled "Countries, territories and areas"
    //for birth-death.csv country columns are labeled "Entity"
    // for cause_of_deaths.csv country columns are labeled "Country/Territory"
    // for final_data.csv country columns are labeled "Country"
    // Get the data for the selected year


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
    //the above puts together the data for the selected year, but I want to put together the data for the selected year, country, and data type.
    //i would assume its done as separating into three sections. each section starts with identifying the type of data we are looking at. then inside of that section we look at the year and the country. 
    
    // Create a color scale
  
    
    
    const colorScale = d3.scaleQuantize()
      .domain([0, d3.max(Object.values(data))])
      .range([
        "#F2B15F, #FFFFFF"
         //however, once a country is clicked. all other countries should turn white
      ]);
      

    // Create a map. if country is clicked, then add the color. 
    svg.selectAll(".country")
      .data(geoData.features)
      .enter().append("path")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", d => {
        const value = data[d.properties.name];
        return value ? colorScale(value) : "#ccc";
      })
      .style("stroke", "grey")
      .style("stroke-width", "0.5px")
      .on("mousedown", function(d){
        tooltip.transition()
          .duration(90000)
          .style("opacity", 0);
          
        tooltip.html(d.properties.name + "<br/>" + year + ": " + (data[d.properties.name] || "No data"))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
          
      }) //needs to be so that when something is clicked, it will highlight that country and then that country outline will pop up below with a sentence or two summarizing the averages etc. 
      
      .on("mouseover", function(d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(d.properties.name + "<br/>" + year + ": " + (data[d.properties.name] || "No data"))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

   

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - legendWidth - 20},${height - legendHeight - 20})`);
    legend.selectAll("rect")
      .data(legendData)
      .enter().append("rect")
      .attr("x", d => {
        const x = legendScale(d[0]);
        // console.log("Legend rect x:", x); 
        return x;
      })
      .attr("y", 0)
      .attr("width", d => {
        const width = legendScale(d[1]) - legendScale(d[0]);
        // console.log("Legend rect width:", width);
        return width;
      })
      .attr("height", legendHeight)
      .style("fill", d => colorScale(d[0]));
    legend.append("g")
      .attr("transform", `translate(0,${legendHeight})`)
      .call(legendAxis);
  }

  // Set default year to 2019
  updateMap("2019");

  d3.select("#year-select").on("change", function() {
    const selectedYear = d3.select(this).property("value");
    //Reset map & legend when year is changed
    svg.selectAll(".country").remove(); 
    svg.selectAll(".legend").remove(); 
    updateMap(selectedYear); // Update map with the selected year
  });
  d3.select("#country-select").on("change", function() {
    const selectedCountry = d3.select(this).property("value");
    //Reset map & legend when country is changed
    svg.selectAll(".country").remove(); 
    svg.selectAll(".legend").remove(); 
    
    updateMap(selectedCountry); // Update map with the selected country
  });
  d3.select("#data-type-select").on("change", function() {
    const selectedDataType = d3.select(this).property("value");
    //Reset map & legend when datatype is changed 
    updateMap(selectedDataType); // Update map with the selected datatype
  });
}

  