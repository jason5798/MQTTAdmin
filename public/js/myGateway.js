console.log("Message admin device information");
var connected = false;
var now = new Date();
var date = (now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() );
var mac,option,date;
var host = window.location.hostname;
var port = window.location.port;
var sendCounter = 0;
//Jason add for avoid ws disturb
var flag = document.getElementById("flag").value;
var isChangeTable = false;
var opt2={
    "order": [[ 1, "asc" ]],
    "iDisplayLength": 10,
    dom: 'Blrtip',
    buttons: [
        'copyHtml5',
        //'excelHtml5',
        'csvHtml5',
        //'pdfHtml5'
    ]
};
var table1 = $('#table1').dataTable(opt2);
var table2 = $('#table2').dataTable(opt2);

if(location.protocol=="https:"){
  var wsUri="wss://"+host+":"+port+"/ws/gateway";
} else {
  var wsUri="ws://"+host+":"+port+"/ws/gateway";
}
console.log(wsUri);
var ws=null;

function wsConn() {
  ws = new WebSocket(wsUri);
  ws.onmessage = function(m) {
    //console.log('< from-node-red:',m.data);
    if (typeof(m.data) === "string" && m. data !== null){
      var msg =JSON.parse(m.data);
      var json = msg.v;
      console.log("from-node-red : id:"+msg.id);
      if(msg.id !== 'init_btn'){
        if(isChangeTable === false || flag != json.flag){
            console.log('Not user => reject');
            return;
          }
      }
      if(msg.id === 'change_table1' || msg.id === 'change_table2'){
        console.log("isChangeTable:"+isChangeTable+' , sendCounter:'+sendCounter);
          sendCounter++;
          if(sendCounter ===2){
            sendCounter = 0;
            isChangeTable = false;
            waitingDialog.hide();
          }
      }
      if(msg.id === 'change_table1' ){

          var data = JSON.parse(json.data);

          if(data){
                //console.log("addData type : "+ typeof(data)+" : "+data);
                table1.fnAddData(data);
                table1.$('tr').click(function() {
                    var row=table.fnGetData(this);
                });
          }

      }else if(msg.id === 'change_table2'){
          var data = JSON.parse(json.data);
          if(data){
                //console.log("addData type : "+ typeof(data)+" : "+data);
                table2.fnAddData(data);
                table2.$('tr').click(function() {
                    var row=table.fnGetData(this);
                });
          }
      }else if(msg.id === 'change_page'){
        //alert('json:'+JSON.stringify(json));
          var page = Number(json.page);
          if(page>1){
              addPageSelect(page);
            }
      }else if(msg.id === 'init_btn'){
          //Set init button active
          console.log("type:"+typeof(msg.v)+" = "+ msg.v);
          type = msg.v;
          initBtnStr  ='#'+msg.v;
          highlight(type);
      }
    }
  }
  ws.onopen = function() {
    /*var mac = document.getElementById("mac").value;
    var type = document.getElementById("type").value;
    var date = document.getElementById("date").value;
    var option= document.getElementById("option").value;*/
    var host = window.location.hostname;
    var port = window.location.port;
    //var json = {mac:mac,type:type,date:date,option:option,host:host,port:port};
    var json = {host:host,port:port};
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
    //alert("mac : "+mac);
    //document.location.href="/device?mac="+mac;
}

function myFunction(id){  // update device
  console.log('myFunction :'+id);
  window.location.href='/?type='+id;
}

function showDialog(){
    //waitingDialog.show('Custom message', {dialogSize: 'sm', progressType: 'warning'});
    waitingDialog.show();
    setTimeout(function () {
      waitingDialog.hide();
      }, 30000);
}

function newPage(){
    //alert('back');
    location.href="/gateway";
}

function find() {
    if(mac && mac !== document.getElementById("selected_mac").value){
      removeSelect();
    }
    if(option && option !== document.getElementById("time_option").value){
      removeSelect();
    }
    var myPage = document.getElementById("myPage");
    if(myPage){
      var page = myPage.value;
    }else{
      var page = 0;
    }

    //alert(page);

    if(isChangeTable === true){//Avoid repeat press search button
      console.log('find() : isChangeTable = true change table => reject  ');
    }else{
      console.log('find() : isChangeTable = false => true');
      isChangeTable = true;
    }
    showDialog();
    table1.fnClearTable();
    table2.fnClearTable();
    mac = document.getElementById("selected_mac").value;
    option = document.getElementById("time_option").value;
    date = document.getElementById("date").value;
    //alert('mac :'+mac +', option : '+option +' , data : '+date);
    if(ws){
        console.log("ws.onopen OK ");
    }
    var value = {};
    value.mac= mac;
    value.option = option;
    value.date   = date;
    value.host   = host;
    value.port   = port;
    value.flag   = flag;
    value.page   = page;
    var mValue = JSON.stringify(value);
    //console.log("id type : "+ typeof(id)+" : "+id);
    var obj = {"id":"find","v":value};
    var objString = JSON.stringify(obj);
    //console.log("getRequest type : "+ typeof(objString)+" : "+objString);
    console.log("ws.onopen : "+ objString);
    ws.send(objString);     // Request ui status from NR
    console.log("sent find WS");
}

function addPageSelect(page){
  var myDiv = document.getElementById("myDiv");
  removeSelect();

  //Create and append select list
  var selectList = document.createElement("select");
  selectList.addEventListener("change", find);
  selectList.id = "myPage";
  myDiv.appendChild(selectList);

  //Create and append the options
  for (var i = 0; i < page; i++) {
      var option = document.createElement("option");
      option.value = i+1;
      option.text = i+1;
      selectList.appendChild(option);
  }
}

function removeSelect(){
  var myDiv = document.getElementById("myDiv");
  var myPage = document.getElementById("myPage");
  if(myPage){
    myDiv.removeChild(myPage);
  }

}

$(document).ready(function(){
    highlight('gateway');
    //showDialog();
    if(document.getElementById("date").value === ''){
      document.getElementById("date").value = date;
    }

    /*table1.$('tr').click(function() {
        var row=table1.fnGetData(this);
        toSecondTable(row[1]);

    });

    table2.$('tr').click(function() {
        var row=table2.fnGetData(this);
        toSecondTable(row[1]);

    });*/

    new Calendar({
        inputField: "date",
        dateFormat: "%Y/%m/%d",
        trigger: "BTN",
        bottomBar: true,
        weekNumbers: true,
        showTime: false,
        onSelect: function() {this.hide();}
    });

    //$("#table1").dataTable(opt); //中文化


    /*table.$('tr').click(function() {
        var row=table.fnGetData(this);
        toSecondTable(row[1]);

    });

     $("#table1").on({
          mouseenter: function(){
           //stuff to do on mouse enter

           $(this).css({'color':'blue'});
           },
           mouseleave: function () {
           //stuff to do on mouse leave
           $(this).css({'color':'black'});
      }},'tr');*/

});