var DeviceModel = require('./device.js');
var JsonFileTools =  require('./jsonFileTools.js');
var Tools = require('./tools.js');
var moment = require('moment');


exports.saveDeviceMsg = function (obj,callback) {

    var now = moment().toDate();
    //console.log(now + ' Debug : saveDeviceMsg obj:'+JSON.stringify(obj));

    var newDevice = new DeviceModel({
        macAddr     : obj.mac,
        data        : obj.data,
        recv        : obj.recv,
        date        : obj.date,
        timestamp   : obj.timestamp,
        extra       : obj.extra,
        info        : obj.information
    });

    //console.log('$$$$ DeviceModel : '+JSON.stringify(newDevice));

    newDevice.save(function(err){
        if(err){
            console.log(now + ' Debug : Device save fail!');
            return callback(err);
        }else{
            console.log(now + ' Debug : Device save success!');
            return callback(err,"OK");
        }
    });
};


exports.findByMac = function (find_mac,callback) {
    if(find_mac.length>0){
            //console.log('find_mac.length>0');
            DeviceModel.find({ macAddr: find_mac }, function(err,devices){
                if(err){
                    return callback(err);
                }
                var now = moment().format('YYYY-MM-DD HH:mm:ss');
                /*console.log("find all of mac "+find_mac+" : "+devices);
                devices.forEach(function(device) {
                    console.log('mac:'+device.macAddr + ', data :' +device.data);
                });*/

                if (devices.length>0) {
                    console.log(now+' findByMac() : '+devices.length+' records');
                    return callback(err,devices);
                }else{
                    console.log('找不到資料!');
                    return callback('找不到資料!');
                }
            });
    }else{
        console.log('find_name.length=0');
        return callback('找不到資料!');
    }
};

/*Find all of unit
*/
exports.findAllDevices = function (calllback) {

    DeviceModel.find((err, Devices) => {
        var now = moment().format('YYYY-MM-DD HH:mm:ss');
        if (err) {
            console.log(now+'Debug : findAllDevices err:', err);
            return calllback(err);
        } else {
            console.log(now+'Debug : findAllDevices success\n:',Devices.length);
            return calllback(err,Devices);
        }
    });
};

function toFindDevices(json,calllback) {

    DeviceModel.find(json,(err, Devices) => {
        var now = moment().format('YYYY-MM-DD HH:mm:ss');
        if (err) {
            console.log(now+'Debug : toFindDevices() err:', err);
            return calllback(err);
        } else {
            console.log(now+'Debug :toFindDevices() success\n:',Devices.length);
            return calllback(err,Devices);
        }
    });
}

function toFindLastDevice(json,calllback) {
    DeviceModel.find(json).sort({recv: -1}).limit(1).exec(function(err,devices){
        var now = moment().format('YYYY-MM-DD HH:mm:ss');
        if(err){
            console.log(now+'Debug deviceDbTools find Last Device By Unit -> err :'+err);
            return calllback(err,null);
        }else{
            console.log(now+'Debug deviceDbTools find Last Device By Unit('+json+') -> device :'+devices.length);
            return calllback(err,devices[0]);
        }
    });
}

exports.findDevices = function (json,calllback) {

    DeviceModel.find(json,(err, Devices) => {
        var now = moment().format('YYYY-MM-DD HH:mm:ss');
        if (err) {
            console.log(now+'Debug : findDevice err:', err);
            return calllback(err);
        } else {
            console.log(now+'Debug :findDevice success\n:',Devices.length);
            return calllback(err,Devices);
        }
    });
};

//Find last record by mac
exports.findLastDeviceByMac = function (mac,calllback) {
    return toFindLastDevice({macAddr:mac},calllback);
};

exports.findLastDeviceByMacIndex = function (mac,_index,calllback) {
    return toFindLastDevice({macAddr:mac,index:_index},calllback);
};

//Find last record by json
exports.findLastDevice = function (json,calllback) {
    return toFindLastDevice(json,calllback);
};

/*Find devices by date
*date option: 0:one days 1:one weeks 2:one months 3:three months
*/
function findDevicesByDate(dateStr,mac,dateOption,order,calllback) {
    
    var json = {macAddr:mac};
    return toFindDevice(dateStr,json,dateOption,order,calllback);
   
};

