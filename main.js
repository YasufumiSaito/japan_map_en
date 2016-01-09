//Merging two data
d3.csv("経済指標.csv", function(data) {
    d3.json("japan.json", function(json) {
        for(var i=0; i<data.length; i++) {
          for(var j=0; j<json.features.length; j++) {
            if( data[i].市区町村コード == json.features[j].properties.adm_code ) {
              json.features[j].properties.name = data[i].市区町村名;
              json.features[j].properties.index = data[i].経済指標;
              json.features[j].properties.manufacture = data[i].製造品;
              json.features[j].properties.retail = data[i].小売;
              json.features[j].properties.wholesale = data[i].卸売;
              json.features[j].properties.agri = data[i].農業;
              json.features[j].properties.labor = data[i].従業者;
              json.features[j].properties.business = data[i].事業所;
              json.features[j].properties.income = data[i].課税所得;
              json.features[j].properties.finance = data[i].財政力;
            }
          }
        }
	//Mapbox
	mapboxgl.accessToken = 'pk.eyJ1IjoieWFzdWZ1bWkiLCJhIjoiY2lqMGJ3a2ZrMDA3aXVhbHpjcnFxeXd5bCJ9.k8ogNDcxfwOLcRLibL1Ngw';
	var map = new mapboxgl.Map({
				container: "map",
				style: "mapbox://styles/yasufumi/cij0dvw4h00pk8ulxw22mwdsr",
				center: [138, 36],
				zoom: 7
	});

	//Overlaying D3 on the map
	var canvas = map.getCanvasContainer();
	var svg = d3.select(canvas).append("svg");

	var transform = d3.geo.transform({point:projectPoint});
	var path = d3.geo.path().projection(transform);

	//Sorting data
	var japan = json.features;

	var min = d3.min(japan, function(d,i){		
			return d.properties.index;		
	})
	var max = d3.max(japan, function(d,i){
		return d.properties.index;
	})
	var color = d3.scale.linear()
						.domain([min, 40, 45, 50, 55, 60, 65, 70, max])
						.range(['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']);
	//Drawing the layer map by D3
	var layer = svg.selectAll("path")
					.data(japan)
					.enter()
					.append("path")
					.attr("stroke", "#ccc")
					.attr("stroke-width", .7)
					.attr("fill", function(d,i){
						return color(d.properties.index);
					})
					.attr("fill-opacity", .7)
					.on("mouseover", function(d){
						//Show the tooltip
						var xPosition = d3.event.pageX;
						var yPosition = d3.event.pageY - 40;

						d3.select("#tooltip")
							.style("left", xPosition + "px")
							.style("top", yPosition + "px")
							.style("opacity", 1)
							.text(d.properties.laa);

						//Storing all the data
						var index = d.properties.index;
						var manu = parseInt(d.properties.manufacture);
						var retail = parseInt(d.properties.retail);
						var whole = parseInt(d.properties.wholesale);
						var agri = parseInt(d.properties.agri); 
						var labor = parseInt(d.properties.labor);
						var business = parseInt(d.properties.business);
						var income = parseInt(d.properties.income);
						var finance = parseInt(d.properties.finance);

						//Making new data arrays
						var data = [ manu, retail, whole, agri, labor, business, income, finance];
						var label = ["Manufacture","Retail", "Wholesale", "Agriculture", "Labor", "Business", "Taxed Income", "Finance"  ]
						
						//Prepare the svg to display the barcharts
						var w = 350;
						var h = 300;
						var margin = {
							top: 10,
							bottom:10,
							left:80,
							right:20
						};
						var width = w - margin.left - margin.right;
						var height = h - margin.top - margin.bottom;		
											
						var x = d3.scale.linear()
										.domain([0, 80])
										.range([0, width]);
						var y = d3.scale.ordinal()
										.domain(d3.range(data.length))
										.rangeBands([0, height]);
						
						var color = d3.scale.linear()
										.domain([30, 80])
										.range(["#ffb832", "#C13A5C"]);

						var barsvg = d3.select("#info2")
										.append("svg")
										.attr("width", w)
										.attr("height", h);
						var group = barsvg.selectAll("g")
										.data(data)
										.enter()
										.append("g")
										.attr("transform", "translate("+ margin.left+","+margin.top+")")
										.classed("bar", true);

						//Display the index number
						d3.select("#info").append("text")
										.classed("highlight", true)
										.text(index);

						//Display the barcharts
						group.append("rect")
									.attr("x", 0)
									.attr("y", function(d,i){
										return y(i) ; 
									})
									.attr("height",function(d,i){
										return y.rangeBand()-4;
									})
									.attr("width",0)
									.transition()
									.delay(function(d, i){ return i * 100})
									.duration(2000)
    								.ease('elastic')
									.attr("width", function(d){
										return x(d);
									})
									.style("fill",function(d,i){
										return color(d);
									});

						//Add the number label to each bar
						group.append("text")
								.attr("x", 0)
								.attr("y", function(d,i) {
									return y(i) + 20;
								})
								.text(function(d) {
									return d;
								})
								.style("fill", "white")
								.style("font-size", "1.2em")
								.style("font-wieght", 900)
								.transition()
								.delay(function(d, i){ return i * 100})
								.duration(2000)
								.ease('elastic') 
								.attr("x", function(d){
									return x(d) -20;
								});

						//Making yAxis text label
						var yAxis = d3.svg.axis()
											.scale(y)
											.orient("left")
											.tickFormat(function(d,i){
												return label[i];
											});

						barsvg.append('g')
									.attr("transform", "translate(" + margin.left + ","+ margin.top +")")
									.attr('class','axis')
									.call(yAxis);
					})
					.on("mouseout", function(){
						//Hide the tooltip
						d3.select("#tooltip")
							.style("opacity", 0);

						//Remove the variable svg elements
						d3.select("#info2 svg").remove("rect");
						d3.select(".highlight").remove();
					});

	//Show the legend
	d3.select("svg").append("g")
					.attr("class", "legendLinear")
					.attr("z-index", 15)
					.attr("transform", "translate(10,20)");

	var legendLinear = d3.legend.color()
						.shapeHeight(20)
						.shapeWidth(35)
						.shapeRadius(10)
						.cells([min, 40, 45, 50, 55, 60, 65, 70, max])
						.orient("horizontal")
						.labelAlign("start")
						.scale(color);	

	svg.select(".legendLinear")
			.call(legendLinear);

	//Update the svg layer each time
	function update() {
		layer.attr("d", path);
	}

	map.on("viewreset", update)
	map.on("movestart", function(){
		svg.classed("hidden", true);
	});
	map.on("rotate", function(){
		svg.classed("hidden", true);
	});
	map.on("moveend", function(){
		update();
		svg.classed("hidden",false);
	});

	update();

	function projectPoint(lon, lat) {
		var point = map.project(new mapboxgl.LngLat(lon, lat));
		this.stream.point(point.x, point.y);
	}

    });
});		