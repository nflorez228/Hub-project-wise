//***************************************************************
//
//
// INICIA INDEX-JS
//
//
//***************************************************************

//Variable que se encarga de determinar si el input fue bien hecho
var textoBien = false;
var nodes = {};
var recibido=false;
//Optimización de llamadas Jquery
var queryConnect = $('.conection');
var queryLoad = $('.load');
var queryForm = $('.form');
var queryDetalles = $('.detalles');
var queryDetaContent = $('.detalles #detallesContent');
var queryMetricList = $('#metricList');
var queryEventList = $('#eventList');
var queryNodeControls = $('#nodeControls');
var selConfirmDelete=$("#confirmDelete");
var selConfirmDeleteEvent=$("#confirmDeleteEvent");
var selConfig=$("#divConfig");
var selConfirmCambiarPass=$("#confirmCambiarPass");
var selConfigNombre=$("#confirmCambiarNombre");
var queryGrayOut=$("#grayOut");
var queryGrayOut2=$("#grayOut");
var fab, fabCtr, links, nav, ripple;
var queryDivCreateEvent = $('#createEvent');
var queryTime = $('#RecuTimeSelector');
var queryErrorList= $('#errorList');
var queryErrorDiv=$('#errorDiv');
var queryLogDiv=$('#logDiv');
var queryLog=$('#log');
var queryNoty=$('#noty');
var queryNewName;
var queryNewPass;
var queryOldPass;

//usados para configurar los popups
var queryPop=$('.popup#pop');
var queryPopHeader=$('.popup #popHeader');
var queryPopContent=$('.popup #popContent');
var queryPopConfirm=$('.popup #popConfirm');
var queryPopCancel=$('.popup #popCancel');
var queryPopBack=$('.popup #popBack');
var queryPopFooter=$('.popup #popFoot');

fab = document.querySelector('.fab');
fabCtr = document.querySelector('.fab-ctr');
nav = document.querySelector('.nav');
links = document.querySelector('.links');
ripple = document.querySelector('.ripple');
ripple.classList.add('off');
//guarda el login actual
var LOGIN;

var test;


//var showHiddenNodes = true;//esta variable se encarga de esconder los nodos que no cumplan con los filtros
var selectedNodeId;

var selectedEvent;
var authenticated = false;
queryConnect.hide();
queryLoad.hide();
var pruebaNodos;
var windowHeight = window.innerHeight;
//variable que determina si la ventana de detalles se mantiene abierta false implica que esta cerrada
var detallesState = false;
//la variable de cambios guarda si hubo algún cambio cuando entro en los detalles de un nodo
var cambios = false;
//elimino el esconder el formulario pues de ahi se sacarÃ¡ el login
//$('.form').hide();

//Inicia Slideout
//noinspection JSUnresolvedFunction
var slideout = new Slideout({
	'panel': document.getElementById('panel'),
	'menu': document.getElementById('menu'),
	'padding': 256,
	'tolerance': 70
});

//Termina SlideOut
//noinspection JSUnresolvedFunction
slideout.disableTouch();
var selSlide = $('#slideBtn');
var selBackSlide = $("#backSlide");

//noinspection JSUnresolvedFunction
var formtl = new TimelineMax({paused:true})
	.fromTo(queryForm,0.2,{scale:0},{scale:1});
//noinspection JSUnresolvedFunction
var loadtl = new TimelineMax({paused:true})
	.to(queryLoad,1,{autoAlpha:1});
//noinspection JSUnresolvedFunction,JSUnresolvedVariable
var detallestl = new TimelineMax({paused:true})
	.to(queryDetalles,1,{scale:1,ease:Elastic.easeOut})
	.fromTo(queryDetaContent,1,{height:0},{height:windowHeight*0.4, ease:Bounce.easeOut},0.7)
	.to(queryDetalles,1,{y:-((windowHeight*0.4))},0.7);
//noinspection JSUnresolvedFunction,JSUnresolvedVariable
var detallestlreverse = new TimelineMax({paused:true})
	.fromTo($('.cerrarNodo'),0.2,{scale:1.1},{scale:1})
	.fromTo(queryDetaContent,0.5,{height:windowHeight*0.4},{height:0, ease:Bounce.easeOut})
	.to(queryDetalles,0.2,{scale:0,ease:Elastic.easeOut});
//noinspection JSUnresolvedFunction
var titulo = new  TimelineMax({paused:true})
	.from($('#titulocasa, .time'),0.5,{scale:0});
//noinspection JSUnresolvedFunction
var apptl = new TimelineMax({paused:true})
	.set($(".app"),{autoAlpha:1});
//noinspection JSUnresolvedFunction,JSUnresolvedVariable
var buttl = new TimelineMax({paused:true})
	.to(fab,1,{scale:1,ease:Elastic.easeOut});
//noinspection JSUnresolvedFunction
var buttl2 = new TimelineMax({paused:true})
	.to(fab,1,{scale:40});
//noinspection JSUnresolvedFunction
var main = new TimelineMax({paused:true});
//noinspection JSUnresolvedFunction
var mainOut = new TimelineMax({paused:true});
//noinspection JSUnresolvedFunction
var slideButton = new TimelineMax({paused:true})
	.to(selSlide,1,{autoAlpha:1})
	.fromTo(selBackSlide,1,{x:-100},{x:0});
selBackSlide.on('click', function() {
	slideout.toggle();
});
//noinspection JSUnresolvedFunction
var grayOut = new TimelineMax({paused:true})
	.to(queryGrayOut,1,{autoAlpha:0.5});
//noinspection JSUnresolvedFunction
var grayOut2 = new TimelineMax({paused:true})
	.to(queryGrayOut,1,{autoAlpha:0.5});

//inicia el Flip
TweenLite.set(".cardWrapper", {perspective:800});
TweenLite.set(".card", {transformStyle:"preserve-3d"});
TweenLite.set([".back", ".front","#detallesHeader" , "#detallesContent", "#detallesFooter"], {backfaceVisibility:"hidden"});
//noinspection JSUnresolvedFunction,JSUnresolvedVariable
var detallesFlip = new TimelineMax({paused:true})
	.to($(".card"),1.2,{rotationY:180, ease:Back.easeOut},0);




//main.staggerFrom($('.wrapper li'),1,{scale(0)});
//ease: Elastic.easeOut.config(1.5, 0.2), y: 0

var mybubbles = document.getElementsByClassName('bg-bubbles');
$(mybubbles).hide();

queryForm.find('input, textarea').on('keyup blur focus', function (e) {
	"use strict";
	var $this = $(this),
		label = $this.prev('label');

	if (e.type === 'keyup') {
		if ($this.val() === '') {
			label.removeClass('active highlight');
			textoBien=false;
		} else {
			label.addClass('active highlight');
			textoBien=true;
		}
	} else if (e.type === 'blur') {
		if( $this.val() === '' ) {
			label.removeClass('active highlight');
			textoBien=false;
		} else {
			label.removeClass('highlight');
			textoBien=true;
		}
	} else if (e.type === 'focus') {

		if( $this.val() === '' ) {
			label.removeClass('highlight');
			textoBien=false;
		}
		else if( $this.val() !== '' ) {
			label.addClass('highlight');
			textoBien=true;
		}
	}
});



//en detalles, como el contenido debe tener un tamaño fijo
//esta función se encarga de actualizar el tamaño cuando la pantalla cambia

//$('.detalles #content').css("height",windowHeight*0.4);
queryDetaContent.css("height","0");

window.onresize = function() {
	"use strict";
	var panel = $('#panel');
	windowHeight=window.innerHeight;
	queryDetaContent.css("height",windowHeight*0.4);
	panel.css("height","100%");
	if(detallesState){
		queryDetalles.css(	"top", "50%");
		queryDetalles.css("-ms-transform","translateY(-50%) translateX(-50%) scale(1)");
		queryDetalles.css("-webkit-transform","translateY(-50%) translateX(-50%) scale(1)");
		queryDetalles.css("transform","translateY(-50%) translateX(-50%) scale(1)");
		queryDetalles.css("left","50%");
	}
	else
	{
		queryDetalles.css(	"top", "50%");
		queryDetalles.css("-ms-transform","translateY(-50%) translateX(-50%) scale(0)");
		queryDetalles.css("-webkit-transform","translateY(-50%) translateX(-50%) scale(0)");
		queryDetalles.css("transform","translateY(-50%) translateX(-50%) scale(0)");
		queryDetalles.css("left","50%");
	}
};
function errorDiv(){
	//noinspection JSUnresolvedVariable
	TweenMax.to(queryErrorDiv,0.5,{scale:1});
	queryGrayOut2.css("z-index","600");
	queryGrayOut2.css("background-color","#500000");
	grayOut2.restart();
}
function closeErrorDiv(){
	//noinspection JSUnresolvedVariable
	TweenMax.to(queryErrorDiv,0.3,{scale:0});
	queryGrayOut2.css("z-index","1");
	queryGrayOut2.css("background-color","gray");
	grayOut2.reverse();
}

