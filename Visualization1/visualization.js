// Immediately Invoked Function Expression to limit access to our 
// variables and prevent race conditions
((() => {

    // Load the data from a json file
    d3.json("vis1Data/alc_to_death.json", (data) => {
        const dispatchString = "selectionUpdated";
        
    // Create a line chart given x and y attributes, labels, offsets; 
    // a dispatcher (d3-dispatch) for selection events; 
    // a div id selector to put our svg in; and the data to use.
    let deathRateYear = linechart()
        .x(d => d.year)
        .xLabel("YEAR")
        .y(d => d.deaths)
        .yLabel("DEATH RATES")
        .yLabelOffset(50)
        .selectionDispatcher(d3.dispatch(dispatchString))
        ("#linechart", data);
    
    // Create a bar graph given x and y attributes, labels, offsets;
    // a dispatcher (d3-dispatch) for selection events;
    // a div id selector to put our svg in; and the data to use.
    let deathBarGraph = bargraph()
        .x(d => d.year)
        .xLabel("YEAR")
        .y(d =>  d.alcohol)
        .yLabel("TOTAL ALCOHOL CONSUMPTION (Liters per capita)")
        .yLabelOffset(50)
        .selectionDispatcher(d3.dispatch(dispatchString))
        ("#bargraph", data);

    // Updates the charts based on the year selected from the slider
    window.updateLineChartSelection = function(year) {
        const selectedData = data.filter(d => d.year === year);
        if (selectedData.length > 0) {
            deathRateYear.updateSelection(selectedData[0]);
        }
    };
    window.updateBarGraphSelection = function(year) {
        const selectedData = data.filter(d => d.year === year);
        if (selectedData.length > 0) {
            deathBarGraph.updateSelection(selectedData[0]);
        }
    };

    // Connects the line chart and bar graph to each other
    deathRateYear.selectionDispatcher().on(dispatchString, function (selectedData) {
        deathBarGraph.updateSelection(selectedData);
        });
        
    deathBarGraph.selectionDispatcher().on(dispatchString, function (selectedData) {
        deathRateYear.updateSelection(selectedData);
        });
    });
})());
