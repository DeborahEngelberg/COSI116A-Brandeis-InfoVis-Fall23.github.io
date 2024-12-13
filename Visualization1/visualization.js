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
    
    let deathBarGraph = bargraph()
        .x(d => d.year)
        .xLabel("YEAR")
        .y(d =>  d.alcohol)
        .yLabel("TOTAL ALCOHOL CONSUMPTION (Liters per capita)")
        .yLabelOffset(50)
        .selectionDispatcher(d3.dispatch(dispatchString))
        ("#bargraph", data);

         // Expose the updateSelection methods
        // window.updateLineChartSelection = function(year) {
        //     console.log("sure", year);
        //     console.log("data", data(d => d.year));
        //     const selectedData = data.filter(d => d.year === year);
        //     console.log("selected data", selectedData);
        //     if (selectedData.length > 0) {
                
        //         deathRateYear.updateSelection(selectedData[0]);
        //     }
        // };

        // window.updateLineChartSelection = function(year) {
        //     deathRateYear.updateSelection(year);
        //     console.log("sure", year);
        // }


        // window.updateBarGraphSelection = function(year) {
        //     const selectedData = data.filter(d => d.year === year);
        //     if (selectedData.length > 0) {
        //         deathBarGraph.updateSelection(selectedData[0]);
        //     }
        // };

         // Expose the updateSelection methods
        window.updateLineChartSelection = function(year) {
            console.log("Year passed to updateLineChartSelection:", year);
            const selectedData = data.filter(d => d.year === year);
            console.log("Filtered data for line chart:", selectedData);
            if (selectedData.length > 0) {
                deathRateYear.updateSelection(selectedData[0]);
            }
        };

        window.updateBarGraphSelection = function(year) {
            console.log("Year passed to updateBarGraphSelection:", year);
            const selectedData = data.filter(d => d.year === year);
            console.log("Filtered data for bar graph:", selectedData);
            if (selectedData.length > 0) {
                deathBarGraph.updateSelection(selectedData[0]);
            }
        };
    deathRateYear.selectionDispatcher().on(dispatchString, function (selectedData) {
        deathBarGraph.updateSelection(selectedData);
        
        });
        
    deathBarGraph.selectionDispatcher().on(dispatchString, function (selectedData) {
        deathRateYear.updateSelection(selectedData);
        });
    });
})());
