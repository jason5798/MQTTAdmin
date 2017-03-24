$(document).ready(function () {
		var enable = $('[name=enable]');
		//alert(enable.length);
		for(var i=0;i<enable.length;i++){
			if(!enable[i].checked){
				toDisableCheckBox(i,true);
			}
		}
		setTimeout(function(){
		    //do what you need here
		    document.getElementById('result').innerText = '';
		}, 3000);
	});


	function editCheck(index,name){
		//alert(index+" : "+name);
		var postSelect = document.getElementById("postSelect");
		var postName = document.getElementById("postName");
		postName.value = name;

		var enable = $('[name=enable]');
		var arrSelect = [];
		arrSelect.push(enable[index].checked);
		//alert('arrSelect :'+ arrSelect);
		var data = $('[name=data]');

		for(var i=0;i<data.length;i++){

			if(i==0+(6*index)){
				//alert(i+ ') checked :'+ data[i].checked);
				arrSelect.push(data[i].checked);
			}else if(i==1+(6*index)){
				//alert(i+ ') checked :'+ data[i].checked);
				arrSelect.push(data[i].checked);
			}else if(i==2+(6*index)){
				//alert(i+ ') checked :'+ data[i].checked);
				arrSelect.push(data[i].checked);
			}else if(i==3+(6*index)){
				//alert(i+ ') checked :'+ data[i].checked);
				arrSelect.push(data[i].checked);
			}else if(i==4+(6*index)){
				//alert(i+ ') checked :'+ data[i].checked);
				arrSelect.push(data[i].checked);
			}else if(i==5+(6*index)){
				//alert(i+ ') checked :'+ data[i].checked);
				arrSelect.push(data[i].checked);
			}
		}
		//alert('arrSelect'+ arrSelect);
		postSelect.value = arrSelect;
		document.getElementById("unitList").submit();
	}

	function delCheck(index,name){

		//alert(index+" : "+name);
		postName.value = name;
		document.getElementById("account").innerText='Are you sure you want to delete the '+name+' account?';
		$('#myModal').modal('show');
	}

	function refresh(index,enable,authz){
		
		$('[name=enable]').eq(index).prop("checked", enable);
		var authzStr = JSON.stringify(authz);
		console.log('index:'+index+', enable:'+enable+',authz:'+authzStr);

		var data = $('[name=data]');
		console.log(data.length);

		for(var i=0;i<data.length;i++){

			if(i==0+(6*index)){
				//alert(i+ ') authz.a01 :'+ authz.a01);
				data.eq(i).prop("checked", authz.a01);
			}else if(i==1+(6*index)){
				//alert('authz.a02 :'+ authz.a02);
				data.eq(i).prop("checked", authz.a02);
			}else if(i==2+(6*index)){
				//alert('authz.a03 :'+ authz.a03);
				data.eq(i).prop("checked", authz.a03);
			}else if(i==3+(6*index)){
				//alert('authz.a04 :'+ authz.a04);
				data.eq(i).prop("checked", authz.a04);
			}else if(i==4+(6*index)){
				//alert('authz.a05 :'+ authz.a05);
				data.eq(i).prop("checked", authz.a05);
			}else if(i==5+(6*index)){
				//alert('authz.a06 :'+ authz.a06);
				data.eq(i).prop("checked", authz.a06);
			}
		}
		toDisableCheckBox(index,!enable);
	}

	function enableCheck(index,checkbox){
		//alert(index);
        toDisableCheckBox(index,!checkbox.checked);
    }

    function toDisableCheckBox(index,isDisable){

    	var data = $('[name=data]');
		//alert(data.length);

		for(var i=0;i<data.length;i++){
			if(i==0+(6*index)){
				data.eq(i).prop("disabled", isDisable);
			}else if(i==1+(6*index)){
				data.eq(i).prop("disabled", isDisable);
			}else if(i==2+(6*index)){
				data.eq(i).prop("disabled", isDisable);
			}else if(i==3+(6*index)){
				data.eq(i).prop("disabled", isDisable);
			}else if(i==4+(6*index)){
				data.eq(i).prop("disabled", isDisable);
			}else if(i==5+(6*index)){
				data.eq(i).prop("disabled", isDisable);
			}
		}
    	/*$('[name=data]').each(function(){
			$(this).prop("disabled", isDisable);
        });*/
    }

	function toSubmit(){
		$('#myModal').modal('hide');
		document.getElementById("unitList").submit();
	}