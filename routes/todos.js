var express = require('express');
var router = express.Router();
//var UnitDbTools = require('../models/unitDbTools.js');
var DeviceDbTools = require('../models/deviceDbTools.js');
var JsonFileTools =  require('../models/jsonFileTools.js');
var ListDbTools = require('../models/listDbTools.js');
var moment = require('moment');
var typepPath = './public/data/test.json';
var hour = 60*60*1000;

router.route('/devices')

	// create a bear (accessed at POST http://localhost:8080/bears)
	/*.post(function(req, res) {

		var bear = new Bear();		// create a new instance of the Bear model
		bear.name = req.body.name;  // set the bears name (comes from the request)

		bear.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'Bear created!' });
		});

	})*/

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var mac    = req.query.mac;
		var option = req.query.option;
		var mdate  = req.query.mdate;
		var flag = req.query.flag;
		var gwId     = req.query.gwId;
		if(mac){
			DeviceDbTools.findDevicesByDate(mdate,mac,Number(option),'desc',function(err,devices){
			    if (err)
					return res.send(err);
				if(flag){
					return res.json({flag:flag,devices:devices});
				}
				return res.json(devices);
			});
		}else if(gwId){
			DeviceDbTools.findDevicesByGWID(mdate,gwId,Number(option),'desc',function(err,devices){
			    if (err)
					return res.send(err);
				if(flag){
					var obj = {flag:flag,devices:devices};
					return res.json(obj);
				}
				return res.json(devices);
			});
		}else{
			return res.json({});
		}
	});

router.route('/devices/:mac')

	// get the bear with that id
	.get(function(req, res) {
		DeviceDbTools.findByMac(req.params.mac, function(err, devices) {
			if (err)
				return res.send(err);
			return res.json(devices);
		});
	})

	// update the bear with this id
	.put(function(req, res) {
		/*Bear.findById(req.params.bear_id, function(err, bear) {

			if (err)
				res.send(err);

			bear.name = req.body.name;
			bear.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Bear updated!' });
			});

		});*/
	})

	// delete the bear with this id
	.delete(function(req, res) {
		/*Bear.remove({
			_id: req.params.bear_id
		}, function(err, bear) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});*/
	});

router.route('/lists')

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var name    = req.query.name;
		var type    = req.query.type;
		var flag    = req.query.flag;
		var json    = {type:req.query.type};
		var now = new Date().getTime();

		var typeObj = JsonFileTools.getJsonFromFile(typepPath);
		if(typeObj){
			typeObj[flag] = type;
			JsonFileTools.saveJsonToFile(typepPath,typeObj);
		}
		
		ListDbTools.findByFlagName(flag,'finalist',function(err,json){
			if (err)
				return res.send(err);
			var flag = json.flag;
			var lists = json.lists;
			if(lists.length>0 ){
				if(type){
					var finalList = lists[0]['list'][type];
				}else{
					var finalList = lists[0]['list'];
				}

				if(finalList === undefined ){
					finalList = null;
				}else{
					var overtime = 1;
					if(type==='pir'){
						overtime = 6;
					} else if(type==='flood'){
						overtime = 8;
					}
					console.log('finalList :'+JSON.stringify(finalList));

					var keys = Object.keys(finalList);

					for(var i=0;i<keys.length ;i++){
						//console.log(i+' timestamp : '+ finalList[keys[i]].timestamp);
						//console.log(i+' result : '+ ((now - finalList[keys[i]].timestamp)/hour));
						finalList[keys[i]].overtime = true;
						if( ((now - finalList[keys[i]].timestamp)/hour) < overtime )  {
							finalList[keys[i]].overtime = false;
						}
					}
				}
				return res.json({flag:flag,lists:finalList});

			}else{
				return res.json({});
			}

		});
	});

module.exports = router;