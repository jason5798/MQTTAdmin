console.log("Message admin device information");
var connected = false;
var host = window.location.hostname;
var port = window.location.port;
//Jason add control
var flag = document.getElementById("flag").value;
if(flag === 'blazing-guest'){

    var opt2={
        "order": [[ 2, "desc" ]],
        "iDisplayLength": 25
    };

}else{
    var opt2={
        //"order": [[ 2, "desc" ]],
        "iDisplayLength": 100,
        dom: 'Blrtip',
        buttons: [
            'copyHtml5',
            //'excelHtml5',
            'csvHtml5',
            //'pdfHtml5'
        ]
    };
}
var table = $('#table1').dataTable(opt2);

if(location.protocol=="https:"){
  var wsUri="wss://"+host+":"+port+"/ws/devices";
} else {
  var wsUri="ws://"+host+":"+port+"/ws/devices";
}
console.log(wsUri);
var ws=null;

function wsConn() {
  ws = new WebSocket(wsUri);
  ws.onmessage = function(m) {
    //console.log('< from-node-red:',m.data);
    if (typeof(m.data) === "string" && m. data !== null){
      var msg =JSON.parse(m.data);
      console.log("from-node-red : id:"+msg.id);
      if(msg.id === 'init_table'){
        //Remove init button active
        //console.log("v : "+msg.v);

        //Reload table data
        //console.log("v type:"+typeof( msg.v));

        table.fnClearTable();
        var obj = msg.v;
        var data = JSON.parse(obj.data);
        if(flag != obj.flag){
          console.log('flag error => reject');
          return;
        }
        //console.log("addData type : "+ typeof(data)+" : "+data);
        if(data){
            table.fnAddData(data);
        }
        waitingDialog.hide();
      }else if(msg.id === 'init_chart'){
        var nObj = msg.v;
        var nData = nObj.data;
        if(flag != nObj.flag){
          console.log('flag error => reject');
          return;
        }
        showChart(nData);
      }
    }
  }
  ws.onopen = function() {
    var mac = document.getElementById("mac").value;
    var type = document.getElementById("type").value;
    //var date = document.getElementById("date").value;
    //var option= document.getElementById("option").value;
    var sDate = document.getElementById("sDate").value;
    var eDate = document.getElementById("eDate").value;
    var host = window.location.hostname;
    var port = window.location.port;
    var json = {mac:mac,type:type,sDate:sDate,eDate:eDate,host:host,port:port,flag:flag};
    //alert('date :'+ date);
    connected = true;
    var obj = {"id":"init","v":json};
    var getRequest = JSON.stringify(obj);
    console.log("getRequest type : "+ typeof(getRequest)+" : "+getRequest);
    console.log("ws.onopen : "+ getRequest);
    ws.send(getRequest);      // Request ui status from NR
    console.log(getRequest);

  }
  ws.onclose   = function()  {
    console.log('Node-RED connection closed: '+new Date().toUTCString());
    connected = false;
    ws = null;
  }
  ws.onerror  = function(){
    console.log("connection error");
  }
}
wsConn();           // connect to Node-RED server

function setButton(_id,_v){ // update slider
  myselect = $("#"+_id);
   myselect.val(_v);
   myselect.slider('refresh');
}

function showDialog(){
    //waitingDialog.show('Custom message', {dialogSize: 'sm', progressType: 'warning'});
    waitingDialog.show();
    setTimeout(function () {
      waitingDialog.hide();
      }, 5000);
}

function back(){
    //alert('back');
    //location.href=document.referrer;
	location = '/';
}

function showChart(data){
  console.log('showChart : '+data);
}

$(document).ready(function(){
    showDialog();
});