'use strict';
var https= require("https");

var getWeather=function getWeather(area, callback){
	//area=area||{'nyc':'2459115'};
	var urljson="https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D"+
					area.nyc+"&format=json&diagnostics=true&callback=";
	var request = https.request(urljson, function(response){
		var body='', json, weather={};
		response.on("data", function(chunk){
			body+= chunk.toString('utf8');
		});
		response.on("end",function(){
			json= JSON.parse(body);
		   	//console.log(json.query.results.channel.item.condition);
		   	weather=json.query.results.channel.item.condition;
			callback(weather);	
		});
	});
	request.end();
};

exports.get= function (req, rep){
	var area={'nyc':'2459115'};
	getWeather(area,function(weather){
		rep.jsonp(weather);
	});
};