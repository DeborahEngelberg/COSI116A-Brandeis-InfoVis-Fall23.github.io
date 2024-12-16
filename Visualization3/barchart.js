async function drawBarChart(country, dataType) {
    const data = await fetchData();

  // Filter data for the selected country
    const filteredData = data.filter(d => d.Country === country && d[dataType] !== null)
    .sort((a, b) => a.Year - b.Year);

  // Select the container and clear any existing content
    const svg = d3.select("#bar-chart");
    svg.selectAll("*").remove();

  // Define margins and dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const chart = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set scales
    const x = d3.scaleBand()
        .domain(filteredData.map(d => d.Year))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d[dataType]) || 0])
        .nice()
        .range([height, 0]);

  // Add axes
    chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    chart.append("g")
        .call(d3.axisLeft(y));

  // Add bars
    chart.selectAll(".bar")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.Year))
        .attr("y", d => y(d[dataType]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[dataType]))
        .attr("fill", "#F2B15F");

  // Add labels
    chart.selectAll(".label")
        .data(filteredData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x(d.Year) + x.bandwidth() / 2)
        .attr("y", d => y(d[dataType]) - 5)
        .attr("text-anchor", "middle")
        .text(d => d[dataType]);
}

// Update bar chart when dropdown changes
document.getElementById("country-select").addEventListener("change", () => {
    const country = document.getElementById("country-select").value;
    const dataType = document.getElementById("data-type-select").value;
    drawBarChart(country, dataType);
});

document.getElementById("data-type-select").addEventListener("change", () => {
    const country = document.getElementById("country-select").value;
    const dataType = document.getElementById("data-type-select").value;
    drawBarChart(country, dataType);
});
