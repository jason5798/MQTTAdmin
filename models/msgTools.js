var moment = require('moment');
var ParseBlaziong =  require('./parseBlaziong.js');
var ParseDefine =  require('./parseDefine.js');
var JsonFileTools =  require('./jsonFileTools.js');
var listDbTools =  require('./listDbTools.js');
var settings =  require('../settings.js');
var mData,mMac,mRecv,mDate,mTimestamp,mType,mExtra ;
var obj;
var overtime = 24;
var hour = 60*60*1000;
var isNeedGWMac = settings.isNeedGWMac;//For blazing
//Save data to file path
var path = './public/data/finalList.json';
var path2 = './public/data/gwMap.json';
var path3 = './public/data/test.json';
//Save data
var finalList = {};
var macGwIdMapList;//For gateway map (key:mac value:id array)
var gwIdMacMapList;//For gateway map (key:id value:mac)
var mac_tag_map = {};
var type_tag_map = {};//For filter repeater message key:mac+type value:tag
var type_time_map = {};
//Save user choice device type,GW MAC
var selectType,selectMac;

function init(){
    //finalList = JsonFileTools.getJsonFromFile(path);
    listDbTools.findByName('finalist',function(err,lists){
        if(err)
            return;
        finalList = lists[0].list;
    });
}

function initMap(){
    macGwIdMapList = JsonFileTools.getJsonFromFile(path2);
    gwIdMacMapList = getMapList(macGwIdMapList);
}

/*
This function is GW map betwween id and mac transformer
Source is GW maap (key:mac, value:id array)
Transform to different map (key:id, value:)
 */
function getMapList(list){
    var keys = Object.keys(list);
    var json = {};
    for(key in list){
       json[list[key][0]]=key ;
       json[list[key][1]]=key ;
    }
    return json;
}

init();

exports.parseMsg = function (msg) {
    console.log('MQTT message :\n'+JSON.stringify(msg));
    if(getType(msg) === 'array'){
        obj = msg[0];
        console.log('msg array[0] :'+JSON.stringify(obj));
    }else if(getType(msg) != 'object'){
        try {
			obj = JSON.parse(msg.toString());
		}
		catch (e) {
			console.log('msgTools parse json error message #### drop :'+e.toString());
			return null;
		}
    }else{
        obj = msg;
    }
    //Get data attributes
    mData = obj.data;
    mMac  = obj.macAddr;
    mDate = moment(mRecv).format('YYYY/MM/DD HH:mm:ss');
    mExtra = obj.extra;
    if(obj.recv){
        mRecv = obj.recv;
    }else
    {
        mRecv = obj.time;
    }
    mTimestamp = new Date(mRecv).getTime();


    //Parse data
    if(mExtra.fport>0 ){
        mInfo = parseBlazingMessage(mData,mExtra.fport);
    }else{
        if(isSameTagCheck(mType,mMac,msg.recv))
            return null;
        if(mType.indexOf('aa')!=-1)
            mInfo = parseDefineMessage(mData,mType);
    }

    var msg = {mac:mMac,data:mData,recv:mRecv,date:mDate,extra:mExtra,timestamp:mTimestamp};
    if(mExtra.fport>0 ){
        saveBlazingList(mExtra.fport,mMac,msg)
    }else{
        finalList[mMac]=msg;
    }

    if(mInfo){
        console.log('**** '+msg.date +' mac:'+msg.mac+' => data:'+msg.data+'\ninfo:'+JSON.stringify(mInfo));
        msg.information=mInfo;
    }

    return msg;
}

exports.setFinalList = function (list) {
    finalList = list;
}

exports.getFinalList = function () {
    return finalList;
}

exports.saveFinalListToFile = function () {
    /*var json = JSON.stringify(finalList);
    fs.writeFile(path, json, 'utf8');*/
    JsonFileTools.saveJsonToFile(path,finalList);
}

exports.getMacGwIdMap = function () {
    return macGwIdMapList;
}

exports.saveMacGwIdMapToFile = function () {

    JsonFileTools.saveJsonToFile(path2,finalList);
}

exports.getGwIdByMac = function (mac) {
    selectMac = mac;
    if(macGwIdMapList === undefined){
        initMap();
    }
    return macGwIdMapList[mac];
}



exports.getTypeMap = function () {
    return JsonFileTools.getJsonFromFile(path3);
}

exports.saveTypeMapToFile = function (flag,type) {
    try {
        var typeObj = JsonFileTools.getJsonFromFile(path3);
    }
    catch (e) {
        console.log('msgTools saveTypeMapToFile getJsonFromFile '+path3+' error message #### :'+e.toString());
        typeObj = {};
    }
    typeObj[flag] = type;
    JsonFileTools.saveJsonToFile(path3,typeObj);
}


