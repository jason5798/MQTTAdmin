var express = require('express');
var router = express.Router();
var DeviceDbTools = require('../models/deviceDbTools.js');
var ListDbTools = require('../models/listDbTools.js');
var settings = require('../settings');
var JsonFileTools =  require('../models/jsonFileTools.js');
var path = './public/data/finalList.json';
var path2 = './public/data/test.json';
var path3 = './public/data/gwMap.json';
var hour = 60*60*1000;
var type = 'gps';

module.exports = function(app) {
  app.get('/', function (req, res) {
  	    var now = new Date().getTime();
		type = req.query.type;
		if(type === undefined){
			var typeObj = JsonFileTools.getJsonFromFile(path2);
			if(typeObj)
				type = typeObj.type;
			else{
				var json = {"type":'pir'};
				JsonFileTools.saveJsonToFile(path2,json);
			}
		}else if(type != 'gateway'){ //If press device button in gateway page that need update type
			var json = {"type":type};
			JsonFileTools.saveJsonToFile(path2,json);
		}
		
		ListDbTools.findByName('finalist',function(err,lists){
			if(err){
				res.render('index', { title: 'Index',
					success: '',
					error: err.toString(),
					finalList:null,
					type:type
				});
			}else{
				

				req.session.type = type;
				var finalList = lists[0]['list'][type];
				//console.log('finalList :'+JSON.stringify(finalList));
				if(finalList){
					var keys = Object.keys(finalList);
					console.log('Index finalList :'+keys.length);
					for(var i=0;i<keys.length ;i++){
						//console.log( i + ') mac : ' + keys[i] +'=>' + JSON.stringify(finalList[keys[i]]));
						//console.log(i+' result : '+ ((now - finalList[keys[i]].timestamp)/hour));
						finalList[keys[i]].overtime = true;
						if( ((now - finalList[keys[i]].timestamp)/hour) < 1 )  {
							finalList[keys[i]].overtime = false;
						}
					}
				}else{
					finalList = null;
				}

				res.render('index', { title: 'Index',
					success: null,
					error: null,
					finalList:finalList,
					type:type
				});
			}
		});
  });

  app.get('/devices', function (req, res) {
	var mac = req.query.mac;
	var type = req.query.type;
	var date = req.query.date;
	var option = '1';
	req.session.type = type;
	DeviceDbTools.findDevicesByDate(date,mac,Number(option),'desc',function(err,devices){
		if(err){
			console.log('find name:'+find_mac);
			return;
		}
		var length = 15;
		if(devices.length<length){
			length = devices.length;
		}

		/*devices.forEach(function(device) {
			console.log('mac:'+device.date + ', data :' +device.data);
		});*/

		res.render('devices', { title: 'Device',
			devices: devices,
			success: req.flash('success').toString(),
			error: req.flash('error').toString(),
			type:req.session.type,
			mac:mac,
			date:date,
			option:option,
			length:length
		});
	});
  });

  
  app.get('/gateway', function (req, res) {
        var macGwIDMap = JsonFileTools.getJsonFromFile(path3);
		var macList = Object.keys(macGwIDMap);
		res.render('gateway', { title: 'Gateway',
			success: null,
			error: null,
			macList:macList,
			option:1
		});
  });
};