function findDevicesByDate2(mac,startDateStr,endDateStr,order,calllback) {
    var json = {macAddr:mac};
    var to = moment(endDateStr,'YYYY/MM/DD').add(1,'days').toDate();
    var from = moment(startDateStr,'YYYY/MM/DD').toDate();
    json.recv = {$gte:from, $lt:to};
    console.log( 'to :'+to );
    console.log( 'from :'+from );
    console.log('json:'+JSON.stringify(json));
    return findData(json,order,calllback);
};


function findDevicesByGWID(dateStr,gwid,dateOption,order,calllback) {
    
    var json = {"extra.gwid":gwid};
    return toFindDevice(dateStr,json,dateOption,order,calllback);
   
};

function toFindDevice(dateStr,json,dateOption,order,calllback) {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss')+' Debug : findDevicesByDate()');
    var to = moment(dateStr,'YYYY/MM/DD').add(1,'days').toDate();
    var toMoment = moment(to);
    
    var from;
    switch(dateOption) {
    case 0:
        from =  toMoment.subtract(1,'days').toDate();
        break;
    case 1:
        from =  toMoment.subtract(1,'weeks').toDate();
        break;
    case 2:
        from =  toMoment.subtract(1,'months').toDate();
        break;
    case 3:
        from =  toMoment.subtract(3,'months').toDate();
        break;
    default:
        from =  toMoment.subtract(3,'days').toDate();
    }
    console.log( 'to :'+to );
    console.log( 'from :'+from );
    
    json.recv = {$gte:from, $lt:to};
    console.log('json:'+JSON.stringify(json));
    return findData(json,order,calllback);
};

function findData(json,order,calllback) {
    
    var recvOrder = -1;
    if(order === 'asc'){
        recvOrder = 1;
    }

    DeviceModel.find(json).sort({ recv:recvOrder}).exec(function(err, Devices){
       

        if (err) {
            console.log('Debug : findDevice err:', err);
            return calllback(err);
        }
        if(Devices && Devices.length>0){
            console.log('Debug :Devices count:',Devices.length);
            console.log('Debug :first\n:',Devices[0]['date']);
            console.log('Debug :first\n:',Devices[Devices.length-1]['date']);
        }else{
            console.log('Debug :Devices count: 0');
        }
        return calllback(err,Devices);
    });
   
};

exports.findDevicesByDate = findDevicesByDate;
exports.findDevicesByGWID = findDevicesByGWID;
exports.findDevicesByDate2 = findDevicesByDate2;

exports.getOptioDeviceList = function (devices,option) {
    var diff = 1;
    switch(option) {
    case 0:
        diff = 1;
        break;
    case 1:
        diff = 6;
        break;
    case 2:
        diff = 24*6;
        break;
    case 3:
        diff = 24*6;
        break;
    default:
        from =  moment().subtract(1,'days').toDate();
    }
    var deviceList = [];
    var i = 0;
    for(i=0; i< devices.length ; i=i+diff){
        deviceList.push(devices[i]);
    }
    return deviceList;
};



exports.removeDevicesByDate = function (startDate,option,number,calllback) {
    //console.log('--removeDevicesByDate---------------------------------------');

    var now = moment(startDate).toDate();
    var from;
    switch(option) {
    case 0:
        from =  moment(startDate).subtract(number,'hours').toDate();
        break;
    case 1:
        from =  moment(startDate).subtract(number,'days').toDate();
        break;
    case 2:
        from =  moment(startDate).subtract(number,'weeks').toDate();
        break;
    case 3:
        from =  moment(startDate).subtract(number,'months').toDate();
        break;
    default:
        from =  moment(startDate).subtract(number,'days').toDate();
    }
    //console.log( 'now :'+now );
    //console.log( 'from :'+from );

    var json = {
                recv:{
                    $gte:from,
                    $lt:now
                }
        }

    DeviceModel.remove(json,(err, Devices) => {
        if (err) {
            console.log(now+'Debug : findDevice err:', err);
            return calllback(err);
        } else {
            console.log(now+'Debug :findDevice success\n:',Devices.length);
            return calllback(err,Devices);
        }
    });
};

exports.removeDeviceById = function (id,calllback) {
    DeviceModel.remove({_id:id}, (err)=>{
      console.log('---removeUserByName ---------------------------------------');
      if (err) {
        console.log('Debug : User remove id :'+id+' occur a error:', err);
            return calllback(err);
      } else {
        console.log('Debug : User remove id :'+id+' success.');
            return calllback(err,'success');
      }
    });
};

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true && JSON.stringify(obj) === JSON.stringify({});
}



