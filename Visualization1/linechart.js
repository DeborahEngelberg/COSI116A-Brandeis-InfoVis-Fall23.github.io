// Set up the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const chartWidth = 800 - margin.left - margin.right;
const chartHeight = 400 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
const svgLineChart = d3.select("#linechart")
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the CSV data --- FIGURE OUT WHAT DATA TO USE
// d3.csv("../data/birth-death.csv", function(error, data) {
//     if (error) throw error;

//     // Format the data
//     data.forEach(d => {
//         d.year = +d.year;
//         d.deaths = +d.deaths;
//     });

    // Set up the scales
    // const x = d3.scaleLinear()
    //     .domain(d3.extent(data, d => d.year))
    //     .range([0, chartWidth]);

    // const y = d3.scaleLinear()
    //     .domain([0, d3.max(data, d => d.deaths)])
    //     .range([chartHeight, 0]);

    // Add the X axis
    svgLineChart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add the Y axis
    svgLineChart.append("g")
        .call(d3.axisLeft(y));

    // Add the line
    svgLineChart.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.year))
            .y(d => y(d.deaths))
        );
// });