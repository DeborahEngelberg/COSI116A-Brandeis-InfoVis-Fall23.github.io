function bargraph(){
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
    
    
      function graph(selector, data){
        let svg = d3.select(selector)
        .append("svg")
          .attr("preserveAspectRatio", "xMidYMid meet")
          .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
          .classed("svg-content", true);

       svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "white");

        //filter data for the death rate
        data = data.filter(d => d.causes != "Total");


        xScale
            .domain(data.map(data, xValue).keys())
            .range([0, width])
            .padding(0.1);

        yScale
            .domain([
                d3.min(data, d => yValue(d)),
                d3.max(data, d => yValue(d))
            ])
            .range([height, 0]);

        let xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));

        xAxis.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("fill", "white")
            .attr("transform", "rotate(-65)");

        xAxis.append("text")
            .attr("class", "axisLabel")
            .attr("transform", "translate(" + (width - 50) + ",-10)")
            .text(xLabelText);
        
        let yAxis = svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d3.format(".2s")));

        yAxis.append("text")
            .attr("class", "axisLabel")
            .attr("transform", "translate(" + yLabelOffsetPx + ", -12)")
            .text(yLabelText);

        yAxis.selectAll("text")
            .attr("fill", "white");

        let bars = svg.append("g")
            .selectAll(".bar")
            .data(data);
        
        bars.exit().remove();

        bars = bars.enter()
            .append("rect")
            .merge(bars)
            .attr("class", "bar")
            .attr("x", d => xScale(xValue(d)))
            .attr("y", d => yScale(yValue(d)))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(yValue(d)))
            .attr("fill", "steelblue")
            .on("click", function(d){
                d3.select(this).classed("selected", true);
                dispatcher.call("selectionChanged", this, d);
            });

            selectableElements = bars;
            return graph;
        }
        function X(d) {
            return xScale(xValue(d));
          }
        
          // The y-accessor from the datum
          function Y(d) {
            return yScale(yValue(d));
          }
        
          graph.margin = function (_) {
            if (!arguments.length) return margin;
            margin = _;
            return graph;
          };
        
          graph.width = function (_) {
            if (!arguments.length) return width;
            width = _;
            return graph;
          };
        
          graph.height = function (_) {
            if (!arguments.length) return height;
            height = _;
            return graph;
          };
        
          graph.x = function (_) {
            if (!arguments.length) return xValue;
            xValue = _;
            return graph;
          };
        
          graph.y = function (_) {
            if (!arguments.length) return yValue;
            yValue = _;
            return graph;
          };
        
          graph.xLabel = function (_) {
            if (!arguments.length) return xLabelText;
            xLabelText = _;
            return graph;
          };
        
          graph.yLabel = function (_) {
            if (!arguments.length) return yLabelText;
            yLabelText = _;
            return graph;
          };
        
          graph.yLabelOffset = function (_) {
            if (!arguments.length) return yLabelOffsetPx;
            yLabelOffsetPx = _;
            return graph;
          };
        
          // Gets or sets the dispatcher we use for selection events
          graph.selectionDispatcher = function (_) {
            if (!arguments.length) return dispatcher;
            dispatcher = _;
            return graph;
          };
        
          // Given selected data from another visualization 
          // select the relevant elements here (linking)
          graph.updateSelection = function (selectedData) {
            if (!arguments.length) return;
        
            // Select an element if its datum was selected
            selectableElements.classed("selected", d => {
              return selectedData.includes(d)
            });
          };
        
          return graph;
        }

        