function popDiv(color){
	queryPop.css("z-index","800");
	//noinspection JSUnresolvedVariable
	TweenMax.to(queryPop,0.5,{scale:1});
	queryGrayOut2.css("z-index","600");
	queryGrayOut2.css("background-color",color);
	grayOut2.restart();
}
function closepopDiv(){
	//noinspection JSUnresolvedVariable
	TweenMax.to(queryPop,0.3,{scale:0});
	queryGrayOut2.css("z-index","1");
	queryGrayOut2.css("background-color","gray");
	grayOut2.reverse();
}

function logDiv(){
	//noinspection JSUnresolvedVariable
	TweenMax.to(queryLogDiv,0.5,{scale:1});
	queryGrayOut.css("z-index","300");
	queryGrayOut.css("background-color","#500000");
	grayOut.restart();
}
//funcion usada en html
function closeLogDiv(){
	//noinspection JSUnresolvedVariable
	TweenMax.to(queryLogDiv,0.3,{scale:0});
	queryGrayOut.css("z-index","1");
	queryGrayOut.css("background-color","gray");
	grayOut.reverse();
}

//funcion usada en html
function unflipDetalles(){
	detallesFlip.reverse();
}

//Manejar el div de Eventos
function closeDivCreateEvent(){
	//noinspection JSUnresolvedVariable
	TweenMax.to(queryDivCreateEvent,0.3,{scale:0});
	queryGrayOut.css("z-index","1");
	grayOut.reverse();
	$('#recuActionSelector').empty();
}


//manejo de botones de detalles
function changeLabel(){ // jshint ignore:line
	"use strict";
	cambios = true;
	var label = $('#nodeLabel');
	label.prop("readonly",false);
	label.removeAttr("style");

	var label2 = $('#nodeDescr');
	label2.prop("readonly",false);
	label2.removeAttr("style");

	var label3 = $('.deleteNode');
	label3.css("opacity","1");
	label3.css("display","block");
	//noinspection JSUnresolvedVariable
	TweenMax.to($('.detailHelp'),0.2,{scale:0,ease:Elastic.easeOut});
	//noinspection JSUnresolvedVariable,JSUnresolvedFunction
	var edit = new TimelineMax({paused:true})
		.to($('.divNodeLabelChange'),0.2,{scale:0,ease:Elastic.easeOut})
		.to($('.divSaveNodeLabelChange'),0.2,{scale:1,ease:Elastic.easeOut});
	edit.play();
}
function saveChanges(){ // jshint ignore:line
	"use strict";
	var label = $('#nodeLabel');
	label.prop("readonly",true);
	label.css("border","0px");

	var label2 = $('#nodeDescr');
	label2.prop("readonly",true);
	label2.css("border","0px");

	var label3 = $('.deleteNode');
	label3.css("opacity","0");
	label3.css("display","none");
	//noinspection JSUnresolvedFunction,JSUnresolvedVariable
	var save = new TimelineMax({paused:true})
		.to($('.divSaveNodeLabelChange'),0.2,{scale:0,ease:Elastic.easeOut})
		.to($('.divNodeLabelChange'),0.2,{scale:1,ease:Elastic.easeOut});
	save.play();
}

$('.tab a').on('click', function (e) {
	"use strict";
	e.preventDefault();

	$(this).parent().addClass('active');
	$(this).parent().siblings().removeClass('active');

	var target = $(this).attr('href');

	$('.tab-content > div').not(target).hide();

	//noinspection JSUnresolvedVariable
	TweenMax.to($(target),1,{autoAlpha:1});
	//$(target).fadeIn(600);

});
var usr, pss;


$("#btnLogin").click(function(event){
	"use strict";
	event.preventDefault();
	formtl.reverse();
	loadtl.play();

	usr=$('#loginEmail').val();
	pss=$('#loginPassword').val();
	preloader.active(true); // jshint ignore:line
	conectar(usr,pss,'');


});
updateTime();
function updateTime()
{
	"use strict";
	var d = new Date();
	var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var day = d.getDate();
	var w = days[d.getDay()];
	var month = months[d.getMonth()];
	var h = d.getHours();
	var y = d.getFullYear();
	var m = d.getMinutes();
	var ampm = h >= 12 ? 'pm' : 'am';
	h = h % 12;
	h = h ? h : 12; // the hour '0' should be '12'
	m = m < 10 ? '0' + m : m;
	var strTime = h + ':' + m + ' ' + ampm;
	document.getElementsByClassName('time')[0].innerHTML = day + ' ' + month + ' ' + y + '<br />' + w + ' ' + strTime;
	setTimeout(updateTime,10000);
}
var body = document.body;
//Método se ejecuta al hacer click en el BotÃ³n Reload

//noinspection JSUnresolvedFunction
var timelineSettings =  new TimelineMax({paused:true});// jshint ignore:line
timelineSettings
	.to(fab,0.1,{css:{color:"#4285F4"}})
	.to(fabCtr, 0.7,{rotation:-180, xPercent:-270, transformOrigin:"left"},0);

function floatBut(){  // jshint ignore:line
	"use strict";

//fabCtr.classList.add('active');


	timelineSettings.play();
	ripple.classList.add('off');
	$('.ripple').hide();
	setTimeout(function () {
		return nav.classList.add('active');
	}, 700);
	return setTimeout(function () {
		fab.classList.add('active');
		buttl2.play();
		return links.classList.add('active');
	}, 650);
}

function closefloatBut(){ // jshint ignore:line
	"use strict";

	buttl2.reverse();
	links.classList.remove('active');
	setTimeout(function () {
		nav.classList.remove('active');
		fab.classList.remove('active');
		timelineSettings.reverse();
	}, buttl2.totalTime()*1000);

}
function goHome(){ // jshint ignore:line
	"use strict";
	preloader.active(false);
	detallestlreverse.restart();
	setTimeout(function () {
		apptl.restart();
		nodesIn();
	}, 700);

	closefloatBut();
}

//funcion que se encarga de generar popups de tres tipos,
//type: conf confirmacion (tiene botón de aceptar, cancelar)
//type: show solo muestra la información y tiene botón de Volver
//type: cont Contenedor, similar al de detalles, tiene footer del mismo color, personalizable
//recibe un Json con: header: content: type:
//nota: el contenido puede contener HTML para enviar botones y contenido
function fillPopup (control){
	queryPopHeader.empty();
	queryPopContent.empty();
	queryPopConfirm.hide();
	queryPopConfirm.off("click");
	queryPopCancel.hide();
	queryPopBack.hide();
	queryPopFooter.hide();
	queryPopHeader.text(control.header);
	queryPopContent.html(control.content);
	if(control.type=="conf"){
		queryPopConfirm.show();
		queryPopCancel.show();
	}
	else if(control.type=="show"){
		queryPopBack.show();
	}
	else if(control.type=="cont"){
		queryPopFooter.show();
	}
	popDiv(control.color);
}





//-----Funciones-------------//
//-----Manejo de Errores-----//


//resuelve la imagen para mostrar para la intensidad de la seÃ±al
function resolveRSSIImage(rssi)
{
	"use strict";
	if (rssi === undefined) {
		console.log("no encontro rssi");
		return '';
	}
	var img;
	if (Math.abs(rssi) > 95) {img = 'icon_rssi_7';}
	else if (Math.abs(rssi) > 90) {img = 'icon_rssi_6';}
	else if (Math.abs(rssi) > 85) {img = 'icon_rssi_5';}
	else if (Math.abs(rssi) > 80) {img = 'icon_rssi_4';}
	else if (Math.abs(rssi) > 75) {img = 'icon_rssi_3';}
	else if (Math.abs(rssi) > 70) {img = 'icon_rssi_2';}
	else {img = 'icon_rssi_1';}
	return '<img class="listIcon20px" src="images/'+img+'.svg" title="RSSI:-'+Math.abs(rssi)+'" onerror="this.scr=\'images/'+img+'.png\'" /> ';
}

