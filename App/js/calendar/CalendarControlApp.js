var CalendarControlApp = Class.extend({

    construct: function () {
        this.barMargin = {top: 50, right: 20, bottom: 20, left: 20};
        this.barCanvasWidth = 700;
        this.barCanvasHeight = 600;

        this.barWidth = 0;
        this.barHeight = 0;

        this.svgBar1 = null;
        this.svgBar2 = null;

        this.myTag = "";

    this.stationArray = ["Millennium Park", "Michigan Ave & Oak St", "Lake Shore Dr & Monroe St"];
        this.dateAsString = "07/20/2013 11";
    },


    /////////////////////////////////////////////////////////////

    startup: function (whereToRender) {
        this.myTag = whereToRender;
        this.updateScreen();
    },


    /////////////////////////////////////////////////////////////

    //Drawing the bar chart for Origin distribution for the first visualization group.
    drawBarChart1: function (error, data) {
        var top = this.barMargin.top,
            bottom = this.barMargin.bottom,
            left = this.barMargin.left,
            right = this.barMargin.right;
        var width = this.barCanvasWidth - left - right;
        var height = this.barCanvasHeight - top - bottom;
        var date = this.dateAsString;
        var dataCount = new Array(24);
    var ticker = this.dateAsString.split(" ")[1];

        var graph = this.svgBar1;

        graph.selectAll("*").remove();
    
    for(var i = 0; i < 24; i++){
        dataCount[i] = 0;
    }
        data.forEach(function (d) {
        d.starttime = new Date(d.starttime);
        dataCount[ d.starttime.getHours() ] += 1;
    });

        var x = d3.scale.linear().domain([0, dataCount.length]).range([0, width]);
        var y = d3.scale.linear().domain([0, 80+d3.max(dataCount)])
            .range([height, 0]);
        var color = d3.scale.ordinal()
            .range(["#98abc5"]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(d3.format(".2s"));
        xAxis.tickSize(-height).tickSubdivide(true);
        var line = d3.svg.line()
            .x(function (d, i) {
                return x(i);
            })
            .y(function (d) {

                return y(d);
            });

        graph
            .attr("width", width)
            .attr("height", height)
            .append("svg:g")
            .attr("transform", "translate(" + right + "," + top + ")");
        xAxis.ticks(23);


        graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("y", 50)
            .attr("x", width / 2)
            .attr("dx", ".71em")
            .style("text-anchor", "middle")
            .text("Time Interval");

    graph.selectAll("label")
         .data(dataCount.filter(function(d,i){
               return i === (+ticker);
          }))
         .enter()
         .append("text")
         .text(function(d){
              return d;
         })
         .attr("x", function(d){
        return x(ticker);
        })
         .attr("y", function(d){
        return y(d) ;
        })
         .style("font-size", "120%")
             .style("font-color", "steelblue");

        graph.append("svg:g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("#Active Bikes");

        graph.append("svg:path").attr("d", line(dataCount));

    graph.selectAll(".chart-title")
        .data(data)
       .enter()
       .append("text")
       .attr("x", width/2)
       .attr("y", height-500)
       .attr("text-anchor","middle")
       .attr("font-family", "sans-serif")
       .attr("font-size","20pt")
       .text("Overall Active Rides Line Chart");

    },

    /////////////////////////////////////////////////////////////

    //Drawing the bar chart for Origin distribution for the second visualization group.
    drawBarChart2: function (error, data) {
        var top = this.barMargin.top,
            bottom = this.barMargin.bottom,
            left = this.barMargin.left,
            right = this.barMargin.right;
        var width = this.barCanvasWidth;
        var height = this.barCanvasHeight;
        var date = this.dateAsString;

        var Stations = this.stationArray;
    //var dataCount = new Array(25);

        var svg = this.svgBar2;

        svg.selectAll("*").remove();

    /*for(var i = 0; i < 25; i++){
        dataCount[i] = {};
    }
    for(var i = 0; i < 25; i++){
        dataCount[i].intervals = i;
        dataCount[i][Stations[0]] = 0;
        dataCount[i][Stations[1]] = 0;
        dataCount[i][Stations[2]] = 0;
    }
        Stations.forEach(function(s,i){
            data.forEach(function (d) {
                d.starttime = new Date(d.starttime);
            if(d.from_station_name === s){
                dataCount[ d.starttime.getHours() ].intervals = d.starttime.getHours();
                dataCount[ d.starttime.getHours() ][Stations[i]] += 1;
            }

            });
        });
        
    dataCount.forEach(function(d) {
        d.intervals = +d.intervals;
        d[Stations[0]] = +d[Stations[0]];
        d[Stations[1]] = +d[Stations[1]];
        d[Stations[2]] = +d[Stations[2]];
    });*/

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
            .range([height, 0]);    
    
    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");


    var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { 
            return x(d.intervals); 
             })
            .y(function(d) { 
                        return y(d.occurrences); 
                    });

    color.domain(d3.keys(data[0]).filter(function(key) { 
        return key !== "intervals";
    }));

    data.forEach(function(d) {
        d.intervals = parseDate(d.intervals);
    });

    var stations = color.domain().map(function(name) {
        return {
                name: name,
                values: data.map(function(d) {
                    return {intervals: d.intervals, occurrences: +d[name]};
                })
            };
    });

    x.domain(d3.extent(data, function(d) { return d.intervals; }));

    y.domain([
    d3.min(stations, function(c) { 
        return d3.min(c.values, function(v) { 
            return v.occurrences; 
        }
    ); }),
    d3.max(stations, function(c) { 
        return d3.max(c.values, function(v) { 
            return v.occurrences; 
        }
    ); 
    }) ]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Active Bikes");

    var station = svg.selectAll(".station")
        .data(stations)
        .enter().append("g")
        .attr("class", "station");

    station.append("path")
        .attr("class", "line")
        .attr("d", function(d) { 
            return line(d.values); 
        })
        .style("stroke", function(d) { 
            return color(d.name); 
        });

    station.append("text")
        .datum(function(d) { 
            return {
                name: d.name, value: d.values[d.values.length - 1]
            }; 
        })
        .attr("transform", function(d) { 
            return "translate(" + x(d.value.intervals) + "," + y(d.value.occurrences) + ")"; 
        })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { 
            return d.name; 
        });
    },


    /////////////////////////////////////////////////////////////

    updateWindow: function () {
        var xWin, yWin;

        xWin = d3.select(this.myTag).style("width");
        yWin = d3.select(this.myTag).style("height");

        this.barWidth = xWin;
        this.barHeight = yWin;

        var totalBarSizeX = this.barCanvasWidth + this.barMargin.left + this.barMargin.right;
        var totalBarSizeY = this.barCanvasHeight + this.barMargin.top + this.barMargin.bottom;

        switch (this.myTag) {
            case "#Vis1":
                this.svgBar1 = d3.select(this.myTag).append("svg:svg")
                    .attr("width", this.barWidth)
                    .attr("height", this.barHeight)
                    .attr("viewBox", "" + -this.barMargin.left + " 0 " + totalBarSizeX + " " + this.barCanvasHeight);
                break;
            case "#Vis2":
                this.svgBar2 = d3.select(this.myTag).append("svg:svg")
                    .attr("width", this.barWidth)
                    .attr("height", this.barHeight)
                    .attr("viewBox", "" + -this.barMargin.left + " 0 " + totalBarSizeX + " " + this.barCanvasHeight);
                break;
        }
    },

    /////////////////////////////////////////////////////////////

    updateData: function () {
    var unformattedDate = this.dateAsString.split(" ");
    var date = new Date(unformattedDate[0]);
        var fileToLoad = "App/json/Map/trips_by_day/trips_data_by_day_" + this.monthFormated(date) + "_" + this.dayFormated(date) + "_" + date.getFullYear() + ".csv";
        switch (this.myTag) {
            case "#Vis1":
                this.inDataCallbackFunc = this.drawBarChart1.bind(this);
                d3.csv(fileToLoad, this.inDataCallbackFunc);
                break;
            case "#Vis2":
                this.inDataCallbackFunc = this.drawBarChart2.bind(this);
                d3.csv(fileToLoad, this.inDataCallbackFunc);
                break;
        }
    },

    /////////////////////////////////////////////////////////////

    updateScreen: function () {
        this.updateWindow();
        this.updateData();
    },

    setDateAndTime: function (DateString) {
        this.dateAsString = DateString;

        this.myTag = "#Vis1";
        this.updateData();

        //this.myTag = "#Vis2";
        //this.updateData();
    },

    updateStation: function (element) {
    var index = element.selectedIndex;
        var selectedItems = element.selectedOptions.valueOf(0);
        for(var index = 0; index < selectedItems.length; index++){
        this.stationArray.push(selectedItems[index].value);
        }
    },

    monthFormated: function(date){
    month = date.getMonth();
        return month < 10 ? "0" + (month+1) : month+1;
    },

    dayFormated: function(date){
    day = date.getDate();
        return day < 10 ? "0" + (day) : day;
    },

   /* convertToDate: function (dateTime,number){
    var year = dateTime.getFullYear();
    var month = dateTime.getMonth();
    var day = dateTime.getDate();
    var date = new Date(year,month,day,number,0,0);
    return date;
    },*/

});