exports.getDevicesData = function (type,devices) {
    var array = [];
    if(isNeedGWMac){
        //For blazing
        if(gwIdMacMapList === undefined || gwIdMacMapList === null){
            initMap();
        }
    }

    if(devices){
        for (var i=0;i<devices.length;i++)
        {
            //if(i==53){
              //console.log( '#### '+devices[i].mac + ': ' + JSON.stringify(devices[i]) );
            //}
            array.push(getDevicesArray(devices[i],i,type));
        }
    }

    var dataString = JSON.stringify(array);
    if(array.length===0){
        dataString = null;
    }
    return dataString;
};

function getDevicesArray(obj,item,type){

    var arr = [];

    if(type === 'gateway'){
        arr.push(obj.macAddr);
    }else{
        arr.push(item);
    }
    arr.push(obj.date);
    arr.push(obj.data);
    if(type !== 'gateway'){
        if(obj.info != undefined){
            if(type === 'pir'){
                if(obj.info.trigger != undefined && obj.info.trigger != 9  ){
                    arr.push(obj.info.trigger);
                }else{
                    arr.push('X');
                }
            }else if(type === 'gps'){

                if(obj.info.GPS_N  != undefined && obj.info.GPS_N != 9  ){
                    arr.push(obj.info.GPS_N);
                }else{
                    arr.push('X');
                }
                if(obj.info.GPS_E  != undefined && obj.info.GPS_E != 9  ){
                    arr.push(obj.info.GPS_E);
                }else{
                   arr.push('X');
                }

            }else if(type === 'pm25'){

                if(obj.info.value  != undefined && obj.info.value != 9  ){
                    arr.push(obj.info.value);
                }else{
                    arr.push('X');
                }
                if(obj.info.BATL  != undefined && obj.info.BATL != 9  ){
                    arr.push(obj.info.BATL);
                }else{
                    arr.push('X');
                }

            }else if(type === 'flood'){

                if(obj.info.trigger  != undefined && obj.info.trigger != 9  ){
                    arr.push(obj.info.trigger);
                }else{
                    arr.push('X');
                }
                if(obj.info.BATL  != undefined && obj.info.BATL != 9  ){
                    arr.push(obj.info.BATL);
                }else{
                    arr.push('X');
                }

            }
        }else{
            if(type == 'pir'){
                arr.push('X');
            } else if(type != 'others') {
                arr.push('X');
                arr.push('X');
            }
        }
    }


    arr.push(obj.extra.rssi);
    arr.push(obj.extra.snr);
    arr.push(obj.extra.sf);
    if(type === 'gateway'){
        arr.push(obj.extra.fport);
    }
    arr.push(obj.extra.channel);
    arr.push(obj.extra.gwid);

    if(type !== 'gateway'){
        var gwMac =  gwIdMacMapList[obj.extra.gwid];
        if(gwMac!= undefined){
            arr.push(gwMac);
        }else{
            arr.push('');
        }
    }

    arr.push(obj.extra.frameCnt);
    arr.push(obj.extra.fport);

    return arr;
}


exports.getFinalData = function (finalist) {
    var array = [];
    if(getType(finalist) !='object'){
        array;
    }
    var mItem = 1;
    
    if(finalist){

        //console.log( 'Last Device Information \n '+JSON.stringify( mObj));

        for (var mac in finalist)
        {
            //console.log( '#### '+mac + ': ' + JSON.stringify(finalist[mac]) );

            array.push(getArray(finalist[mac],mItem));
            mItem++;
        }
    }

    var dataString = JSON.stringify(array);
    if(array.length===0){
        dataString = null;
    }
    return dataString;
};

function getArray(obj,item){

    var arr = [];
    var connection_ok = "<img src='/icons/connection_ok.png' width='30' height='30' name='status'>";
    var connection_fail = "<img src='/icons/connection_fail.png' width='30' height='30' name='status'>";
    /*if(item<10){
        arr.push('0'+item);
    }else{
        arr.push(item.toString());
    }*/
    arr.push(item);

    arr.push(obj.mac);
    arr.push(obj.date);
    arr.push(obj.extra.rssi);
    arr.push(obj.extra.snr);
    //console.log('obj.overtime :'+obj.overtime);


    if( obj.overtime){
        arr.push(connection_fail);
        //console.log('overtime = true');
    }else{
        arr.push(connection_ok);
        //console.log('overtime = false');
    }
    //console.log('arr = '+JSON.stringify(arr));
    return arr;
}

function saveBlazingList(fport,mac,msg){
    var key = "gps";

    //for blazing
    if(fport === 3 || fport === 1){//GPS
        key = "gps";
    }else if(fport === 19){//PIR
        key = "pir";
    }else if(fport === 11){//PM2.5
        key = "pm25";
    }else if(fport === 21){//Flood
       key = "flood";
    }
    if(finalList[key] === undefined){
        finalList[key] = {};
    }
    //console.log('finalList1 :'+JSON.stringify(finalList));
    finalList[key][mac] = msg;
    //console.log('finalList2 :'+JSON.stringify(finalList));
}