//resuelve la imagen para mostrar para la batería (dentro de DETALLES)
function resolveBATImage(bat)
{
	"use strict";
	if (bat === "undefined")
	{
		console.log("no encontro bateria");
		return '';
	}
	var img;
	if (Math.abs(bat) > 90) {img = 'ion-battery-full';}
	else if (Math.abs(bat) > 50) {img = 'ion-battery-half';}
	else if (Math.abs(bat) > 15) {img = 'ion-battery-low';}
	else {img = 'ion-battery-empty';}
	return '<div class="'+img+' batImageInIcon"><div class="batImageIn" title=" Bat:-'+Math.abs(bat)+'">'+Math.abs(bat)+'%</div></div>';
}

//resuelve la imagen para mostrar para la batería (afuera)
function resolveBATImageOut(bat)
{
	"use strict";
	if (bat === "undefined") {return '';}
	var img;
	if (Math.abs(bat) > 15 && Math.abs(bat) < 50) {img = 'ion-battery-low';}
	else if (Math.abs(bat) > 0 && Math.abs(bat) < 16){img = 'ion-battery-empty';}
	else  {
		return '<div style:"display:none"/>;';
	}
	return '<div class="'+img+' batImageOut" title="Bat:-'+Math.abs(bat)+'"></div>';
}

//anima la salida de los nodos
function nodesIn(){ // jshint ignore:line
	"use strict";
	console.log("entra a nodesIn");
	apptl.restart();
	main.restart();
}
//anima la entrada de los nodos
function nodesOut(){ // jshint ignore:line
	"use strict";
	body.classList.remove('active');
	mainOut.restart();
}


//Construye el div de la métrica
function buildMetricDiv(node){
	"use strict";
	var armado;
	armado = '<div class="val">';
	var encontrado = false;
	var metric;
	for(var key in node.metrics) // jshint ignore:line
	{
		if(!encontrado)
		{
			metric = node.metrics[key];
			var metricValue = (metric.unit) ? (metric.value + (metric.unit || '')) : ((metric.descr || metric.name || '') + metric.value);
			armado = armado.concat("<small>"+metricValue+"</small></div>");
			encontrado=true; //para que solo tome el primer dato que encuentre
		}
	}
	armado.trim(); //le quita todos los espacios innecesarios

	return armado;
}

function ago(time, agoPrefix)
{
	"use strict";
	agoPrefix = (typeof agoPrefix !== 'undefined') ?  agoPrefix : true;
	var now = new Date().getTime();
	var update = new Date(time).getTime();
	var s = (now-update)/1000;
	var m = s/60;
	var h = s/3600;
	var d = s/86400;
	var updated = s.toFixed(0) + 's';
	if (s <5) {updated = 'Ahora';} //muestra Ahora durante 6 segundos
	if (s>=60) {updated = m.toFixed(0)+'m';}
	if (h>=2) {updated = h.toFixed(0)+'h';}
	if (h>=24) {updated = Math.floor(d)+'d' + ((s%86400)/3600).toFixed(0) + 'h';}
	//aplicación de color al texto segÃºn el tiempo que ha pasado
	var theColor = 'ff8800'; //dark orange //"rgb(255,125,20)";
	if (s<5) {theColor = "00ff00";} //dark green
	else if (s<30) {theColor = "33cc33";} //green
	else if (s<60) {theColor = 'ffcc00';} //light orange
	else if (h>=3) {theColor = 'ff0000';} //red
	theColor = '#'+theColor;
	updated = (agoPrefix && updated!=='Ahora'?'Hace ':'')+updated;
	return {text:updated,color:theColor,tag:'<span data-time="'+time+'" class="nodeAgo" style="color:'+theColor+';">'+updated+'</span>'};
}

