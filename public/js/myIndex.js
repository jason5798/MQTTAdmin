
console.log("message manager");
var max = 29;//Default range
var now = new Date();
var oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

var endDateStr = (now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() );
var startDateStr =  (oneWeekAgo.getFullYear() + '/' + (oneWeekAgo.getMonth() + 1) + '/' + oneWeekAgo.getDate() );
var connected = false;
var initBtnStr ="#pir";
var type = document.getElementById("type").value;
var host = window.location.hostname;
var port = window.location.port;
//Jason add for avoid ws disturb
var flag = document.getElementById("flag").value;
var isChangeTable = false;

var opt2={
     "order": [[ 2, "desc" ]],
     "iDisplayLength": 25
 };

var table = $("#table1").dataTable(opt2);
if(location.protocol=="https:"){
  var wsUri="wss://"+window.location.hostname+":"+window.location.port+"/ws/";
} else {
  var wsUri="ws://"+window.location.hostname+":"+window.location.port+"/ws/";
}
console.log("wsUri:"+wsUri);
var ws=null;

function wsConn() {
  ws = new WebSocket(wsUri);
  ws.onmessage = function(m) {
    //console.log('< from-node-red:',m.data);
    if (typeof(m.data) === "string" && m.data !== null){
      var msg =JSON.parse(m.data);
      var json = msg.v;
      console.log("from-node-red : id:"+msg.id);
      if(isChangeTable === false){
        console.log('isChangeTable = false => reject');
        return;
      }else if(flag != json.flag){
        console.log('flag error => reject');
        return;
      }else {
        console.log('isChangeTable = true  => false');
        isChangeTable = false;
      }
      if(msg.id === 'change_table'){

          //Remove init button active
          console.log("initBtnStr:"+initBtnStr+"remove active");
          //$(initBtnStr).siblings().removeClass("active");
          $(initBtnStr).addClass().siblings().removeClass("active");
          //Reload table data
          console.log("type:"+json.type);

            table.fnClearTable();
            var data = JSON.parse(json.data);
            if(data){
                  //console.log("addData type : "+ typeof(data)+" : "+data);
                  table.fnAddData(data);
                  table.$('tr').click(function() {
                  var row=table.fnGetData(this);
                  toSecondTable(row[1]);
              });
            }
      }else if(msg.id === 'init_btn'){
          //Set init button active
          console.log("highlight type:"+typeof(msg.v)+" = "+ msg.v);
		  if(flag != msg.flag){
			console.log('flag error => reject');
			return;
		  }
          type = msg.v;
          initBtnStr  ='#'+msg.v;
          highlight(type);
      }
    }
  }

  ws.onopen = function() {

    connected = true;

    var obj = {"id":"init","v":type,flag:flag};
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


function myFunction(id){  // update device
  highlight(id);
  type = id;
  if(isChangeTable === true){
    console.log('myFunction : isChangeTable = true change table => reject  ');
  }else{
    console.log('myFunction : isChangeTable = false => true');
    isChangeTable = true;
  }

  console.log(id);
  if(ws){
      console.log("ws.onopen OK ");
  }
  console.log("id type : "+ typeof(id)+" : "+id);
  var json = {host:host,port:port,type:id,flag:flag}
  initBtnStr = "#"+id;
  var obj = {"id":"change_type","v":json};
  var objString = JSON.stringify(obj);
  console.log("getRequest type : "+ typeof(objString)+" : "+objString);
  console.log("ws.onopen : "+ objString);
  ws.send(objString);     // Request ui status from NR
  console.log("sent change_type requeset");

}

function highlight(id) {
    var arr = ["pir","gps","pm25","flood","others","gateway"];
    for(var i = 0;i<arr.length;i++){
      if(arr[i] === id){
        document.getElementById(arr[i]).style.background = "#89AAC0";
      }else{
        document.getElementById(arr[i]).style.background = "#42566A";
      }
    }
  }

function toSecondTable(mac){
    //alert("mac :"+mac);
    var date =document.getElementById("sDate").value;
    //alert("date :"+date);
    document.location.href="/devices?mac="+mac+"&type="+type+"&sDate="+startDateStr+"&eDate="+endDateStr;
}

function newPage(){
    //alert('back');
    location.href="/gateway";
}


$(document).ready(function(){
    highlight(type);
    table.$('tr').click(function() {
        var row=table.fnGetData(this);
        toSecondTable(row[1]);

    });
    new Calendar({
        inputField: "sDate",
        dateFormat: "%Y/%m/%d",
        trigger: "BTN",
        bottomBar: true,
        weekNumbers: true,
        showTime: false,
        onSelect: function() {
          this.hide();
          startDateStr = document.getElementById("sDate").value;
          var oneMaxDate= new Date(startDateStr);
          //alert('oneMonthDate :'+typeof(oneMonthDate));
          oneMaxDate.setDate(oneMaxDate.getDate() + max);

          if( oneMaxDate.getTime() < now.getTime() ){
            endDateStr  = (oneMaxDate.getFullYear() + '/' + (oneMaxDate.getMonth() + 1) + '/' + oneMaxDate.getDate() );
            /*$("#message").show();
            setTimeout(function(){
                $("#message").hide();
            }, 3000);*/
          }
          document.getElementById("eDate").value = endDateStr;
          //
        }
    });

    new Calendar({
        inputField: "eDate",
        dateFormat: "%Y/%m/%d",
        trigger: "BTN1",
        bottomBar: true,
        weekNumbers: true,
        showTime: false,
        onSelect: function() {
          this.hide();
          startDateStr = document.getElementById("sDate").value;
          endDateStr = document.getElementById("eDate").value;
          var startDate = new Date(startDateStr);
          var oneMaxDate= new Date(endDateStr);

          oneMaxDate.setDate(oneMaxDate.getDate() - max);
          //alert('oneMaxDate :'+(oneMaxDate.getMonth() + 1) + '/' + oneMaxDate.getDate());

          if( oneMaxDate.getTime() > startDate.getTime() ){
            startDateStr  = (oneMaxDate.getFullYear() + '/' + (oneMaxDate.getMonth() + 1) + '/' + oneMaxDate.getDate() );
            /*$("#message").show();
            setTimeout(function(){
                $("#message").hide();
            }, 3000);*/
          }
          document.getElementById("sDate").value = startDateStr;
        }
    });

    //alert(document.getElementById("startDate").value);
    if(document.getElementById("startDate").value === ''){
      document.getElementById("sDate").value = startDateStr;
      document.getElementById("eDate").value = endDateStr;
    }else{
      document.getElementById("sDate").value = document.getElementById("startDate").value;
      document.getElementById("eDate").value = document.getElementById("endDate").value;
    }
    //alert(document.getElementById("sDate").value);

      //table = $("#table1").dataTable(opt2);

          table.$('tr').click(function() {
              var row=table.fnGetData(this);
              toSecondTable(row[1]);

          });

});