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


    deathRateYear.selectionDispatcher().on(dispatchString, function (year) {
        deathBarGraph.updateSelection(year);
        deathRateYear.updateSelection(year);

        });
    });
        
    deathBarGraph.selectionDispatcher().on(dispatchString, function (year) {
        deathRateYear.updateSelection(year);
        deathBarGraph.updateSelection(year);
    });
})());



//     d3.csv("../data/combined_data.csv", (data) => {
//         const dispatchString = "selectionUpdated";
//         // console.log(data);
//         const yearSums = {};
//         for (let i = 0; i < data.length; i++) {
//             const row = data[i];
//             const year = row.Year;
//             console.log(year);
//             if (year >= 2000 && year <= 2019) {
//                 const totalDeaths = parseInt(row["Total Deaths"]);
//                 console.log(totalDeaths);
//                 if (year in yearSums) {
//                     yearSums[year] += totalDeaths;
//                 } else {
//                     yearSums[year] = totalDeaths;
//             }
//         }

//         // console.log(yearSums);
//         let deathRateYear = linechart()
//             .x(d => d.year)
//             .xLabel("YEAR")
//             .y(d => d.total)
//             .yLabel("TOTAL DEATHS")
//             .yLabelOffset(50)
//             .selectionDispatcher(d3.dispatch(dispatchString))
//             ("#linechart", yearSums);


//         deathRateYear.selectionDispatcher().on(dispatchString, function (year) {
//             deathRateYear.updateSelection(year);
//             d3.select("#selected-year").text(year);
//         });
//     }});
// })());
