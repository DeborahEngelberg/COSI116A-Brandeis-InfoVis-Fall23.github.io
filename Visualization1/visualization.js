// Immediately Invoked Function Expression to limit access to our 
// variables and prevent race conditions
((() => {

    // Load the data from a json file (you can make these using
    // JSON.stringify(YOUR_OBJECT), just remove the surrounding "")
    d3.json("vis1Data/causes_total_deaths.json", (data) => {
    
      // General event type for selections, used by d3-dispatch
      // https://github.com/d3/d3-dispatch
        const dispatchString = "selectionUpdated";

      // Create a line chart given x and y attributes, labels, offsets; 
      // a dispatcher (d3-dispatch) for selection events; 
      // a div id selector to put our svg in; and the data to use.
    let deathRateYear = linechart()
        .x(d => d.year)
        .xLabel("YEAR")
        .y(d => d.causes === "Total" ? d.deaths : null)
        .yLabel("DEATH RATES")
        .yLabelOffset(50)
        .selectionDispatcher(d3.dispatch(dispatchString))
        ("#linechart", data);
    
    deathRateYear.selectionDispatcher().on(dispatchString, function (year) {
        d3.select("#selected-year").text(year);
        });
    });
    
    let deathBarGraph = bargraph()
        .x(d => d.causes)
        .xLabel("CAUSES")
        .y(d => d.deaths)
        .yLabel("DEATHS")
        .yLabelOffset(50)
        .selectionDispatcher(d3.dispatch(dispatchString))
        ("#bargraph", data);


    // let deathTable = table()
    //     .selectionDispatcher(d3.dispatch(dispatchString))
    //     ("#table", data);

    // deathTable.selectionDispatcher().on(dispatchString, function(year) {
    //     d3.select("#selected-year").text(year);
    //     deathTable.update("#table", data, year);
    // });
}))();