/* The following code was heavily referenced from Assignment 4 and
altered in a few places to create a bar graph*/

// Initialize a line chart. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function bargraph(){
  // Based on Mike Bostock's margin convention
  // https://bl.ocks.org/mbostock/3019563
    let margin = {
        top: 60,
        left: 50,
        right: 30,
        bottom: 35
      },
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      xValue = d => d[0],
      yValue = d => d[1],
      xLabelText = "",
      yLabelText = "",
      yLabelOffsetPx = 0,
      xScale = d3.scaleBand(),
      yScale = d3.scaleLinear(),
      ourBrush = null,
      selectableElements = d3.select(null),
      dispatcher;
    
      function chart(selector, data){
        let svg = d3.select(selector)
        .append("svg")
          .attr("preserveAspectRatio", "xMidYMid meet")
          .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
          .classed("svg-content", true);

        svg = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        

        // Define scales
        xScale
          .domain(d3.map(data, xValue).keys())
          .rangeRound([0, width])
          .paddingInner(0.05);

        yScale
          .domain([
            d3.min(data, d => yValue(d)),
            d3.max(data, d => yValue(d))
          ])
          .rangeRound([height, 0]);

        // X axis
        let xAxis = svg.append("g")
          .attr("transform", "translate(0," + (height) + ")")
          .call(d3.axisBottom(xScale))

        xAxis.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("fill", "black")
            .attr("transform", "rotate(-65)");

        xAxis.append("text")
            .attr("class", "axisLabel")
            .text(xLabelText)
            .attr("x", -25)
            .attr("transform", "rotate(-65)");

        let yAxis = svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d3.format(".3s")));
    
        yAxis.append("text")
            .attr("class", "axisLabel")
            .attr("transform", "translate(" + (yLabelOffsetPx + 170) + ", -12)")
            .text(yLabelText);

      let bars = svg.selectAll(".bar")
        .data(data)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x",X)
          .attr("y",Y)
          .attr("width", xScale.bandwidth())
          .attr("height", d => height - yScale(yValue(d)))
          .attr("fill", "steelblue")

      selectableElements = bars;
      svg.call(brush);

       // Highlight bars when brushed
      function brush(g) {
      const brush = d3.brush()
        .on("start brush", highlight)
        .on("end", brushEnd)
        .extent([
          [-margin.left, -margin.bottom],
          [width + margin.right, height + margin.top]
        ]);

      ourBrush = brush;

      g.call(brush); // Adds the brush to this element

      // Highlight the selected circles.
      function highlight() {
        if (d3.event.selection === null) return;
        const [
          [x0, y0],
          [x1, y1]
        ] = d3.event.selection;
        bars.classed("selected", d => {
          const x = X(d);
          const y = Y(d);
          const barWidth = xScale.bandwidth();
          const barHeight = height - y;
          return x0 <= x + barWidth && x <= x1 && y0 <= y + barHeight && y <= y1;
        });

        // Get the name of our dispatcher's event
        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

        // Let other charts know
        dispatcher.call(dispatchString, this, svg.selectAll(".selected").data());
      }
      
      function brushEnd() {
        // We don't want an infinite recursion
        if (d3.event.sourceEvent.type != "end") {
          d3.select(this).call(brush.move, null);
        }
      }
    }
    return chart;
  }
  function X(d) {
    return xScale(xValue(d));
  }

  // The y-accessor from the datum
  function Y(d) {
    return yScale(yValue(d));
  }

  chart.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function (_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function (_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.xLabel = function (_) {
    if (!arguments.length) return xLabelText;
    xLabelText = _;
    return chart;
  };

  chart.yLabel = function (_) {
    if (!arguments.length) return yLabelText;
    yLabelText = _;
    return chart;
  };

  chart.yLabelOffset = function (_) {
    if (!arguments.length) return yLabelOffsetPx;
    yLabelOffsetPx = _;
    return chart;
  };

  // Gets or sets the dispatcher we use for selection events
  chart.selectionDispatcher = function (_) {
    if (!arguments.length) return dispatcher;
    dispatcher = _;
    return chart;
  };

  // Given selected data from another visualization 
  // select the relevant elements here (linking)
  chart.updateSelection = function (selectedData) {
    if (!arguments.length) return;

     // Check if selectedData is an array (from slider) or an object (from user interaction)
    if (Array.isArray(selectedData)) {
      // From slider
      selectableElements.classed("selected", d => {
          return selectedData.some(sd => sd.year === d.year);
      });
  } else {
      // From user interaction
      selectableElements.classed("selected", d => {
          return d.year === selectedData.year;
      });
  }
  };

  return chart;
}