var motesDef;
//------Aquí empieza el habla con el Socket------//
function conectar(usr,pss,cun){
	"use strict";
	$(function(){
		//Variables
		//noinspection JSUnresolvedFunction
		var socket = io(); // jshint ignore:line
		
		var metricsDef;
		var eventsDef;
		var settingsDef;
		var nodeDuration=1.2;
		// Método llamado cuando se logra una conexión con el Socket
		socket.on('connect', function(){
			socket.emit('authentication', {username: usr, password: pss,cun:cun});
			socket.on('unauthorized', function(err){
				console.log("ERROR DE AUTENTICACIÓN:", err.message);
			});
			socket.on('authenticated', function() {
				authenticated = true;
				LOGIN=usr;



//inicia animación de tabs
// Variables
				var clickedTab = $(".tabs > .active");
				var tabWrapper = $(".tab__content");
				var activeTab = tabWrapper.find(".active");
				//noinspection JSValidateTypes
				var activeTabHeight = activeTab.outerHeight();

				// Show tab on page load
				activeTab.show();

				// Set height of wrapper on page load
				tabWrapper.height(activeTabHeight);

				$(".tabs > li").on("click", function() {

					// Remove class from active tab
					$(".tabs > li").removeClass("active");

					// Add class active to clicked tab
					$(this).addClass("active");

					// Update clickedTab variable
					clickedTab = $(".tabs .active");

					// fade out active tab
					activeTab.fadeOut(250, function() {

						var tab=$(".tab__content > li");
						// Remove active class all tabs
						tab.removeClass("active");

						// Get index of clicked tab
						var clickedTabIndex = clickedTab.index();

						//tab index 0 es recursive y tab index 1 es X


						// Add class active to corresponding tab
						tab.eq(clickedTabIndex).addClass("active");

						// update new active tab
						activeTab = $(".tab__content > .active");

						// Update variable
						//noinspection JSValidateTypes
						activeTabHeight = activeTab.outerHeight();

						// Animate height of wrapper to new tab height
						tabWrapper.stop().delay(50).animate({
							height: activeTabHeight
						}, 500, function() {

							// Fade in active tab
							activeTab.delay(50).fadeIn(250);

						});
					});
				});

				// Variables
				//var colorButton = $(".colors li");
				//termina animacion de tabs


				socket.emit('authenticated');
				//LOG('Conectado!');
				//llamar la función para pasar a la función de login
				preloader.active(false); // jshint ignore:line

				var loading= document.getElementsByClassName("load");
				TweenLite.to(loading,1,{autoalpha:0}); // jshint ignore:line

				setTimeout(function() {
					$('.links').show();
				}, 600);

				links.classList.remove('active');
				fab.classList.remove('active');
				queryConnect.text("CONECTADO!");
				setTimeout(function () {
					fab.classList.add('ion-gear-a');
					return nav.classList.remove('active');
				}, 700);
				setTimeout(function () {
					queryConnect.hide();
					timelineSettings.reverse();
				}, 650);
				setTimeout(function(){
					titulo.restart();
					//apptl.restart();
					nodesIn();
				},1500);
				setTimeout(function(){
					buttl.restart();
					ripple.classList.remove('off');
				},1500);
				//abre el botón del sidebar
				slideButton.play();
				//noinspection JSUnresolvedFunction
				slideout.enableTouch();
				$("#backSlide").css("opacity","1");


			}); // aquí termina lo que se envía si fué autenticado
		}); //aquí termina el on connect

		
		socket.on("connecting",function(){console.log("conectando")});
		socket.on("reconnecting",function(){console.log("reconectando")});
		socket.on("connect_failed",function(){console.log("conectando fallido")});
		socket.on("reconnect_failed",function(){console.log("reconectando fallido")});
		//------Inicio de conexión con el servidor----//
		//Pasos:
		//MOTESDEF
		//METRICSDEF
		//EVENTSDEF
		//SETTINGSDEF

		//-----Método que recibe las definiciones de los moteinos
		socket.on('MOTESDEF', function(motesDefinition) {
			motesDef = motesDefinition;
		});

		socket.on('METRICSDEF', function(metricsDefinition) {
			metricsDef = metricsDefinition;
		});

		//----Se Reciben las definiciones de los eventos, se debe usar para crear los eventos
		socket.on('EVENTSDEF', function(eventsDefinition) {
			eventsDef = eventsDefinition;
		});

		//----Se reciben las definiciones de las opciones, se debe usar para crear el div de opciones
		socket.on('SETTINGSDEF', function(newSettingsDef) {
			settingsDef = newSettingsDef;
		});

		//----Se recibe el login en caso de hacer login por cun
		socket.on('SETLOGIN', function(newLogin) {
			if(LOGIN.length<4){
				LOGIN=newLogin;
			}
		});

		//--se recibe el Log como un arreglo
		socket.on('LOG', function(entry) {
			$('#LOGtext').val(entry.join("\n"));
			logDiv();
			closefloatBut();

			//LOG(entry);
			//refreshListUI();
			//main.staggerFrom($('.widget li'),1.5,{scale:0,ease:Elastic.easeOut.config(0.4, 0.2), y: 0 },0.3);
		});

		//-----Actualización de un nodo Especifico-----//
		socket.on('UPDATENODE', function(entry) {

			updateNode(entry,false);
			//refreshListUI();
			//main.staggerFrom($('.widget li'),1.5,{scale:0,ease:Elastic.easeOut.config(0.4, 0.2), y: 0 },0.3);
		});

		//------Recibe errores y los imprime ------//
		socket.on('ERROR', function(entry){
			queryErrorList.empty();
			var text = entry.message;
			queryErrorList.append("<li style='font-weight: 600;'>"+text+"</li>");
			errorDiv();
		});
		//------Recibe errores y los imprime ------//
		socket.on('SUCESS', function(entry){
			queryErrorList.empty();
			var text = entry.message;
			queryErrorList.append("<li style='font-weight: 600;'>"+text+"</li>");
			errorDiv();
		});

		socket.on('GETIMG', function() {
			console.log("LLEGO LA IMAGEN");
			/*var image = new Image();
			 image.src = "data:image/png;base64,"+control.source;
			 image.width= control.width;
			 image.height= control.height;
			 var div = document.getElementById('homepage');
			 image.onload = function() {
			 div.appendChild(image);
			 };*/
			//refreshListUI();
			//main.staggerFrom($('.widget li'),1.5,{scale:0,ease:Elastic.easeOut.config(0.4, 0.2), y: 0 },0.3);
		});
		//----recibir Imagen------//


		//-----Actualización de Nodos en General------//
		socket.on('UPDATENODES', function(entries) {
			//entries.sort(function(a,b){ if (a.label && b.label) return a.label < b.label ? -1 : 1; if (a.label) return -1; if (b.label) return 1; return a._id > b._id; });// jshint ignore:line
			$(".widget").empty();
			main.clear();
			//main.append(apptl);
			for (var i = 0; i < entries.length; ++i)
			{
				updateNode(entries[i],true);
				var nodo = $('.widget li')[i];
				//var nodo = document.getElementsByClassName("nodo")[i];
				nodo.addEventListener('click', function(event){clickNodo(event);}); // jshint ignore:line
				//$('.nodo').on('click',(function(){clickNodo(event);}));



			}
			if(!detallesState)
			{
				main.restart();
			}
			//main.staggerFrom($('.widget li'),1.5,{scale:0,ease:Elastic.easeOut.config(0.4, 0.2), y: 0 },0.3);
			//refreshListUI();
		});


		//-----Método temporal recibe e imprime el cun por 10 segundos
		socket.on('SETCUN', function(serverCun) {
			console.log("VIENE EL CUN!:");
			console.log(serverCun);
		});
		//Crea el Registro
		function LOG(data) {
			//$queryLog.val(new Date().toLocaleTimeString() + ' : Desconectado!\n' + queryLog.val());
			//TextArea?
			queryLog.val(new Date().toLocaleTimeString() + ' : ' + data + '\n' + queryLog.val());
			if (queryLog.val().length > 5000) {
				queryLog.val(queryLog.val().slice(0,5000));
			}
		}

		function llenarEventos(nodo){

			var lst=$('.listEvents');

			lst.empty();
			if(nodo.hasOwnProperty("eventos")){
				if(nodo.eventos.hasOwnProperty("condit")){
					for(var v=0;v<nodo.eventos.condit.length;v++){
						var evt=nodo.eventos.condit[v];
						if(evt!=null && evt.hasOwnProperty("nodo1")) {
							var condiTexto = "Cuando el nodo: " + evt.nodo1 + " tenga el estado: " + evt.state + " se ejecutará la acción: " + evt.action + " del nodo: " + evt.nodo2;
							var newBtn = $('<li class="evento"><label class="deleteEvent">X</label><div class="txtEvent">' + condiTexto + '</div></li>');
							newBtn.on('click', {
								nodeId: nodo._id,
								type: false,
								nodo1: evt.nodo1,
								nodo2: evt.nodo2,
								state: evt.state,
								action: evt.action
							}, function (event) {
								//alert(event.data.action + ' was clicked for node ' + event.data.nodeId);
								//esta linea evita el envio de doble peticion pues al generar el .on en la linea anterior se adjudica tanto al LABEL como al INPUT y por ello al hacer click se hace peticion por ambos

								$("#switch").off();
								if ($(event.target).is("label")) {
									/* click was on label */
									//Sacar la confirmación
									confirmDeleteEvent();
									selectedEvent = {
										nodeId: event.data.nodeId,
										type: event.data.type,
										nodo1: event.data.nodo1,
										nodo2: event.data.nodo2,
										state: event.data.state,
										action: event.data.action
									};
								}
								else {
									event.stopPropagation();
									return false;
								}

							});// jshint ignore:line
							lst.append(newBtn);
						}
					}
				}
				if(nodo.eventos.hasOwnProperty("recu")){
					for (var i = 0; i < nodo.eventos.recu.length; i++) {
						var evento = nodo.eventos.recu[i];
						if(evento!=null && evento.hasOwnProperty("days")) {
							var strDias = evento.days.split(",");
							var dias = [];
							//traducir números a dias
							for (var j = 0; j < strDias.length; j++) {
								if (strDias[j] === "0") {
									dias.push("D");
								}
								else if (strDias[j] === "1") {
									dias.push("L");
								}
								else if (strDias[j] === "2") {
									dias.push("Ma");
								}
								else if (strDias[j] === "3") {
									dias.push("Mi");
								}
								else if (strDias[j] === "4") {
									dias.push("J");
								}
								else if (strDias[j] === "5") {
									dias.push("V");
								}
								else if (strDias[j] === "6") {
									dias.push("S");
								}

							}
							var texto = "A las " + evento.horas + ":" + evento.minutos + " de los dias: " + dias.toString() + "<br> se ejecutara esta accion: " + evento.action;

							var newBtn2 = $('<li class="evento"><label class="deleteEvent">X</label><div class="txtEvent">' + texto + '</div></li>');
							newBtn2.on('click', {
								nodeId: nodo._id,
								type: true,
								days: evento.days,
								horas: evento.horas,
								minutos: evento.minutos,
								action: evento.action
							}, function (event) {
								//alert(event.data.action + ' was clicked for node ' + event.data.nodeId);
								//esta linea evita el envio de doble peticion pues al generar el .on en la linea anterior se adjudica tanto al LABEL como al INPUT y por ello al hacer click se hace peticion por ambos

								$("#switch").off();
								if ($(event.target).is("label")) {
									/* click was on label */
									//Sacar la confirmación
									confirmDeleteEvent();
									selectedEvent = {
										nodeId: event.data.nodeId,
										type: event.data.type,
										days: event.data.days,
										horas: event.data.horas,
										minutos: event.data.minutos,
										action: event.data.action
									};
								}
								else {
									event.stopPropagation();
									return false;
								}

							});// jshint ignore:line
							lst.append(newBtn2);
						}

					}
				}
			}



			//noinspection JSValidateTypes
			if(lst.children().length==0){
				lst.append("<li class='evento'>No Hay Eventos Programados</li>");
			}
			setTimeout(function(){
				//TweenMax.staggerFrom($('.evento'),0.5,{rotationX:-360},0.5);
			},1000);

		}
		//rellenadores
		function llenarListaNodos(label) {
			$(label).empty();
			for(var l=0; l<Object.keys(nodes).length;l++){
				var elNodo = nodes[Object.keys(nodes)[l]];
				if(elNodo.hasOwnProperty("label")){
					var newOption = $('<option value='+Object.keys(nodes)[l]+'>'+elNodo.type+": "+elNodo.label+'</option>');

					$(label).append(newOption);
				}
				else{
					var newOptionElse = $('<option value='+Object.keys(nodes)[l]+'>'+elNodo.type+'</option>');
					$(label).append(newOptionElse);
				}


			}
		}
		//le llega el label del nodo y el nodo
		function llenarAction(label,node){
			$(label).empty();
			if (motesDef[node.type] && motesDef[node.type].controls)
			{
				for (var cKey in motesDef[node.type].controls) // jshint ignore:line
				{
					var control = motesDef[node.type].controls[cKey];

					if (control.showCondition)
					{
						var f2 = eval('(' + control.showCondition + ')'); // jshint ignore:line
						////en esta parte la función que se genera única para cada tipo de respuesta estÃ¡ en el archivo metrics, sin embargo no se puede pasar como función asi que se pasa como un string, cuando llega aquí, la función eval convierte ese texto en una función, la cual se usa más adelante.
						if (!f2(node)) {
							console.log("resultado control llenar: "+f2(node));
							continue;
						}
					}
					for (var sKey in control.states) // jshint ignore:line
					{
						var state = control.states[sKey];
						//ESTA EL LA ÚNICA PARTE DE LOS CONTROLES QUE ES DIFERENTE
						//ESTA PARTE CREA EL BOTÓN CON EL NUEVO DISEÑO
						//var newBtn = $('<a href="#" >'+state.label+'</a>');
						//creación de la linea select
						var newOption = $('<option value='+state.action+'>'+state.label+'</option>');

						console.log("Linea de Accion: "+state.label);
						//si existe un atributo css en la métrica, la agrega
						$(label).append(newOption);
					}
				}
			}
			if($(""+label+" > option").length=0){

				$(label).append("<option selected='selected'>Este nodo no tiene Acciones disponibles</option>");

			}
		}
		function llenarState(label,node){
			$(label).empty();
			var metricas=node.metrics;

			for(var k in metricsDef)
			{
				console.log("variable k: "+k);
				for(var l in metricas)
				{
					console.log("variable l: "+l);
					console.log(metricsDef[k].value);
					if (metricsDef[k].name == l)
					{
						var texto=metricsDef[k].value;
						var newOption = $('<option>'+texto+'</option>');

						console.log("Linea de Estado: "+texto);
						//si existe un atributo css en la métrica, la agrega
						$(label).append(newOption);
					}
				}

			}

			if($(""+label+" > option").length=0){

				$(label).append("<option selected='selected'>Este nodo no tiene Estados disponibles</option>");

			}
		}

		//Primero se crea el eventListener y luego la funcion se encarga de las eliminaciones de nodos
		$("#eventosCreate").click(function(){openDivCreateEvent()});
		$("#confirmDeleteEventFooter").click(function(){deleteEvent();});
		$("#cancelDeleteEventFooter").click(function(){cancelDeleteEvent();});
		$("#deleteNode").click(function(){confirmDeleteNode();});
		$("#confirmDeleteFooter").click(function(){deleteNode();});
		$("#cancelDeleteFooter").click(function(){cancelDeleteNode();});
		$("#createRecurEvent").click(function(){crearEventoRecursivo();});
		$("#createConditEvent").click(function(){crearEventoCondicional();});
		$("#divShowEvents").click(function(){flipDetalles();});
		$("#openLog").click(function(){abrirLog();});
		$("#btnConfig").click(function(){abrirConfig();});
		$("#divConfigFooter").click(function(){cerrarConfig();});
		$("#confirmCambiarNombreFooter").click(function(){cambiarNombreTunel();});
		$("#cancelCambiarNombreFooter").click(function(){cancelCambiarNombre();});
		$("#confirmCambiarPassFooter").click(function(){cambiarPassTunel();});
		$("#cancelCambiarPassFooter").click(function(){cancelCambiarPass();});
		$("#confirmConfigPass").click(function(){abrirConfirmCambiarPass();});
		

		queryPopCancel.click(function(){closepopDiv();});
		queryPopBack.click(function(){closepopDiv();});
		
		

		//PopUp Fillers
		//Ejemplo de un Fill Popup, se necesita un header, un contenido que tiene el html deseado y un type,
		//si es de tipo conf, se debe configurar el .click del confirm para modelar la accion deseada
		$("#ConfigNombre").click(
			function(){
				fillPopup({
					header:"Nuevo nombre de Servidor",
					content:'<br>Nuevo Nombre:<br><input type="text" title="Nuevo Nombre" id="newName" style="width:80%; margin-bottom: 10px"><br>Recuerda no usar espacios, ni mayúsculas, ni caracteres especiales!<br>',
					type:"conf",
					color:"gray"
				});

				queryNewName= $("#newName");
				queryPopConfirm.click(function(){abrirConfigNombre();});

			});
		$("#ConfigPass").click(
			function(){
				fillPopup({
					header:"Reestablecer Contraseña",
					content:'<br>Contraseña anterior:<br><input type="text" title="Contraseña Antigua" id="oldPass" style="width:80%"><br>Contraseña Nueva:<br><input type="text" title="Nueva Contraseña" id="newPass" style="width:80%; margin-bottom: 10px"><br>Recuerda usar Mayúscula, minúscula, números y caracteres especiales!<br>',
					type:"conf",
					color:"gray"
				});

				queryNewPass= $("#newPass");
				queryOldPass= $("#oldPass");
				queryPopConfirm.click(function(){abrirConfigNombre();});

			});

		function abrirLog(){
			socket.emit("GETLOG");
		}
		

		//hace un test de un input dado, dentro de los tipos de test
		//el input es el selector, no directamente el .val()
		//tipo: tunel - no permite espacios ni caracteres especiales
		//      pass - obliga a una cantidad mínima y máxima de caracteres, obliga a usar números y mayúsculas
		function testInput(input,type){
			queryErrorList.empty();
			
			//mínimo una mayuscula, un caracter especial, un número, una minúscula y 8 caracteres
			var regPass = /(^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$)/;
			//mínimo 8 caracteres sin caracteres especiales, sólo minúsculas, sin espacios
			var regName = /(^(?!.*[!@#$&*\s])(?=.*[a-z]).{8,}$)/;
			if(type=="tunel"){
				var match = regName.exec(input.val());
				if(match!=null){
					return true;
				}
				else{
					//enviar mensaje de error y borrar el texto anterior
					queryErrorList.append("<li style='font-weight: 600;'>El nombre no cumple con los requisitos</li>");
					queryErrorList.append("<li style='font-weight: 600;'>Debe tener minimo 8 caracteres</li>");
					queryErrorList.append("<li style='font-weight: 600;'>No puede contener:</li>");
					queryErrorList.append("<li style='font-weight: 600;'>Mayúsculas</li>");
					queryErrorList.append("<li style='font-weight: 600;'>Espacios</li>");
					queryErrorList.append("<li style='font-weight: 600;'>Ni caracteres Especiales</li>");
					input.val('');
					cancelCambiarNombre();
					
				}
			}
			else if(type=="pass"){
				var matchPass = regPass.exec(input.val());
				if(matchPass!=null){
					return true;
				}
				else{
					//enviar mensaje de error y borrar el texto anterior
					queryErrorList.append("<li style='font-weight: 600;'>La contraseña no cumple con los requisitos</li>");
					queryErrorList.append("<li style='font-weight: 600;'>Debe tener minimo:</li>");
					queryErrorList.append("<li style='font-weight: 600;'>Una Mayúscula</li>");
					queryErrorList.append("<li style='font-weight: 600;'>Una Minúscula</li>");
					queryErrorList.append("<li style='font-weight: 600;'>8 caracteres</li>");
					queryErrorList.append("<li style='font-weight: 600;'>Un caracter especial(!@#$&*)</li>");
					input.val('');
					cancelCambiarPass();
				}
			}
			else{
				
			}
			//noinspection JSValidateTypes
			if(queryErrorList.children().length>0){
				//sacar el div de error
				setTimeout(errorDiv(),500);
			}
		}
		//éste método se encarga del procedimiento de cambio de nombre de túnel
		function cambiarNombreTunel(){
			//test de input
			var result = testInput(queryNewName,"tunel");
			if(result){
				socket.emit("CAMBIARNOMBRE",{nombre:queryNewName.val()});
				window.location.replace("loader.html?nombre="+queryNewName.val());
				cancelCambiarNombre();
			}
		}
		function cambiarPassTunel() {
			var result = testInput(queryNewPass,"pass");
			if(result){
			console.log("a enviar: old: " + queryOldPass.val() + " nueva: " + queryNewPass.val());
			socket.emit("CAMBIARNOMBRE", {
				login: LOGIN,
				login2: LOGIN,
				pass: queryOldPass.val(),
				pass2: queryNewPass.val()
			});
			cancelCambiarPass();
		}
		}
		function cancelCambiarPass(){
			//noinspection JSUnresolvedVariable
			TweenMax.to(selConfirmCambiarPass,0.3,{scale:0});
			queryGrayOut.css({"z-index":"300","background-color":"gray"});
			grayOut.reverse();
			grayOut.restart();
		}
		function cancelCambiarNombre(){
			//noinspection JSUnresolvedVariable
			TweenMax.to(selConfigNombre,0.3,{scale:0});
			queryGrayOut.css({"z-index":"300","background-color":"gray"});
			grayOut.reverse();
			grayOut.restart();
		}

		function abrirConfirmCambiarPass(){
			//noinspection JSUnresolvedVariable
			TweenMax.to(selConfirmCambiarPass,0.5,{scale:1});
			queryGrayOut.css({"z-index":"300","background-color":"#500000"});
			grayOut.restart();
		}
		function abrirConfigNombre(){
			//noinspection JSUnresolvedVariable
			TweenMax.to(selConfigNombre,0.5,{scale:1});
			queryGrayOut.css({"z-index":"300","background-color":"#500000"});
			grayOut.restart();
		}
		function abrirConfig(){
			if(detallesState){
				cerrarDetalles();
			}
			slideout.toggle();
			//noinspection JSUnresolvedVariable
			TweenMax.to(selConfig,0.5,{scale:1});
		}
		function cerrarConfig() {
			//noinspection JSUnresolvedVariable
			TweenMax.to(selConfig,0.3,{scale:0});
		}


		var removeByAttr = function(arr, attr, value){
			var i = arr.length;
			while(i--){
				if( arr[i]
					&& arr[i].hasOwnProperty(attr)
					&& (arguments.length > 2 && arr[i][attr] === value ) ){

					arr.splice(i,1);

				}
			}
			return arr;
		};
		function registrarNoty(listaNoty,estado){
			var encontrado = false;
			for(var i =0;i<listaNoty.length;i++){

				if(listaNoty[i].login==LOGIN){
					encontrado = true;
				}
			}
			console.log("debió haber borrado y encontrado es: "+encontrado+" y el estado es:"+estado);

			if(!encontrado&&estado){

				listaNoty.push({login:LOGIN});
				socket.emit("UPDATENODESETTINGS",selectedNodeId);
				cambios=true;
			}
			else if(encontrado&&!estado){
				removeByAttr(listaNoty,"login",LOGIN);
			}

		}

		queryNoty.click(function(){
			registrarNoty(selectedNodeId.noty,$('#noty').prop('checked'));
			socket.emit("UPDATENODESETTINGS",selectedNodeId);
			cambios=true;
		});
		//voltear el div de detalles
		function flipDetalles(){
			detallesFlip.play();
			llenarEventos(selectedNodeId);
		}
		function openDivCreateEvent(){
			//noinspection JSUnresolvedVariable
			TweenMax.to(queryDivCreateEvent,0.5,{scale:1});
			queryGrayOut.css("z-index","300");
			grayOut.restart();
			//Rellena el select del recursive
			llenarAction("#recuActionSelector",selectedNodeId);
			//rellena el select de acciones de X
			llenarState("#conditActionSelector1",selectedNodeId);
			llenarListaNodos("#conditNodeSelector");
			var A = document.getElementById('conditNodeSelector');

			//on change is a good event for this because you are guarenteed the value is different
			A.onchange = function(){
				//clear out B
				//B.length = 0;
				//get the selected value from A
				var escogido = $("#conditNodeSelector").val();
				console.log(escogido);
				llenarAction("#conditActionSelector2",nodes[escogido]);
			};
			//fire this to update B on load
			A.onchange();

		}
		function crearEventoRecursivo(){
			//variables querySelectedDays, tomar la hora de
			var node = selectedNodeId;
			queryErrorList.empty();
			var tiempo = $("#RecuTimeSelector");
			var accion = $("#recuActionSelector");
			var querySelectedDays= $('.weekOption :checked');
			var valores = tiempo.val().split(":");
			if (motesDef[node.type] && motesDef[node.type].controls)
			{
				for (var cKey in motesDef[node.type].controls) // jshint ignore:line
				{
					var control = motesDef[node.type].controls[cKey];

					if (control.showCondition)
					{
						var f2 = eval('(' + control.showCondition + ')'); // jshint ignore:line
						////en esta parte la función que se genera única para cada tipo de respuesta estÃ¡ en el archivo metrics, sin embargo no se puede pasar como función asi que se pasa como un string, cuando llega aquí, la función eval convierte ese texto en una función, la cual se usa más adelante.
						if (!f2(node)) {continue;}
					}
					for (var sKey in control.states) // jshint ignore:line
					{
						var state = control.states[sKey];
						if (state.condition)
						{
							var f3 = eval('(' + state.condition + ')'); // jshint ignore:line
							//en esta parte la función que se genera única para cada tipo de respuesta estÃ¡ en el archivo metrics, sin embargo no se puede pasar como función asi que se pasa como un string, cuando llega aquí, la función eval convierte ese texto en una función, la cual se usa mÃ¡s adelante.
							if (!f3(node)) {continue;}
						}
						//ESTA EL LA ÚNICA PARTE DE LOS CONTROLES QUE ES DIFERENTE
						//ESTA PARTE CREA EL BOTÓN CON EL NUEVO DISEÑO
						//var newBtn = $('<a href="#" >'+state.label+'</a>');
						//prueba si existe algun dia seleccionado
						if(querySelectedDays.length>0){
							//prueba si existe una hora
							if(valores.length==2){
								//Se envia un emit con: array de dias seleccionados, array con hora[0]y minutos[0] y String Accion
								var horas="";
								var minutos="";
								var days=[];
								horas = horas.concat(valores[0]);
								minutos= minutos.concat(valores[1]);
								for(var i=0;i<querySelectedDays.length;i++){
									days.push(querySelectedDays[i].value);
								}
								var dias="";
								dias=dias.concat(days.toString());
								if(accion.val()!=null){
									var noty = $('#notyEventRecu').prop('checked');
									console.log("se envia CREATE: dias: "+dias+" hora: "+horas+" minutos: "+minutos+" accion: "+accion.val()+" noty: "+noty);


									socket.emit("CREATERECURSIVEEVENT",{nodeId:node._id, action:accion.val(), nodeType:node.type, cKey:cKey, sKey:sKey,login:LOGIN,noty:noty},dias,horas,minutos);
									closeDivCreateEvent();
								}

							}
							else{
								queryErrorList.append("<li style='font-weight: 600;'>No has seleccionado la Hora</li>");
							}

						}
						else{
							queryErrorList.append("<li style='font-weight: 600;'>No has seleccionado los dias</li>");
						}
						//noinspection JSValidateTypes
						if(queryErrorList.children().length>0){
							//sacar el div de error
							errorDiv();
						}

						break;
					}
				}


			}


			//se deben des-seleccionar los dias de la semana, borrar el tiempo y las acciones

			for(var l=0;l<querySelectedDays.length;l++){
				querySelectedDays[l].checked=false;
			}
			tiempo.val('');

		}
		function crearEventoCondicional(){
			//variables querySelectedDays, tomar la hora de
			var node1=selectedNodeId._id;
			var node2=$('#conditNodeSelector').val();
			var state=$("#conditActionSelector1").find(":selected").text();
			var accion=$("#conditActionSelector2").val();
			var noty = $('#notyEventCondit').prop('checked');
			socket.emit("CREATECONDITEVENT",{nodeId:node1,nodo2:node2,state:state,action:accion,login:LOGIN,notyEvent:noty});
			closeDivCreateEvent();
		}
		function confirmDeleteNode(){
			//noinspection JSUnresolvedVariable
			TweenMax.to(selConfirmDelete,0.5,{scale:1});
			queryGrayOut.css("z-index","300");
			grayOut.restart();
		}
		function confirmDeleteEvent(){
			//noinspection JSUnresolvedVariable
			TweenMax.to(selConfirmDeleteEvent,0.5,{scale:1});
			queryGrayOut.css("z-index","300");
			grayOut.restart();
		}

		function cancelDeleteEvent(){
			//noinspection JSUnresolvedVariable
			TweenMax.to(selConfirmDeleteEvent,0.3,{scale:0});
			queryGrayOut.css("z-index","1");
			grayOut.reverse();
		}
		function deleteEvent(){
			console.log(selectedEvent);
			socket.emit("DELETEEVENT",selectedEvent);
			cancelDeleteEvent();
			//cerrarDetalles();
		}
		function cancelDeleteNode(){
			//noinspection JSUnresolvedVariable
			TweenMax.to(selConfirmDelete,0.3,{scale:0});
			queryGrayOut.css("z-index","1");
			grayOut.reverse();
		}

		function deleteNode(){
			socket.emit("DELETENODE",selectedNodeId._id,selectedNodeId.position);
			cancelDeleteNode();
			cerrarDetalles();
		}

		//Esta función debe tomar el id del nodo clickeado y actualizar el class detalles
		function clickNodo(event){
			detallesState=true;
			var id = event.currentTarget.id;
			main.pause(main.totalTime());
			nodesOut();
			setTimeout(function(){
				detallestl.restart();
			},mainOut.totalTime()*1000);
			/*

			 TweenMax.to($(".app"),1,{autoAlpha:0});
			 //$(".app").fadeOut();


			 setTimeout(function(){
			 TweenMax.to($(".detalles"),1,{autoAlpha:1});
			 //$(".detalles").fadeIn();
			 }, main.totalTime()+500);*/
			selectedNodeId = nodes[id];
			refreshNodeDetails(selectedNodeId);
		}


		//Esta función se encarga de sacar el valor de la métrica y crear un span con la información
		function metricsValues(metrics)
		{
			var label = '';
			var metric;
			for(var key in metrics)// jshint ignore:line
			{
				metric = metrics[key];
				//si la métrica tiene pin=1 (osea que se muestre afuera) entonces si crea el span
				if(metric.pin==='1' || metrics.length===1)
				{
					//en caso que sea necesario aquí se agregaría el texto de la ultima vez que se actualizo
					var agoText = ago(metric.updated).text;
					var metricValue = (metric.unit) ? (metric.value + (metric.unit || '')) : ((metric.descr || metric.name || '') + metric.value);
					//Este label incluye el color y el texto del ago
					label += '<span data-time="'+metric.updated+'" class="nodeMetricAgo" style="color:'+ago(metric.updated).color+'" title="'+agoText+'"> '+metricValue+'</span> ';

					//label += '<span data-time="'+metric.updated+'">'+metricValue+'</span> ';
				}
			}
			label=label.trim();
			return label;
		}

		//Ã©ste método se encarga del manejo de todas las métricas asociadas a un nodo (puede haber mas de una)
		function refreshNodeDetails(node) {

			$('#nodeLabel').val(node.label || 'Dale nombre a tu nodo');
			$('#nodeType').text(node.type);
			$('#nodeDescr').val(node.descr || 'Escribe una descripcion');
			var encontrado = false;
			for(var i = 0; i<node.noty.length;i++){
				if(node.noty[i].login==LOGIN){

					encontrado=true;
				}
			}
			if(encontrado){

				queryNoty.prop("checked",true);
			}
			else{
				queryNoty.prop("checked",false);
			}

			$('.nodeID').html(node._id);
			//$('.nodeUpdated').html(ago(node.updated, false).tag);
			$('#batNodo').html(resolveBATImage(node.hasOwnProperty("V")?parseInt(node.V):"undefined"));//node.metrics.Voltaje.value
			$('#rssiNodo').html(resolveRSSIImage(node.rssi) || '');
			llenarEventos(node);
			queryMetricList.empty();
			//como los nombres de las diferentes métricas son textos (no números) este loop pasa por todas las métricas
			//saca las métricas que si tienen las diferentes propiedades y crea un li con los detalles de Ã©sta
			for(var key1 in node.metrics) // jshint ignore:line
			{

				if(key1!=="Voltaje")
				{
					var metric = node.metrics[key1];
					var metricValue = metricsValues([metric]);
					//Aquí crea el li con todos los datos
					var newLI = $('<li class="metrics" id="' + key1 + '"><p metric-id="' + key1 + '" href="#metricdetails" class="metricdetails">' +  metric.label + ' <p id="details">' + ago(metric.updated, 0).tag + '<span>' + metricValue +  '</span></p></p></li>');
					queryMetricList.append(newLI);
				}
			}

			//Ahora se crea la lista de eventos relacionados
			//pasa lo mismo, como no tienen un numero hace un loop con nombres
			queryEventList.empty();
			for(var key2 in node.events) // jshint ignore:line
			{
				var evt = eventsDef[key2];
				var enabled = node.events[key2];
				if (!evt)
				{
					continue;
				}
				//crea el li
				var newEventLI = $('<li style="background-color:' + (enabled ? '#2d0' : '#d00') + '"><span class="ui-btn-icon-notext ui-icon-'+ (enabled ? (evt.icon ? evt.icon : 'action') : 'minus') + '" style="position:relative;float:left;padding:15px 10px;"></span><a event-id="' + key2 + '" href="#" class="eventEnableDisable" style="padding-top:0;padding-bottom:0;"><h2>' + evt.label + '</h2><p>' + (evt.descr || '&nbsp;') + '</p>' + '</a><a event-id="' + key2 + '" href="#" class="eventDelete" data-transition="pop" data-icon="delete"></a></li>');
				//revisa si ya hay un evento y si ya existe lo reemplaza
				var existingNode = $('#eventList').find('li#evt_' + key2);
				if(existingNode.length)
				{
					existingNode.replaceWith(newEventLI);
				}
				else
				{
					queryEventList.append(newEventLI);
				}
			}

			//Crea los botones de control
			//Los controles vienen desde metrics.js, como se va a seguir la forma en que se crean las definiciones
			//los métodos de control serán iguales
			queryNodeControls.hide();
			if (motesDef[node.type] && motesDef[node.type].controls)
			{
				var hideControls;
				queryNodeControls.empty();
				var cantidad=1;
				for (var cKey in motesDef[node.type].controls) // jshint ignore:line
				{
					var control = motesDef[node.type].controls[cKey];
					if (control.showCondition)
					{

						var f2 = eval('(' + control.showCondition + ')'); // jshint ignore:line
						//en esta parte la función que se genera única para cada tipo de respuesta estÃ¡ en el archivo metrics, sin embargo no se puede pasar como función asi que se pasa como un string, cuando llega aquí, la función eval convierte ese texto en una función, la cual se usa más adelante.
						if (!f2(node)) {
							//continue;
						}
					}
					for (var sKey in control.states) // jshint ignore:line
					{
						var state = control.states[sKey];
						if (state.condition)
						{

							var f3 = eval('(' + state.condition + ')'); // jshint ignore:line
							//en esta parte la función que se genera única para cada tipo de respuesta estÃ¡ en el archivo metrics, sin embargo no se puede pasar como función asi que se pasa como un string, cuando llega aquí, la función eval convierte ese texto en una función, la cual se usa mÃ¡s adelante.
							if (!f3(node))
							{
								continue;
							}
						}
						//ESTA EL LA ÚNICA PARTE DE LOS CONTROLES QUE ES DIFERENTE
						//ESTA PARTE CREA EL BOTÓN CON EL NUEVO DISEÑO
						//var newBtn = $('<a href="#" >'+state.label+'</a>');

						var newBtn = $('<input type="checkbox" id="switch'+cantidad+'"><label class="switch'+cantidad+'" for="switch'+cantidad+'"></label>');

						//si existe un atributo css en la métrica, la agrega

						if (state.css) {newBtn.attr('style',state.css);}

						if(state.action.includes("OFF")){
							newBtn[0].setAttribute("checked","true");
						}
						else if(state.action.includes("ON")){
							console.log("esta off");
						}


						//si existe un icono en la métrica, la agrega (iconos de ionicons.com)

						/*if (state.icon)
						 {
						 newBtn.addClass('ui-icon-' + state.icon);
						 }*/

						//Le agrega la funcionalidad al botón
						//el método y librería bind son para guardar la información para usarla en otro contexto
						//en este caso para usarla mas adelante, pero queda guardada como propiedad del botón

						newBtn.on('click', {nodeId:node._id, action:state.action, nodeType:node.type, cKey:cKey, sKey:sKey}, function(event) {
							//alert(event.data.action + ' was clicked for node ' + event.data.nodeId);
							//esta linea evita el envio de doble peticion pues al generar el .on en la linea anterior se adjudica tanto al LABEL como al INPUT y por ello al hacer click se hace peticion por ambos

							$("#switch").off();
							if ($(event.target).is("label")) {
								/* click was on label */
								socket.emit("CONTROLCLICK", {nodeId:event.data.nodeId, action:event.data.action, nodeType:event.data.nodeType, controlKey:event.data.cKey, stateKey:event.data.sKey});
								recibido=false;
								setTimeout(function(){
									if(!recibido){
										queryErrorList.empty();
										queryErrorList.append("<li style='font-weight: 600;'>No se ha recibido respuesta del nodo</li>");
										errorDiv();
									}
								},3000);
							} else {
								/* click was on checkbox */
								$(this).removeAttr("checked");
								event.stopPropagation();
								return false;
							}

						});// jshint ignore:line


						//agrega el botón a la lista de botones
						queryNodeControls.append(newBtn);
						//es un Boolean por si existe algún botón, muestra la lista de controles
						hideControls = false;

						cantidad++;
						break;
					}

					if (control.breakAfter === true)
					{
						queryNodeControls.append('<br/>');
					}
				}

				//Se revisa si existe una lista de controles
				if (hideControls===false)
				{
					queryNodeControls.show();
				}
			}
		}
		//aquí termina el método que se encarga del refresco

		function cambiarNombre(nombreTunel){
			socket.emit("CAMBIARNOMBRE",{nombre:nombreTunel,login:"",login2:"",pass:"",pass2:"",RID:""});
		}


		//Código para el botón de cerrar detalles
		$('.cerrarNodo').on('click', function(){cerrarDetalles();});
		function cerrarDetalles(){ // jshint ignore:line

			if(cambios)
			{
				selectedNodeId.descr = $('#nodeDescr').val();
				selectedNodeId.label = $('#nodeLabel').val();
				registrarNoty(selectedNodeId.noty,$('#noty').prop('checked'));
				saveChanges();
			}

			socket.emit("UPDATENODESETTINGS",selectedNodeId);
			//noinspection JSUnresolvedVariable
			TweenMax.to($('.cerrarNodo'),0.1,{scale:2,yoyo:true,repeat:5});
			//espera 500 ms para que cuando el servidor haga el broadcast por el cambio, no haga saltar el nodo durante la animación de entrada
			setTimeout(function(){
				detallestlreverse.restart();
				//$(".detalles").fadeOut();
			},500);
			setTimeout(function(){
				nodesIn();
				detallesState=false;
			},1500);
			//con esta linea el .off elimina cualquier EventHandler anterior y con el on asigna el nuevo
			$(".widget li#"+selectedNodeId._id).off().on('click', function(event){clickNodo(event);});

		}//termina cerrar detalles


		//función para agregar un nodo a la lista (si ya existe uno lo reemplaza)
		function updateNode(node,full){
			body.classList.remove('active');


			//confirma que recibió la informacion
			recibido=true;

			pruebaNodos = node;
			if (node._id) {

				nodes[node._id] = node;

				//var lowBat = node.metrics.Voltaje !== null || node.metrics.Voltaje.value <= 100;
				var labelNodo = "";
				if (node.label === undefined) {
					labelNodo = node.type;
				}
				else {
					labelNodo = node.label;
				}

				//noinspection JSUnresolvedVariable
				var newli = '<li id="' + node._id + '"><h3 style="display: none;">' + node._id + '</h3><h2>' + labelNodo + '</h2>' + buildMetricDiv(node) + resolveBATImageOut(node.metrics.hasOwnProperty("Voltaje") ? node.metrics.Voltaje.value : "undefined") + /*'<div class="nodo"></div>*/'</li>';
				var rid = node._id;
				var nodeFound = $('.widget li#' + rid);
				if (detallesState) {
					//se esconde el nodo
					nodeFound.css("transform", "matrix(0,0,0,0,0,0)");
				}
				else {
					nodeFound.css("transform", "matrix(1,0,0,1,0,0)");
				}
				if (nodeFound.length) {

					nodeFound.replaceWith(newli);
					//existingNode
				}
				else {
					$('.widget').append(newli);
				}
				if (selectedNodeId) {
					if (node._id === selectedNodeId._id) {
						refreshNodeDetails(node);
					}
				}
				//si viene de UPDATENODE solo (solo refresca un nodo)
				if (!full) {
					//se recupera el tiempo, se crea la animación y se agrega en el timeline.
					console.log("entra a updateNodeSolo");
					//noinspection JSJQueryEfficiency
					var nodeFull = $('.widget li#' + node._id);
					//noinspection JSUnresolvedVariable
					var tween = TweenMax.from(nodeFull, nodeDuration, {
						scale: 0,
						ease: Elastic.easeOut.config(0.4, 0.2),
						y: 0
					});
					main.add(tween, node.position * nodeDuration);
					//noinspection JSUnresolvedVariable
					var tweenOut = TweenMax.to(nodeFull, 0.2, {scale: 0});
					mainOut.add(tweenOut, 0);
					llenarEventos(node);

					//finalmente se recupera el event listener pues se perdió cuando se creo la nueva linea
					nodeFull.on('click', function (event) {
						clickNodo(event);
					});


					if (cambios) {
						cambios = false;
					}
					else {
						//noinspection JSUnresolvedVariable
						TweenMax.fromTo(nodeFound, 0.2, {scale: 1}, {scale: 1.1});
						//noinspection JSUnresolvedFunction
						var ipd = new TimelineMax({yoyo: true, repeat: 2, paused: true})
							.fromTo(nodeFull, 0.2, {scale: 1.1}, {scale: 1});
						ipd.restart();
					}
					//si detalles esta abierto lo esconde
					if(detallesState){
						console.log("detalles true");
						nodeFull.css("transform", "matrix(0,0,0,0,0,0)");
						selectedNodeId = node;
						test=nodeFull;
					}
					else{
						console.log("detalles false");
						//se aplica el css para que no se desaparezca el nodo cuando cambie
						nodeFull.css("transform", "matrix(1,0,0,1,0,0)");
					}
				}
				//si viene de UPDATENODES
				else {

					var uniqueNodo = $('.widget li#' + node._id);
					//noinspection JSUnresolvedVariable
					main.add(TweenMax.from(uniqueNodo, nodeDuration, {
						scale: 0,
						ease: Elastic.easeOut.config(0.4, 0.2),
						y: 0
					}), "-=1");

					//noinspection JSUnresolvedVariable
					mainOut.add(TweenMax.to(uniqueNodo, 0.2, {scale: 0}), 0);
					
				}
			}


		}
		//Termina el método de actualización de nodos

		//en caso que se cierre la conexión con el servidor:
		socket.on('disconnect', function(){
			preloader.active(true); // jshint ignore:line
			detallestlreverse.restart();
			nodesOut();
			buttl.reverse();
			slideButton.reverse();
			//noinspection JSUnresolvedFunction
			slideout.disableTouch();
			$("#backSlide").css("opacity","0");

			//LOG('Desconectado!');
			//llamar función que avise al usuario que se ha perdido la conexión
			//si se desconecto, y no estaba autenticado significa que el login attempt estuvo mal
			if(!authenticated)
			{
				//aparece un aviso indicando un login malo, crea un contador de logins fallidos
				setTimeout(function () {
					nav.classList.add('active');
				}, 700);
				setTimeout(function () {
					fab.classList.add('active');
					queryConnect.show();
					queryConnect.text("Servidor Desconectado, login fallido");
				}, 650);

				//se esconde y vuelve al form
				setTimeout(function() {
					$('.links').show();
					buttl.reverse();
					links.classList.remove('active');
					fab.classList.remove('active');
					queryConnect.text("Volviendo al formulario");
					setTimeout(function () {
						//noinspection JSUnresolvedVariable
						TweenMax.to(queryLoad,1,{autoAlpha:0});
						location.reload();
					}, 650);
				}, 3000);
			}
			else
			{

				apptl.reverse();
				$('.links').hide();
				preloader.active(true);
				loadtl.play();
				$('.ripple').hide();
				setTimeout(function () {
					nav.classList.add('active');
				}, 700);
				setTimeout(function () {
					fab.classList.add('active');
					fab.classList.remove('ion-gear-a');
					queryConnect.show();
					queryConnect.text("Servidor Desconectado, intentando reconectar...");
				}, 650);
				//Cambiar el contenido del ctr
				//Quitarle los iconos y ponerle conectándose

			}//aquí termina el if si se desconecto por perdida pero si estaba conectado

		});

	}); //aquí se cierra la función del else
} //aquí se cierra la función conectar
function listo() // jshint ignore:line
{
	"use strict";
	formtl.play();
	$('#menu').css("visibility","visible");
	

}
//***********************************************************************
//
//
// TERMINA INDEX.JS
//
//
//***********************************************************************