function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}

function parseDefineMessage(data){
   var mInfo = ParseDefine.getInformation(data);
   return mInfo;
}

function parseBlazingMessage(data,fport){
    var mInfo = {};

    //for blazing
    if(fport === 3 || fport === 1){//GPS
        mInfo = ParseBlaziong.getTracker(data);
    }else if(fport === 19){//PIR
        mInfo = ParseBlaziong.getPIR(data);
    }else if(fport === 11){//PM2.5
        mInfo = ParseBlaziong.getPM25(data);
    }else if(fport === 21){//Flood
        mInfo = ParseBlaziong.getFlood(data);
    }
    return mInfo;
}

//type_tag_map is local JSON object
function isSameTagCheck(type,mac,recv){
	var time =  moment(recv).format('mm');

	//Get number of tag
	var tmp = mData.substring(4,6);
	var mTag = parseInt(tmp,16)*100;//流水號:百位
        mTag = mTag + parseInt(time,10);//分鐘:10位及個位
	var key = mac.concat(type);
	var tag = type_tag_map[key];

	if(tag === undefined){
		tag = 0;
	}

	/* Fix 時間進位問題
		example : time 由59分進到00分時絕對值差為59
	*/
	if (Math.abs(tag - mTag)<2 || Math.abs(tag - mTag)==59){
		console.log('mTag=' +mTag+'(key:' +key + '):tag='+tag+' #### drop');
		return true;
	}else{
		type_tag_map[key] = mTag;
		console.log('**** mTag=' +mTag+'(key:' +key + '):tag='+tag +'=>'+mTag+' @@@@ save' );
		return false;
	}
}

//Jason add for get data percentage on 2017.06.15
exports.getDevicesData2 = function (type,devices) {
    var json = {};
    var dateJson = {},channelJson = {};
    var gwipJson = {},gwidJson = {};
    var weekJson = {},hourJson={};


    if(devices){
        for (var i=0;i<devices.length;i++)
        {
            /*if(i==0){
              console.log( '#### '+devices[i].mac + ': ' + JSON.stringify(devices[i]) );
            }*/
            dateJson = getDateJson(dateJson,devices[i].date,null);
            weekJson = getDataJson(weekJson,devices[i].recv,'week');
            hourJson = getDataJson(hourJson,devices[i].recv,'hour');
            channelJson = getDataJson(channelJson,devices[i].extra.channel);
            gwipJson = getDataJson(gwipJson,devices[i].extra.gwip);
            gwidJson = getDataJson(gwidJson,devices[i].extra.gwid);
        }
    }else{
        return null;
    }
    var ordered = {};
    //Jason add for hour sort on 2017.06.15
    for(var i=0;i<23;i++){
        var a = i.toString();
        if(hourJson[a]){
             ordered[a] = hourJson[a];
        }
    }
    
    json.date = dateJson;
    json.week = weekJson;
    json.hour = ordered;
    json.channel = channelJson;
    json.gwip = gwipJson;
    json.gwid = gwidJson;

    var dataString = JSON.stringify(json);
    console.log('Device : '+devices[0].macAddr +' percentage data');
    console.log('--------------------------------------------------------------------');
    console.log(dataString);
    console.log('--------------------------------------------------------------------');
    return dataString;
};

function getDateJson(json,date){
    var newDate = date.substring(0,10);
    //console.log( 'date : ' + date + " to " + date.substring(0,10));
    var newDate = date.substring(0,10);
    if(json[newDate]){
        json[newDate] = json[newDate]+1;
    }else{
        json[newDate] = 1;
    }
    
    return json;
}

function getDataJson(json,data,type){
    //console.log('type:'+typeof(data));
    if(typeof(data) === 'number'){
        //For date format transfer
        var newData = data.toString();
    }else if(typeof(data) === 'string' && isDate(data) && type ==='week'){
        //For date formate transfer
        var tmpData =new Date(data);
        var newData = (tmpData.getDay()).toString();
        /*if(tmpData.getDay()===1){
            var newData ='Monday';
        } else if(tmpData.getDay()===2){
            var newData ='Tuesday';
        } else if(tmpData.getDay()===3){
            var newData ='Wednesday';
        } else if(tmpData.getDay()===4){
            var newData ='Thursday';
        } else if(tmpData.getDay()===5){
            var newData ='Friday';
        } else if(tmpData.getDay()===6){
            var newData ='Saturday';
        } else {
            var newData ='Sunday';
        }*/
    }else if(typeof(data) === 'string' && isDate(data) && type ==='hour'){
        //For date formate transfer
        var tmpData =new Date(data);
        var newData = (tmpData.getHours()).toString();
        
    }else{
        var newData = data;
    }

    if(json[newData]){
        json[newData] = json[newData]+1;
    }else{
        json[newData] = 1;
    }
    
    return json;
}

function isDate(date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

