console.log("Message admin device information");
var connected = false;
var host = window.location.hostname;
var port = window.location.port;
//Jason add control
var flag = document.getElementById("flag").value;
//Datatable setting
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

//Jplot chart setting
var plot1,plot2,plot3,plot4,plot5,plot6;
var options1 = {
            // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
            //animate: !$.jqplot.use_excanvas,
            title: "Date",
            seriesDefaults:{
                renderer:$.jqplot.BarRenderer,
                pointLabels: { show: true }
            },
            axes: {
              xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ['a','b'],
                tickOptions:{
                  angle: -60
                },
                tickRenderer:$.jqplot.CanvasAxisTickRenderer
              }
            },
            highlighter: { show: false }
        };
var options2 =  {
            gridPadding: {top:0, bottom:38, left:0, right:0},
            seriesDefaults:{
                renderer:$.jqplot.PieRenderer,
                trendline:{ show:false },
                rendererOptions: { padding: 8, showDataLabels: true }
            },
            legend:{
                show:true,
                placement: 'outside',
                rendererOptions: {
                    numberRows: 1
                },
                location:'s',
                renderer: $.jqplot.EnhancedPieLegendRenderer,
                marginTop: '15px'
            }
        };

//Websocket
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
  var obj = JSON.parse(data);

  //Date bar chart
  var dateObj = obj.date;
  var s1_date = Object.values(dateObj);
  var ticks_date = Object.keys(dateObj);
  //alert(JSON.stringify(s1_date));
  //alert(JSON.stringify(ticks_date));
  options1.title = 'Date';
  options1.axes.xaxis.ticks = ticks_date;
  options1.axes.xaxis.tickOptions.angle = -30;
  $.jqplot('barDate', [s1_date ],options1);
  //Date pie chart
  var dateData = [];
  for(var i in ticks_date){
    dateData.push( getPieArray(ticks_date[i],s1_date[i]) );
  }
  //alert('date pie data :'+JSON.stringify(dateData));
  $.jqplot('pieDate', [dateData],options2);

  //Week bar chart
  var weekObj = obj.week;
  var s1_week = Object.values(weekObj);
  var ticks_week = Object.keys(weekObj);
  //alert(JSON.stringify(s1_week));
  //alert(JSON.stringify(ticks_week));
  options1.title = 'Week';
  options1.axes.xaxis.ticks = ticks_week;
  options1.axes.xaxis.tickOptions.angle = 0;
  $.jqplot('barWeek', [s1_week ],options1);
  //Week pie chart
  var weekData = [];
  for(var i in ticks_week){
    weekData.push( getPieArray(ticks_week[i],s1_week[i]) );
  }
  //alert('week pie data :'+JSON.stringify(weekData));
  $.jqplot('pieWeek', [weekData],options2);

  //Hour bar chart
  var hourObj = obj.hour;
  var s1_hour = Object.values(hourObj);
  var ticks_hour = Object.keys(hourObj);
  //alert(JSON.stringify(s1_hour));
  //alert(JSON.stringify(ticks_hour));
  options1.title = 'Hour';
  options1.axes.xaxis.ticks = ticks_hour;
  $.jqplot('barHour', [s1_hour ],options1);
  //Hour pie chart
  var hourData = [];
  for(var i in ticks_hour){
    hourData.push( getPieArray(ticks_hour[i],s1_hour[i]) );
  }
  //alert('hour pie data :'+JSON.stringify(hourData));
  $.jqplot('pieHour', [hourData],options2);

  //Channel bar chart
  var channelObj = obj.channel;
  var s1_channel = Object.values(channelObj);
  var ticks_channel = Object.keys(channelObj);
  //alert(JSON.stringify(s1_channel));
  //alert(JSON.stringify(ticks_channel));
  options1.title = 'Channel';
  options1.axes.xaxis.ticks = ticks_channel;
  options1.axes.xaxis.tickOptions.angle = -30;
  $.jqplot('barChannel', [s1_channel ],options1);
  //Channel pie chart
  var channelData = [];
  for(var i in ticks_channel){
    channelData.push( getPieArray(ticks_channel[i],s1_channel[i]) );
  }
  //alert('channel pie data :'+JSON.stringify(channelData));
  $.jqplot('pieChannel', [channelData],options2);

  //Gwip bar chart
  var gwipObj = obj.gwip;
  var s1_gwip = Object.values(gwipObj);
  var ticks_gwip = Object.keys(gwipObj);
  //alert(JSON.stringify(s1_gwip));
  //alert(JSON.stringify(ticks_gwip));
  options1.title = 'Gwip';
  options1.axes.xaxis.ticks = ticks_gwip;
  options1.axes.xaxis.tickOptions.angle = 0;
  $.jqplot('barGwip', [s1_gwip ],options1);
  //Gwip pie chart
  var gwipData = [];
  for(var i in ticks_gwip){
    gwipData.push( getPieArray(ticks_gwip[i],s1_gwip[i]) );
  }
  //alert('gwip pie data :'+JSON.stringify(gwipData));
  $.jqplot('pieGwip', [gwipData],options2);

  //Gwid bar chart
  var gwidObj = obj.gwid;
  var s1_gwid = Object.values(gwidObj);
  var ticks_gwid = Object.keys(gwidObj);
  //alert(JSON.stringify(s1_gwid));
  //alert(JSON.stringify(ticks_gwid));
  options1.title = 'Gwid';
  options1.axes.xaxis.ticks = ticks_gwid;
  $.jqplot('barGwid', [s1_gwid ],options1);
  //Gwid pie chart
  var gwidData = [];
  for(var i in ticks_gwid){
    gwidData.push( getPieArray(ticks_gwid[i],s1_gwid[i]) );
  }
  //alert('gwid pie data :'+JSON.stringify(gwidData));
  $.jqplot('pieGwid', [gwidData],options2);


}

function getPieArray(key,value){
  return [key,value];
}

$(document).ready(function(){
    showDialog();
});