// **********************************************************************************
// Websocket server backend for the Moteino IoT Framework
// Hardware and software stack details: http://lowpowerlab.com/gateway
// This is a work in progress and is released without any warranties expressed or implied.
// See license.txt for license and limitations of use of this software.
// **********************************************************************************
// Based on Node.js, and following node packages:
//      socket.io, node-serialport, neDB, nodemailer, console-stamp
// **********************************************************************************
//                    BEFORE THE FIRST USE:
//       Adjust settings in settings.json5 and read the rest of this readme.
// **********************************************************************************
// NeDB is Node Embedded Database - a persistent database for Node.js, with no dependency
// Specs and documentation at: https://github.com/louischatriot/nedb 
//
// Under the hood, NeDB's persistence uses an append-only format, meaning that all updates
// and deletes actually result in lines added at the end of the datafile. The reason for
// this is that disk space is very cheap and appends are much faster than rewrites since
// they don't do a seek. The database is automatically compacted (i.e. put back in the
// one-line-per-document format) everytime your application restarts.
//
// This script is configured to compact the database every 24 hours since time of start.
// ********************************************************************************************
// Copyright Felix Rusu, Low Power Lab LLC (2015), http://lowpowerlab.com/contact
// ********************************************************************************************
// IMPORTANT details about NeDB:
// _id field is special - if not used it is automatically added and used as unique index
//                     - we can set that field when inserting to use it as an automatic unique index for fast lookups of nodes (by node Id)
// ********************************************************************************************

//python shell se encarga de crear una conexion tipo socket.io pero con el python script
var gcm = require('node-gcm');                                  //https://github.com/ToothlessGear/node-gcm
var child = require('child_process');
var readline = require('readline');
var nconf = require('nconf');                                   //https://github.com/indexzero/nconf
var JSON5 = require('json5');                                   //https://github.com/aseemk/json5
var path = require('path');
var fs = require('fs');
var scheduler = require('node-schedule');
var dbDir = 'data/db';
var metricsFile = 'metrics.js';
//noinspection JSUnresolvedFunction
nconf.argv().file({ file: path.resolve(__dirname, 'settings.json5'), format: JSON5 });
var settings = nconf.get('settings');
var dbLog = require(path.resolve(__dirname,'logUtil.js'));
//noinspection JSUnresolvedVariable
io = require('socket.io').listen(settings.general.socketPort.value);
var serialport = require("serialport");                         //https://github.com/voodootikigod/node-serialport
var Datastore = require('nedb');                                //https://github.com/louischatriot/nedb
var nodemailer = require('nodemailer');                         //https://github.com/andris9/Nodemailer
var request = require('request');
var db = new Datastore({ filename: path.join(__dirname, dbDir, settings.database.name.value), autoload: true });       //used to keep all node/metric data
//noinspection JSUnresolvedVariable
var dbunmatched = new Datastore({ filename: path.join(__dirname, dbDir, settings.database.nonMatchesName.value), autoload: true });
var dbin = new Datastore({ filename: path.join(__dirname, "data/db/gateway_log.db"), autoload: true });
var dbNotification = new Datastore({ filename: path.join(__dirname, "data/db/gateway_noty.db"), autoload: true });
var logFile = "log.txt";
var logIMG = "img.txt";

//noinspection JSUnresolvedVariable
serial = new serialport.SerialPort(settings.serial.port.value, { baudrate : settings.serial.baud.value, parser: serialport.parsers.readline("\n") }, false);
var cun;                                                        //CODIGO UNICO NUEVO
var cunTime;
var cunLogin;
var eventos = [];
var timeout=0;
db.persistence.setAutocompactionInterval(3600000);              //se compacta automaticamente cada hora
dbunmatched.persistence.setAutocompactionInterval(4000000);     //se compacta automaticamente cada hora y 6 minutos para evitar cruces

dbNotification.persistence.setAutocompactionInterval(30000000);
serial.on('error', function serialError(error) {
    //Send serial error messages to console.
    //Better error handling needs to be here in the future.
    console.log(error.message);
});


//Configuraci�n para notificaciones
// Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
var sender = new gcm.Sender("AIzaSyA3hfQjZ3xn2a_4KKA3rKaPCaP_71B7CCQ");
//se guardan todos los tokens a los que se va a enviar
var registrationTokens = [];

var recuEventList=[];
var condiEventList=[];
serial.on("data", function(data) { processSerialData(data); });

dbin.find({ _id : { $exists: true }}, function (err, entries) {
    console.log("entradas: "+entries.length);
    if(entries.length==0)
    {
        dbin.insert({usrlg: 1, user: "bewise", pass: "bewise"});
        console.log("usuario bewise creado");
    }
});

serial.open(function (err) {
    if (err) {
        return console.log('Error opening port: ', err.message);
    }

    // write errors will be emitted on the port since there is no callback to write
    console.log("puerto abierto");
});
serial.on('open', showPortOpen);
function showPortOpen() {
    console.log('port open. Data rate: ' + serial.options.baudRate+" port open?:"+serial.isOpen());
}

console.log("esta abierto: "+serial.isOpen());
metricsDef = require(path.resolve(__dirname, metricsFile));

//noinspection JSUnresolvedVariable
require("console-stamp")(console, settings.general.consoleLogDateFormat.value); //timestamp logs - https://github.com/starak/node-console-stamp
//noinspection JSUnresolvedVariable
db.persistence.setAutocompactionInterval(settings.database.compactDBInterval.value); //compact the database every 24hrs

//noinspection JSUnresolvedVariable
var transporter = nodemailer.createTransport({
    service: settings.credentials.emailservice.value, //"gmail" is preconfigured by nodemailer, but you can setup any other email client supported by nodemailer
    auth: {
        user: settings.credentials.email.value,
        pass: settings.credentials.emailpass.value
    }
});

//escribe al archivo de Log
global.escribirLog=function(txt){
    var line= new Date().toLocaleTimeString() + ' : \t' + txt + '\n';
    console.log("se va a imprimir: "+txt);
    fs.appendFile(logFile, line, 'utf8', function (err) {
        if (err) throw err;
    });
};

//global.LOG = function(data) { process.stdout.write(data || ''); }
//global.LOGln = function(data) { process.stdout.write((data || '') + '\n'); }
global.sendEmail = function(SUBJECT, BODY) {
  //noinspection JSUnresolvedVariable
    var mailOptions = {
      from: 'Moteino Gateway <gateway@moteino.com>',
      to: settings.credentials.emailAlertsTo.value, // list of receivers, comma separated
      subject: SUBJECT,
      text: BODY
      //html: '<b>Hello world ?</b>' // html body
  };
  transporter.sendMail(mailOptions, function(error, info) {
    if(error) console.log('SENDEMAIL ERROR: ' + error);
    else console.log('SENDEMAIL SUCCESS: ' + info.response);
  });
};

global.sendSMS = function(SUBJECT, BODY) {
  //noinspection JSUnresolvedVariable
    var mailOptions = {
      from: 'Moteino Gateway <gateway@moteino.com>',
      to: settings.credentials.smsAlertsTo.value, //your mobile carrier should have an email address that will generate a SMS to your phone
      subject: SUBJECT,
      text: BODY
  };
  transporter.sendMail(mailOptions, function(error, info) {
    if(error) console.log('SENDSMS error: ' + error);
    else console.log('SENDSMS SUCCESS: ' + info.response);
  });
};

global.sendMessageToNode = function(node) {
  if (metricsDef.isNumeric(node.nodeId) && node.action)
  {
    serial.write(node.nodeId + ':' + node.action + '\n', function () { serial.drain(); });
    console.log('NODEACTION: ' + JSON.stringify(node));
    console.log("Envia: "+node.nodeId + ':' + node.action + '\n');
  }
  else if (node.action)
  {
    serial.write(node.action + '\n', function () { serial.drain(); });
    console.log('NODEACTION: ' + JSON.stringify(node));
  }
};

global.sendMessageToGateway = function(msg) {
  serial.write(msg + '\n', function () { serial.drain(); });
};

global.handleNodeEvents = function(node) {
  if (node.events)
  {
    for (var key in node.events)
    {
      //noinspection JSUnfilteredForInLoop
        var enabled = node.events[key];
      if (enabled)
      {
          //noinspection JSUnfilteredForInLoop
        var evt = metricsDef.events[key];
        if (evt.serverExecute!=undefined)
          try {
            evt.serverExecute(node);
          }
          catch(ex) {console.log('Event ' + key + ' execution failed: ' + ex.message);}
      }
    }
  }
  // if (metricsDef.motes[node.type] && metricsDef.motes[node.type].events)
    // for (var eKey in metricsDef.motes[node.type].events)
    // {
      // var nodeEvent = metricsDef.motes[node.type].events[eKey];
      // if (nodeEvent.serverExecute != undefined)
        // nodeEvent.serverExecute(node);
    // }
};

//authorize handshake - make sure the request is coming from nginx, not from the outside world
//if you comment out this section, you will be able to hit this socket directly at the port it's running at, from anywhere!
//this was tested on Socket.IO v1.2.1 and will not work on older versions
//io.use(function(socket, next) {
  //var handshakeData = socket.request;
  //console.log('\nAUTHORIZING CONNECTION FROM ' + handshakeData.connection.remoteAddress + ':' + handshakeData.connection.remotePort);
  //if (handshakeData.connection.remoteAddress == "localhost" || handshakeData.connection.remoteAddress == "127.0.0.1")
    //next();
  //next(new Error('REJECTED IDENTITY, not coming from localhost'));
//});
//var socket = io;
//

//
// GENERADOR DE CUN!
//
var lista="abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.-_";
var temp='';

//Metodo para eliminar un objeto espec�fico de un array buscando por atributo
//entra: array, nombre de atributo y valor del atributo
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
var _breakOffFirstLine = /\r?\n/;
function filterStdoutDataDumpsToTextLines(callback){ //returns a function that takes chunks of stdin data, aggregates it, and passes lines one by one through to callback, all as soon as it gets them.
    var acc = '';
    return function(data){
        var splitted = data.toString().split(_breakOffFirstLine);
        var inTactLines = splitted.slice(0, splitted.length-1);
        inTactLines[0] = acc+inTactLines[0]; //if there was a partial, unended line in the previous dump, it is completed by the first section.
        acc = splitted[splitted.length-1]; //if there is a partial, unended line in this dump, store it to be completed by the next (we assume there will be a terminating newline at some point. This is, generally, a safe assumption.)

        for(var i=0; i<inTactLines.length; ++i){
            callback(inTactLines[i]);
        }
    }
}

//env�a notificaciones, llega:
//boolean control.single (true si es para un solo cliente)
// Strings: .rid .title y .body
global.sendNotification = function(logins,control){
    /* Enviando con python
    var str = "";
    dbNotification.find({ _id : { $exists: true } }, function (err, entries) {
        for (var i = 0; i < entries.length; ++i) {
            for (var j = 0; j < logins.length; j++) {
                if (entries[i].user == logins[j].login) {
                    str = (str + entries[i].rid + " ");
                    //str.push(entries[i].rid);
                }
            }

        }
        if (str != null && str.length > 0 && str.charAt(str.length - 1) == ',') {
            str = str.substring(0, str.length - 1);
        }
        console.log('string de rid arreglado: ');
        console.log(str);
        var rid = str;
        console.log("se imprime rid a enviar: "+rid);
        var title = control.title;
        var body= control.body;
        var resultado="";

        var python = child.spawn( 'python', ['/home/pi/gateway/fcmM.py', rid,title,body]);
        var chunk = '';
        python.stdout.on('data', function(data){
            chunk += data;
        } );
        python.stderr.on('data', filterStdoutDataDumpsToTextLines(function(line){
            //each time this inner function is called, you will be getting a single, complete line of the stdout ^^
            console.log("Linea de python"+line);
        }) );
        python.stdout.on('close', function( ){
            resultado=chunk;

            console.log("resultado de la ejecuci�n enviarNotificacion: "+resultado);
        } );*/
        //enviando con node.js
    
    dbNotification.find({ _id : { $exists: true } }, function (err, entries) {
        for (var i = 0; i < entries.length; ++i) {
            for (var j = 0; j < logins.length; j++) {
                if (entries[i].user == logins[j].login) {
                    registrationTokens.push(entries[i].rid);
                    //str.push(entries[i].rid);
                }
            }

        }
        var title = control.title;
        var body= control.body;
        console.log("entra a enviarNotificacion: "+body+" titulo: "+title);
        var message = new gcm.Message();
        
        message.addNotification({
            title: title,
            body: body,
            icon: 'ic_launcher',
            sound: 'default'
        });
        sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
            if(err) console.error(err);
            else    console.log(response);
        });
        registrationTokens=[];
        message=null;

    });
    
    
    
};

function generateCun(){
    temp='';
    for (var i=0;i<15;i++)
    {
        temp+=lista.charAt(Math.floor(Math.random()*lista.length))
    }
    return temp;
}

function ejecutarAction(control){
    if (control.action) sendMessageToNode({nodeId:control.nodeId, action:control.action});
    if (control.nodeType && control.controlKey && control.stateKey){
        if (metricsDef.motes[control.nodeType].controls[control.controlKey].states[control.stateKey].serverExecute != null)
        {
            db.findOne({ _id : control.nodeId }, function (err, node) {
                if (node)
                {
                    metricsDef.motes[control.nodeType].controls[control.controlKey].states[control.stateKey].serverExecute(node);
                }
            });
        }
    }
    if(Object.keys(control.notyEvent).length>0){
            console.log("ENTRA A EVENTO DISPARADO");
            sendNotification(control.notyEvent,{
                title: "Evento Disparado",
                body: "El nodo: " + control.nodeId + " ha ejecutado la acci�n: " + control.action
        });
    }
}


require('socketio-auth')(io, {
  timeout:5000,
  authenticate: function (socketio, data, callback) {

      console.log("INICIA AUTENTICACION");
      //get credentials sent by the client
      var username = data.username;
      var password = data.password;
      var clientCun = data.cun;
      var results = false;
      cunLogin=username;
      console.log("Entra a autenticar");
      dbin.findOne({user: username}, function (err, node) {
          if (node) {
              if (username == node.user && password == node.pass) {

                  console.log("EXITO EN LOGIN POR BASE DE DATOS!");
                  escribirLog("EL USUARIO: "+username+" INICIO SESION.");
                  //return callback(null, true);
                  results = true;
              }
              else {
                  console.log("fracaso en login por db datos: user: " + node.user + " pass: " + node.pass + " inputuser: " + username + " inputpass: " + password);
                  //return callback(new Error("User not found"));
                  results = false;
              }
          }
          else {
              console.log("fracaso en login por db datos: no existe user: " + username);
          }
          if (results === true) {
              
              return callback(null, true);
             
          }
          else if (clientCun === cun) {
              console.log("entro a la verificacion por CUN");
              var actualTime=new Date().getTime();
              if((actualTime-cunTime)<30000){
                  console.log("CUN menor a 30 segundos");
                  cun=null;
                  cunTime=null;
                  return callback(null, true);
              }
              else{
                  console.log("CUN mayor a 30 segundos");
                  cun=null;
                  cunTime=null;
              }
              var res=actualTime-cunTime;
              console.log("actualTime: "+actualTime+" cunTime: "+cunTime+" resultado: "+res);
          }
          else {
              console.log("comparacion: " + clientCun + " y server:" + cun + "y loginCun: "+cunLogin);
              cun=null;
              cunTime=null;
              return callback(new Error("User not found and cun failed"));
          }
      });
      /*
       var options = {
       mode: 'text',
       args: [username, password]
       }
       console.log("alguien inicio sesion con user: "+username+" y pass: "+password);
       PythonShell.run('/home/pi/gateway/pythonFolder/user.py', options, function (err, results) {
       console.log("entro al python y resulto: "+results);*/
        console.log("estado Results: "+results);
     

      
  }});

//aqui termina la modificacion de seguridad al socket
setInterval(function () {
    if (timeout > 0) {
        timeout -= 1
    }
}, 1000);
//se modifico connection a authenticated, en el input (entre parentesis) se elimin� socket pues ya se esta declarando mas arriba
//antes iniciaba con io.sockets.on (escuchaba todos los sockets) ahora inicia con el socket que se encontr� mas arriba socket.on
io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('authenticated', function () {
  console.log("le llego authenticated");
        //generateCun();
  //noinspection JSUnresolvedVariable
        var address = socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
  //var port = socket.request.connection.remotePort;
  //guarda el proceso actual 
  var actualProcess="authenticatedOK";
  console.log("NEW CONNECTION FROM " + address /*+ ":" + port*/);
  socket.emit('MOTESDEF', metricsDef.motes);
  socket.emit('METRICSDEF', metricsDef.metrics);
  socket.emit('EVENTSDEF', recuEventList);
  socket.emit('SETTINGSDEF', settings);
  socket.emit('PROCESS', actualProcess);
        if(cun==null&& cunTime==null){
            cun=generateCun();
            cunTime=new Date().getTime();
        }
        if(cunLogin!=null){
            socket.emit('SETLOGIN',cunLogin);
            cunLogin=null;
        }
  socket.emit('SETCUN',cun);
  socket.emit('UPDATEEVENTS',recuEventList,true);
  socket.emit('UPDATEEVENTS',condiEventList,false);      
        console.log("cun puesto: "+cun+" cunTime: "+cunTime);
        

        
        //funcion se encarga de actualizar las posiciones de los nodos cuando existe una eliminacion
//le entra un int del nodo eliminado
        function updatePositions(deleted){
            db.find({ _id : { $exists: true } }, function (err, entries) {
                //console.log("New connection found docs: " + entries.length);
                for (var i = 0; i < entries.length; ++i)
                {
                    if(entries[i].position>deleted)
                    {
                        entries[i].position=entries[i].position - 1;
                    }

                }
                socket.emit('UPDATENODES', entries);

            });
        }

  db.find({ _id : { $exists: true } }, function (err, entries) {
    //console.log("New connection found docs: " + entries.length);
      console.log("Update Nodes from connection");
    socket.emit('UPDATENODES', entries);
  });
       

  socket.on('UPDATENODESETTINGS', function (node) {
    db.find({ _id : node._id }, function (err, entries) {
      if (entries.length == 1)
      {
        var dbNode = entries[0];
        dbNode.type = node.type||undefined;
        dbNode.label = node.label||undefined;
        dbNode.descr = node.descr||undefined;
          dbNode.noty=[];
          for(var x = 0; x<node.noty.length;x++){
              dbNode.noty[x]=node.noty[x];
          }
        dbNode.hidden = (node.hidden == 1 ? 1 : undefined);
        db.update({ _id: dbNode._id }, { $set : dbNode}, {}, function (err, numReplaced) { /*console.log('UPDATENODESETTINGS records replaced:' + numReplaced);*/ });
        io.sockets.emit('UPDATENODE', dbNode);
          db.find({ _id : { $exists: true } }, function (err, entries) {
              console.log("Update Nodes from updateNodeSettings");
              socket.emit('UPDATENODES', entries);
          });  
          //post it back to all clients to confirm UI changes
        //console.log("UPDATE NODE SETTINGS found docs:" + entries.length);
      }
    });
  });

  socket.on('UPDATEMETRICSETTINGS', function (nodeId, metricKey, metric) {
    db.find({ _id : nodeId }, function (err, entries) {
      if (entries.length == 1)
      {
        var dbNode = entries[0];
        dbNode.metrics[metricKey].label = metric.label;
        dbNode.metrics[metricKey].pin = metric.pin;
        dbNode.metrics[metricKey].graph = metric.graph;
        db.update({ _id: dbNode._id }, { $set : dbNode}, {}, function (err, numReplaced) { /*console.log('UPDATEMETRICSETTINGS records replaced:' + numReplaced);*/ });
        io.sockets.emit('UPDATENODE', dbNode); //post it back to all clients to confirm UI changes
      }
    });
  });

  socket.on('EDITNODEEVENT', function (nodeId, eventKey, enabled, remove) {
    //console.log('**** EDITNODEEVENT  **** key:' + eventKey + ' enabled:' + enabled + ' remove:' + remove);
    db.find({ _id : nodeId }, function (err, entries) {
      if (entries.length == 1)
      {
        var dbNode = entries[0];

        //cross check key to ensure it exists, then add it to the node events collection and persist to DB
        for(var key in metricsDef.events)
          if (eventKey == key)
          {
            if (!dbNode.events) dbNode.events = {};
            dbNode.events[eventKey] = (remove ? undefined : (enabled ? 1 : 0));
            db.update({ _id: dbNode._id }, { $set : dbNode}, {}, function (err, numReplaced) { /*console.log('UPDATEMETRICSETTINGS records replaced:' + numReplaced);*/ });

            if (metricsDef.events[eventKey] && metricsDef.events[eventKey].scheduledExecute)
              if (enabled && !remove)
                { //noinspection JSUnresolvedFunction
                    schedule(dbNode, eventKey);
                }
              else //either disabled or removed
                { //noinspection JSUnresolvedVariable
                    for(var s in scheduledEvents)
                          { //noinspection JSUnresolvedVariable,JSUnfilteredForInLoop
                              if (scheduledEvents[s].nodeId == nodeId && scheduledEvents[s].eventKey == eventKey)
                                    {
                                      console.log('**** REMOVING SCHEDULED EVENT - nodeId:' + nodeId + ' event:' + eventKey);
                                        //noinspection JSUnresolvedVariable,JSUnfilteredForInLoop
                                        clearTimeout(scheduledEvents[s].timer);
                                        //noinspection JSUnresolvedVariable,JSUnfilteredForInLoop
                                        scheduledEvents.splice(scheduledEvents.indexOf(scheduledEvents[s]), 1)
                                    }
                          }
                }

            io.sockets.emit('UPDATENODE', dbNode); //post it back to all clients to confirm UI changes
            return;
          }
      }
    });
  });

  socket.on('DELETENODE', function (nodeId,position) {
          updatePositions(position);
	  
    db.remove({ _id : nodeId }, function (err, removedCount) {
      console.log('DELETED entries: ' + removedCount);
     /*
      var options = {
    		  mode: 'text',
    		  args: [nodeId]
    		}
  	  
  	PythonShell.run('/home/pi/gateway/pythonFolder/eliminar.py', options, function (err, results) {
  	  if (err) throw err;
  	  console.log(err);
  	  console.log(results);
  	});*/
      
      db.find({ _id : { $exists: true } }, function (err, entries) {
          console.log("Update Nodes from deletenode");
        io.sockets.emit('UPDATENODES', entries);
      });
    });

    //noinspection JSUnresolvedVariable
      for(var s in scheduledEvents)
      { //noinspection JSUnfilteredForInLoop,JSUnresolvedVariable
          if (scheduledEvents[s].nodeId == nodeId)
                {
                    //noinspection JSUnresolvedVariable,JSUnfilteredForInLoop
                    console.log('**** REMOVING SCHEDULED EVENT FOR DELETED NODE - NodeId:' + nodeId + ' event:' + scheduledEvents[s].eventKey);
                    //noinspection JSUnresolvedVariable,JSUnfilteredForInLoop
                    clearTimeout(scheduledEvents[s].timer);
                    //noinspection JSUnresolvedVariable,JSUnfilteredForInLoop
                    scheduledEvents.splice(scheduledEvents.indexOf(scheduledEvents[s]), 1);
                }
      }
  });

  socket.on('DELETENODEMETRIC', function (nodeId, metricKey) {
    db.find({ _id : nodeId }, function (err, entries) {
      if (entries.length == 1)
      {
        var dbNode = entries[0];
        dbNode.metrics[metricKey] = undefined;
        db.update({ _id: dbNode._id }, { $set : dbNode}, {}, function (err, numReplaced) { console.log('DELETENODEMETRIC DB-Replaced:' + numReplaced); });
        io.sockets.emit('UPDATENODE', dbNode); //post it back to all clients to confirm UI changes
      }
    });
  });


    //este metodo se encarga de eliminar eventos previamente seleccionados
    //type: (boolean: recursive=true condit=false) tipo para identificar el tipo de event control que llega
    //eventControl trae los datos del evento para hacer comparaci�n
    socket.on('DELETEEVENT', function (event) {
        db.find({ _id : event.nodeId }, function (err, entries) {
            if (entries.length == 1)
            {
                var dbNode = entries[0];
                //dbNode.metrics[metricKey] = undefined;
               //si es recursive
                if(event.type)
                {
                    
                    var temp1=dbNode.eventos.recu;
                    for (var obj=0 ;obj<temp1.length;obj++)
                    {
                        //Se asegura que el evento que llega sea igual al que se va a modificar
                        if(temp1[obj].days==event.days && temp1[obj].horas==event.horas && temp1[obj].minutos==event.minutos && temp1[obj].action==event.action){
                            console.log("comparaci�n: id: "+obj+" 1-: "+temp1[obj].days+" y "+event.days+" + "+temp1[obj].horas+" y "+event.horas+" + "+temp1[obj].minutos+" y "+event.minutos+" + "+temp1[obj].action+" y "+event.action);
                            removeByAttr(temp1,"days",temp1[obj].days);
                             db.update({ _id: dbNode._id }, { $set : dbNode}, {}, function (err, numReplaced) { console.log('DELETEEVENT DB-Replaced:' + numReplaced); });
                        } 
                    }
                    
                 }
                //si es condit
                else{
                    var temp2=dbNode.eventos.condit;
                    for (var obj1=0;obj1<temp2.length;obj1++)
                    {
                        
                        if(temp2[obj1].nodo1==event.nodo1 && temp2[obj1].nodo2==event.nodo2 && temp2[obj1].state==event.state && temp2[obj1].action==event.action){
                            removeByAttr(temp2,"nodo1",temp2[obj1].nodo1);
                            db.update({ _id: dbNode._id }, { $set : dbNode}, {}, function (err, numReplaced) { console.log('DELETEEVENT DB-Replaced:' + numReplaced); });
                        }
                    }}
                io.sockets.emit('UPDATENODE', dbNode); //post it back to all clients to confirm UI changes
            }
        });
    });

  socket.on('GETLOG', function (){
      var array = fs.readFileSync(logFile).toString().split("\n");
      socket.emit('LOG',array);
  });

  socket.on('SETIMG', function (control){
      /*var image = new Image();
      image.src = control.src;
      image.width= control.width;
      image.height= control.height;*/
      fs.writeFile('/www/images/home.png', control.source, 'base64', function(err){
          if (err) throw err;
          console.log('File saved.')
      });
      io.sockets.emit('GETIMG',control);
      
  });
        

        //Este metodo se encarga de manejar los botones que se usan en la interfaz
  socket.on('CONTROLCLICK', function (control) {
      console.log("envi� un click para el nodo: "+control.nodeId+" pidiendo: "+control.action);
    if (control.action) sendMessageToNode({nodeId:control.nodeId, action:control.action});
    //console.log('CONTROLCLICK:' + JSON.stringify(control));
    if (control.nodeType && control.controlKey && control.stateKey)
      if (metricsDef.motes[control.nodeType].controls[control.controlKey].states[control.stateKey].serverExecute != null)
      {
        db.findOne({ _id : control.nodeId }, function (err, node) {
          if (node)
          {
            //console.log('CONTROLCLICK running node:' + JSON.stringify(node));
            metricsDef.motes[control.nodeType].controls[control.controlKey].states[control.stateKey].serverExecute(node);
          }
        });
      }
      //todo: crear m�todo para modificar la lista de eventos recursivos (cargar todos los eventos y recrear toda la lista para incluir los nuevos noty)
      //si es condicional solamente se modifica en base de datos
      //hasta ahora lo �nico que cambia es noty
      socket.on('CHANGEEVENTSETTINGS', function (control) {
          
      });
      
  });
        //Este metodo se encarga de manejar los botones que se usan en la interfaz 
        socket.on('CREATERECURSIVEEVENT', function (control,dias,horas,minutos,accion) {
            console.log("llego un evento recursivo: "+control.nodeId+" pidiendo: "+"dias: "+dias+" hora: "+horas+" minutos: "+minutos+" accion: "+control.action+" noty: "+control.noty+" login: "+control.login);
            var crontxt= "0 "+minutos+" "+horas+" * * "+dias;
            console.log(crontxt);
            var newEvent = scheduler.scheduleJob(crontxt, function(){
                ejecutarAction({nodeId:control.nodeId,action:control.action,notyEvent:{login:control.login}});
            });
            eventos.push(newEvent);
            var tempObject={nodeId:control.nodeId,days:dias,horas:horas,minutos:minutos,action:control.action,notyEvent:{login:control.login}};
            console.log("tama�o antes: "+recuEventList.length);
            recuEventList.push(tempObject);
            console.log("tama�o despues: "+recuEventList.length);
            db.findOne({_id:control.nodeId}, function (err, entries) {
                console.log("entrada: "+entries+" tama�o: "+entries._id);
                if(entries.eventos== undefined) {
                    entries.eventos={};
                }
                if(entries.eventos.recu == undefined) {
                    entries.eventos.recu=[];
                }
                var notyEvent=[];
                if(control.noty){
                    notyEvent.push({login:control.login});
                }
                console.log("estado de noty: "+notyEvent.length);
                var newEvent={days:dias,horas:horas,minutos:minutos,action:control.action,notyEvent:notyEvent};
                entries.eventos.recu.push(newEvent);
                db.update({ _id: control.nodeId }, { $set : entries}, {}, function () {});
                console.log('   [' + control.nodeId + '] DB-Insert new _id:' + control.nodeId);
                socket.emit('UPDATENODE',entries);
                escribirLog("EL USUARIO: "+control.login+" CREO UN EVENTO RECURSIVO: "+control.nodeId+" PIDIENDO QUE LOS DIAS: "+dias+" A LA HORA: "+horas+":"+minutos+" EJECUTARA LA ACCION: "+control.action+" NOTIFICANDO A: "+control.noty);
                
            });
            socket.emit("UPDATEEVENTS",recuEventList,true);
        });

        //Este metodo se encarga de manejar los botones que se usan en la interfaz
        socket.on('CREATECONDITEVENT', function (control) {
            console.log("Llego un evento Condicional: "+control.nodeId+" pidiendo que cuando: "+control.state+" entonces el nodo: "+control.nodo2+" ejecute la accion: "+control.action);
           //Guarda el condicional en base de daos
            db.findOne({_id:control.nodeId}, function (err, entries) {
                console.log("entrada: "+entries+" tama�o: "+entries._id);
                if(entries.eventos== undefined) {
                    entries.eventos={};
                }
                if(entries.eventos.condit == undefined) {
                    entries.eventos.condit=[];
                }
                var notyEvent=[];
                if(control.noty){
                    notyEvent.push({login:control.login});
                }
                var newEvent={nodo1:control.nodeId,nodo2:control.nodo2,state:control.state,action:control.action,notyEvent:notyEvent};
                entries.eventos.condit.push(newEvent);
                db.update({ _id: control.nodeId }, { $set : entries}, {}, function () {});
                console.log('   [' + control.nodeId + '] DBConditEvent-Insert new _id:' + control.nodeId);
                escribirLog("EL USUARIO: "+control.login+" CREA UN EVENTO CONDICIONAL: "+control.nodeId+" PIDIENDO QUE CUANDO: "+control.state+" ENTONCES EL NODO: "+control.nodo2+" EJECUTE LA ACCION: "+control.action);
                socket.emit('UPDATENODE',entries);
            });
            socket.emit("UPDATEEVENTS",recuEventList,true);
        });

  socket.on('NODEMESSAGE', function (msg) {
    sendMessageToNode(msg);
  });
  
  socket.on('PROCESS', function (type) {
    actualProcess = type+"Ok";
  });
  
  /*socket.on('first-time', function () {
  console.log("entro a first time");
  var options = {
	    		  mode: 'text',
	    		  args: ["bewise", "bewise"]
	    		};
    PythonShell.run('/home/pi/gateway/user.py', options, function (err, results) {
  	    if (err) throw err;
         if(results)
         {
           console.log("entro al python user y: "+ results);
           socket.emit("FIRST-TIME");
         } 
  	  });
     socket.disconnect();
  });*/
  
  //metodo para escuchar cuando el usuario ingresa un nuevo nombre y llama el script de python
  socket.on('CAMBIARNOMBRE', function (control) {
      console.log(control);
      console.log('inicia creacion de archivo llega: nombre' + control.nombre + "login 1: " + control.login + " 2: " + control.login2 + " pass1: " + control.pass + " pass2: " + control.pass2);
      //socket.emit('LOG', 'inicia creaci?n de archivo de configuracion para: ' + control.nombre);

      var resultado = "";
      if (control.hasOwnProperty("login")) {
          cambiarLogin(control.login, control.login2, control.pass, control.pass2);
          if (control.login !== control.login2) {
              registerNotify(control.login2, control.rid);
          }
      }
          /*var options = {
           mode: 'text',
           args: [Nombre]
           };*/

          /*PythonShell.run('/home/pi/gateway/test.py', options, function (err, results) {
           if (err) throw err;
           console.log(err);
           resultado = results;
           });*/
          var python = child.spawn('python', ['/home/pi/gateway/test.py', control.nombre]);
          var chunk = '';
          python.stdout.on('data', function (data) {
              chunk += data;
          });
          python.stdout.on('close', function () {
              resultado = chunk;
          });
          python.stderr.on('data', function (data) {
              console.log(data);
          });

          console.log(resultado.indexOf("existe"));
          console.log(resultado);
          if (resultado.indexOf("existe") > -1) {
              //socket.emit('LOG', results+" parece que existe");
              socket.emit('EXISTENTE');
          }
          else {
              escribirLog('NO EXISTE NOMBRE, INICIA CREACION DE TUNEL');
              socket.emit('CREADO');
              socket.emit('PROCESS', "cambiarnombreOK");

              /*PythonShell.run('/home/pi/gateway/creador.py', options, function (erroo) {
               if (erroo) throw erroo;
               console.log(erroo);
               });
               }*/
              var nuevo = 0;
              if (control.login == "bewise") {
                  nuevo = 1;
              }
              var python2 = child.spawn('python', ['/home/pi/gateway/creador.py', control.nombre, nuevo]);
              var chunk2 = '';
              python2.stdout.on('data', function (data) {
                  chunk += data;
              });
              python2.stdout.on('close', function () {
                  console.log(chunk2);
              });
            }
  });
        function registerNotify(login, noty){
            console.log('inicia registro de id');
            escribirLog('INICIA REGISTRO DE NOTIFICACIONES PARA: ' + login );

            var entry={user:login,rid:noty};
            dbNotification.insert(entry);
            console.log('   [' + login + '] DBNoty-Insert:' + noty);
            
        }
        
        //Registra un RID
        socket.on('REGNOTIFY', function ( control) {
            registerNotify(control.login, control.rid);
        });
        //Actualiza un RID
        socket.on('CAMBIARNOTIFY', function (noty, noty2) {
            console.log('inicia cambio de login');
            //socket.emit('LOG', 'inicia creaci?n de archivo de configuracion para: ' + noty + ' y noty 2: '+noty2);

            dbNotification.findOne({rid:noty}, function (err, login, entries) {
                    var upd = {user: login, rid: noty2};
                    dbNotification.update({rid: entries.rid}, {$set: upd}, {}, function (err, numReplaced) {
                        console.log('   [' + entries.usrlg + '] DBNoty-Updates:' + numReplaced);
                    });
            });
        });

        function cambiarLogin(login, login2, pass, pass2){
            console.log('inicia cambio de login');
            //socket.emit('LOG', 'inicia creaci?n de archivo de configuracion para: ' + login + ' con pass: ******');
            var resultado = false;
            dbin.findOne({user: login,pass:pass}, function (err, entries) {
                if(entries) {
                    console.log("usrlg: " + entries.usrlg + " entries.user " + entries.user + " entries.pass " + entries.pass);
                    var upd = {usrlg: entries.usrlg, user: login2, pass: pass2};
                    dbin.update({_id: entries._id}, {$set: upd}, {}, function (err, numReplaced) {
                        resultado = true;
                        
                        socket.emit("SUCESS", {message: "Cambio de contraseña Exitoso"});
                        console.log('   [' + entries.usrlg + '] DBLogin-Updates:' + numReplaced);
                            
                    });
                    
                }
                else{
                    socket.emit("ERROR",{message:"No se encontró ningun usuario con los datos especificados"});
                    return resultado;
                }
            });
        }
    //para actualizar un login, llega login antiguo, login nuevo, pass antiguo, pass nuevo
  socket.on('CAMBIARLOGIN', function ( login, login2, pass , pass2) {
      cambiarLogin(login,login2,pass,pass2);
      
  });
        //para agregar un nuevo usuario como login
  socket.on('AGREGARLOGIN', function ( control ) {
        console.log('inicia creacion de login');
        escribirLog('SE AGREGA UN NUEVO USUARIO CON LOGIN: ' + control.login);

        dbin.find({ _id : { $exists: true }}, function (err, entries) {
            var posicion2=0;
            var found = false;
            //for para obtener el id m�s alto
            for (var i = 0; i < entries.length&&!found; ++i) {
                if (entries[i].usrlg > posicion2) {
                    found = true;
                }
                else {
                    posicion2++;
                }
            }
            var entry = {usrlg:posicion2,user:control.login,pass:control.pass};
            dbin.insert(entry);
            registerNotify(control.login,control.rid);
            socket.emit('PROCESS', "agregarLoginOK");
            console.log('   ['+posicion2+'] DB-Insert new Login');


        });
  });
  
  socket.on('GATEWAYMESSAGE', function (msg) {
    sendMessageToGateway(msg);
  });

  socket.on('INJECTNODE', function(node) {
    if (metricsDef.isNumeric(node.nodeId))
    {
      node.nodeId = parseInt(node.nodeId);
      //only add node if given ID does not already exist in the DB
      db.findOne({_id:node.nodeId}, function (err, doc) {
        if (doc == null)
        {
          var entry = { _id:node.nodeId, updated:(new Date).getTime(), label:node.label || 'NEW NODE', metrics:{} };
          db.insert(entry);
          console.log('   ['+node.nodeId+'] DB-Insert new _id:' + node.nodeId);
          //socket.emit('LOG', 'NODE INJECTED, ID: ' + node.nodeId);
          io.sockets.emit('UPDATENODE', entry);
        }
        //else
          //socket.emit('LOG', 'CANNOT INJECT NODE, ID ALREADY EXISTS: ' + node.nodeId);
      });
    }
    //else socket.emit('LOG', 'CANNOT INJECT NODE, INVALID NEW ID: ' + node.nodeId);
  });

  socket.on('GETGRAPHDATA', function (nodeId, metricKey, start, end) {
    var sts = Math.floor(start / 1000); //get timestamp in whole seconds
    var ets = Math.floor(end / 1000); //get timestamp in whole seconds
    var logfile = path.join(__dirname, dbDir, dbLog.getLogName(nodeId,metricKey));
    var graphData = dbLog.getData(logfile, sts, ets);
    var graphOptions={};
    for(var k in metricsDef.metrics)
    {
      //noinspection JSUnfilteredForInLoop
        if (metricsDef.metrics[k].name == metricKey)
      {
        //noinspection JSUnfilteredForInLoop
          if (metricsDef.metrics[k].graphOptions != undefined)
          { //noinspection JSUnfilteredForInLoop
              graphOptions = metricsDef.metrics[k].graphOptions;
          }
        break;
      }
    }
    graphOptions.metricName=metricKey;
    socket.emit('GRAPHDATAREADY', { graphData:graphData, options : graphOptions });
  });

  socket.on('UPDATESETTINGSDEF', function (newSettings) {
    var settings = nconf.get('settings');

    for(var sectionName in settings)
    {
      //noinspection JSUnfilteredForInLoop
        var sectionSettings = settings[sectionName];
      //noinspection JSUnresolvedVariable
        if (sectionSettings.exposed===false || sectionSettings.editable===false) continue;
      for(var settingName in sectionSettings)
      {
        //noinspection JSUnfilteredForInLoop
          var setting = sectionSettings[settingName];
        //noinspection JSUnresolvedVariable
          if (setting.exposed===false || setting.editable===false) continue;
        //noinspection JSUnfilteredForInLoop
          if (setting.value == undefined || newSettings[sectionName][settingName].value == undefined) continue;
        //noinspection JSUnfilteredForInLoop
          setting.value = newSettings[sectionName][settingName].value;
      }
    }

    global.settings = settings;

    //noinspection JSCheckFunctionSignatures
      nconf.save(function (err) {
      if (err !=null){}
        //socket.emit('LOG', 'UPDATESETTINGSDEF ERROR: '+err);
      else
      {
        global.metricsDef = require(path.resolve(__dirname, metricsFile));
        io.sockets.emit('SETTINGSDEF', settings);
      }
    });
  });

  socket.on('PROCESSEXIT', function () {
    console.log('PROCESS EXIT REQUESTED from ' + address);
    process.exit();
  });
});
});//termina el io.on

global.msgHistory = [];
global.processSerialData = function (data) {
    var position=0;
    //se inicia contando los elementos de la base de datos (para determinar la posicion)
    db.count({}, function (err, count) {
        position=count;
    });
    
  //con la siguiente instrucci?n se crea un regex que recibe [id]textoenviado[rssi|ss:intensidadse?al]
  //var regexMaster = /\[(\d+)\]([^\[\]\n]+)(?:\[(?:RSSI|SS)\:-?(\d+)\])?.*/gi; //modifiers: g:global i:caseinsensitive
  var regexMaster = /\[(\d+)\] iD\:(\w{3})([^\[\]\n]+)(?:\[(?:RX_RSSI)\:-?(\d+)\])?.*/gi; //modifiers: g:global i:caseinsensitive

  //la siguiente opera la pregunta en los datos de entrada y los guarda en grupos
  //por referencia, cada grupo inicia con un ( y termina en un )
  //sin embargo en este caso el primer grupo el par?ntesis s?lo recoge los n?meros (d+)
  //en este caso el primer grupo es [id]
  //segundo grupo: textoenviado
  //tercer grupo : RSSI|SS:intensidad
  var match = regexMaster.exec(data);
    //variable qiue guarda el nodo en el estado anterior
    var antes=null;
    //variable que guarda el cambio en un valor de estado
    var diferencia=null;
  console.log('>: ' + data);
  if(match!=null)
  {
	  var msgTokens = match[3];
	  var id = parseInt(match[1]); //get ID of node
	  //esta pregunta hace que cualquier mensaje que no tenga ese formato de datos se guarda en una base de datos diferente
	  //en este caso: db_unmatched
      db.findOne({_id:id}, function (err, doc) {
          if (doc != null)
          {
              antes=doc;
          }
      });


              //INICIA LA CREACI?N AUTOMATICA DE ID!
	  var substring = "LOGIN";
	  var posicion=2;
	  var encontrado=false;
	  if(msgTokens.indexOf(substring) > -1)
    	{
    		//inicia registro en base de datos casual 

            var posicion2 =2;
            var found= false;
            

            db.find({ _id : { $exists: true } }, function (err, entries) {
                //console.log("New connection found docs: " + entries.length);
                for (var i = 0; i < entries.length&&!found; ++i) {
                    if(entries[i]._id>posicion2){
                        found=true;
                    }
                    else{
                        posicion2++;
                    }
                    
                }
                serial.write(id + ':LOGIN,' + posicion2 + '\n', function () { serial.drain(); });
                found=true;
            });
    		//Inicia la b?squeda en la base de datos 
    		//por alguna razon no para y sigue hasta el final
    
    	if(encontrado)
    	{
    	}
    	}
  }
    //Termina la Asignaci?n de ID
  
  if (match != null && posicion>1)
  { 
	//esta variable guarda el texto dentro de "textoenviado" (toma el segundo grupo)
    //var msgTokens = match[3];
    //esta variable recibe el id del nodo (toma el primer grupo)
    //var id = parseInt(match[1]); //get ID of node
    //esta variable guarda la intensidad de la se?al
    var rssi = match[4] != undefined ? parseInt(match[4]) : undefined; //get rssi (signal strength)
    //esta variable guarda el tipo de nodo
    var tipo = match[2];
    // esta variable se encarga de traducir el mensaje del nodo a las m?tricas 
    var tipoBien;
    var definiciones = metricsDef.motes;
    for(var motes in definiciones)
     {
    	var traduccion;
    	//traducci�n
    	if (tipo=='TEM') 
    		traduccion='Temperatura'; 
    	else if(tipo=='PYV') 
    		traduccion='Puertas'; 
    	else if(tipo=='GAS') 
    		traduccion='Gas'; 
    	else if (tipo=='MOV')
            traduccion='Movimiento';
        else if (tipo=='OUT')
            traduccion='Outlet';
        else if (tipo=='OUD')
            traduccion='Outlet2';
        else if (tipo=='CTR')
            traduccion='Control';
            
    	else
    		traduccion='undefined';
    	if(traduccion==(definiciones[motes].label))
    		{
    		 tipoBien=definiciones[motes].label;
    		}
     }
    

    //esta funcion .find se encarga de buscar lineas en la base de datos que correspondan con el id encontrado
    //la funcion retorna ya sea un mensaje de error, un texto vacio si no encuentra nada o un texto completo al encontrar alguno
    db.find({ _id : id }, function (err, entries) {
      //primero crea un objeto que tendr? toda la informaci?n a guardar
      var existingNode = {};
      //crea un boolean si el nodo encontrado tiene alguna m?trica
      var hasMatchedMetrics = false;
      //comprueba si la funci?n encontr? algun nodo existente
      if (entries.length == 1)
      { //update
    	//asigna el texto completo existente del nodo a la variable creada previamente
        existingNode = entries[0];
      }

      //check for duplicate messages - this can happen when the remote node sends an ACK-ed message but does not get the ACK so it resends same message repeatedly until it receives an ACK
      if (existingNode.updated != undefined && ((new Date) - new Date(existingNode.updated).getTime()) < 500 && msgHistory[id] == msgTokens)
      { console.log("   DUPLICATE, skipping..."); return; }
      
      //variable que guarda el "textoenviado"
      msgHistory[id] = msgTokens;

      //console.log('FOUND ENTRY TO UPDATE: ' + JSON.stringify(existingNode));
      //asigna el id encontrado al objeto creado
      existingNode._id = id;
      //asigna la se?al encontrada al nuevo objeto
      existingNode.rssi = rssi; //update signal strength we last heard from this node, regardless of any matches
      //asigna la hora de actualizaci?n al nuevo objeto
      existingNode.updated = new Date().getTime(); //update timestamp we last heard from this node, regardless of any matches
      //asigna el tipo al nodo
      existingNode.type = tipoBien;
      //comprueba si el objeto creado ya tiene alguna metrica, si no, crea un objeto que contenga las metricas
      if (existingNode.metrics == undefined)
        existingNode.metrics = {};
      //comprueba si el objeto creado ya tiene algun evento, si no, crea un objeto que contenga los eventos
      if (existingNode.eventos == undefined)
        existingNode.eventos = {};
        // comprueba si el objeto creado ya tiene la variable 
        if (existingNode.noty == undefined)
            existingNode.noty = [];
      
      //expresi�n que recibe todos los caracteres (b?sicamente se usa para crear los grupos)
      var regexpTokens = /[\w\:\.\$\!\\\'\"\?\[\]\-\(\)@%^&#+\/<>*~=,|]+/ig; //match (almost) any non space human readable character
      //con este loop primero se crea una variable match que contiene los grupos creados al ejecutar la linea anterior
      while (match = regexpTokens.exec(msgTokens)) //extract each token/value pair from the message and process it
      {
        // //V/VBAT/VOLTS is special, applies to whole node so save it as a node level metric instead of in the node metric collection
        if (metricsDef.metrics.V.regexp.test(match[0]))
        {
            var tokenMatch2 = metricsDef.metrics.V.regexp.exec(match[0]);
            existingNode.V = tokenMatch2[1] || tokenMatch2[0]; //extract the voltage part
            continue;
        }
    	  //console.log(match);
    	//crea una variable que va a seer usada mas adelante para guardar la metrica encontrada
        var matchingMetric;
        //try to match a metric definition
        //hace un ciclo entre todas las definiciones del archivo metrics, y genera una variable metrics
        for(var metric in metricsDef.metrics)
        {
        	//prueba si la metrica de metric es v?lida para el texto completo "textoenviado"
          if (metricsDef.metrics[metric].regexp.test(match[0]))
          {
            //found matching metric, add/update the node with it
            //console.log('TOKEN MATCHED: ' + metricsDef.metrics[metric].regexp);
        	//Al encontrar una m?trica que coincida con las de metrics, ejecuta la prueba regexp a el "texto enviado"  
        	//importante aqui: cuando se usa match[0] se coge el texto, no solo los grupos
            var tokenMatch = metricsDef.metrics[metric].regexp.exec(match[0]);
            //guarda la metrica encontrada en una variable
            matchingMetric = metricsDef.metrics[metric];
            //prueba si el objeto creado ya tiene un nombre, si no crea un objeto que lo contenga
            //tener en cuenta que el objeto "existingNode.metrics[matchingmetric.name]" es el que tiene todas las
            //propiedades "label" "descr" Value" etx, por tanto si no existe un objeto que contenga estas propiedades
            //se debe crear uno para deguir adelante
            //de ahi en adelante toma cada propiedad y la agrega al objeto
            if (existingNode.metrics[matchingMetric.name] == null) existingNode.metrics[matchingMetric.name] = {};
            existingNode.metrics[matchingMetric.name].label = existingNode.metrics[matchingMetric.name].label || matchingMetric.name;
            existingNode.metrics[matchingMetric.name].descr = existingNode.metrics[matchingMetric.name].descr || matchingMetric.descr || undefined;
            //esta linea es importante pues determina el valor de un objeto
            //la linea llama el metodo determineValue: ver texto en metrics.js para ver como lo hace
            existingNode.metrics[matchingMetric.name].value = metricsDef.determineValue(matchingMetric, tokenMatch);
            existingNode.metrics[matchingMetric.name].unit = matchingMetric.unit || undefined;
            existingNode.metrics[matchingMetric.name].updated = existingNode.updated;
            existingNode.metrics[matchingMetric.name].pin = existingNode.metrics[matchingMetric.name].pin != undefined ? existingNode.metrics[matchingMetric.name].pin : matchingMetric.pin;
            existingNode.metrics[matchingMetric.name].graph = existingNode.metrics[matchingMetric.name].graph != undefined ? existingNode.metrics[matchingMetric.name].graph : matchingMetric.graph;
            if(antes!=null){
                if(antes.metrics[matchingMetric.name].value!=existingNode.metrics[matchingMetric.name].value){
                    diferencia=existingNode.metrics[matchingMetric.name].value;
                }
            }
              //existingNode.metrics[matchingMetric.name].type = tipoBien;
            //console.log('Comprobando: '+existingNode.metrics[matchingMetric.name].type);
            //-------------PRUEBA CONDICIONAL-------------------------//
              //se debe enviar el nodeId para probar si ese nodeid esta en algun evento de algun nodo como node2
                  db.find({ _id : { $exists: true } }, function (err, entries) {
                      for (var i = 0; i < entries.length; ++i)
                      {
                          var tester=entries[i];
                          if(tester.eventos){
                              if(tester.eventos.condit) {
                                  for (var p = 0; p < tester.eventos.condit.length; p++) {
                                      //noinspection JSReferencingMutableVariableFromClosure
                                      console.log("comparaci�n: " + tester.eventos.condit[p].nodo1 + " con: " + existingNode._id + " y estado: " + tester.eventos.condit[p].state + " con " + existingNode.metrics[matchingMetric.name].value + " DEL NODO " + matchingMetric.value);

                                      //noinspection JSReferencingMutableVariableFromClosure
                                      if (tester.eventos.condit[p].nodo1 == existingNode._id && tester.eventos.condit[p].state == existingNode.metrics[matchingMetric.name].value)
                                      {
                                          var control={nodeId: tester.eventos.condit[p].nodo2, action: tester.eventos.condit[p].action,notyEvent:tester.eventos.condit[p].notyEvent};
                                          setTimeout(function(control){
                                              ejecutarAction(control);
                                          },1000,control);
                                          console.log("se ha disparado un evento condicional entre: " + existingNode._id + " y " + tester.eventos.condit[p].nodo2);
                                      }
                                  }
                              }
                              else{
                                  console.log("el nodo "+entries[i]._id+" tiene eventos pero no tiene condicionales");
                              }
                          }
                          else{
                              console.log("el nodo "+entries[i]._id+" no tiene eventos");
                          }
                      }
                  });
              
            //-------------TERMINA PRUEBA CONDICIONAL-----------------// 
              //log data for graphing purposes, keep labels as short as possible since this log will grow indefinitely and is not compacted like the node database
            if (existingNode.metrics[matchingMetric.name].graph==1)
            {
              var graphValue = metricsDef.isNumeric(matchingMetric.logValue) ? matchingMetric.logValue : metricsDef.determineGraphValue(matchingMetric, tokenMatch); //existingNode.metrics[matchingMetric.name].value;
              if (metricsDef.isNumeric(graphValue))
              {
                var ts = Math.floor(Date.now() / 1000); //get timestamp in whole seconds
                var logfile = path.join(__dirname, dbDir, dbLog.getLogName(id, matchingMetric.name));
                try {
                  console.log('post: ' + logfile + '[' + ts + ','+graphValue + ']');
                  dbLog.postData(logfile, ts, graphValue);
                } catch (err) { console.log('   POST ERROR: ' + err.message); /*console.log('   POST ERROR STACK TRACE: ' + err.stack); */ } //because this is a callback concurrent calls to the same log, milliseconds apart, can cause a file handle concurrency exception
              }
              else console.log('   METRIC NOT NUMERIC, logging skipped... (extracted value:' + graphValue + ')');
            }

            //console.log('TOKEN MATCHED OBJ:' + JSON.stringify(existingNode));
            hasMatchedMetrics = true;
            //break; //--> this stops matching as soon as 1 metric definition regex is matched on the data. You could keep trying to match more definitions and that would create multiple metrics from the same data token, but generally this is not desired behavior.
          }
        }
      }
      //prepare entry to save to DB, undefined values will not be saved, hence saving space

      var entry = {_id:id, idNode:id,position:position+1,updated:existingNode.updated, type:existingNode.type||undefined, label:existingNode.label||undefined, descr:existingNode.descr||undefined, hidden:existingNode.hidden||undefined, V:existingNode.V||undefined, rssi:existingNode.rssi,noty:existingNode.noty, metrics:Object.keys(existingNode.metrics).length > 0 ? existingNode.metrics : {}, eventos: Object.keys(existingNode.eventos).length > 0 ? existingNode.eventos : undefined };
      //console.log('UPDATING ENTRY: ' + JSON.stringify(entry));

      //save to DB
      db.findOne({_id:id}, function (err, doc) {
        if (doc == null)
        {
          //noinspection JSUnresolvedVariable
            if (settings.general.genNodeIfNoMatch.value == true || settings.general.genNodeIfNoMatch.value == 'true' || hasMatchedMetrics)
          {
            db.insert(entry);
            escribirLog("SE AGREGO UN NUEVO NODO CON ID: "+id+" , DE TIPO: "+entry.type);
            console.log('   ['+id+'] DB-Insert new _id:' + id);
          }
          else
          {
            return;
          }
        }
        else
        {

            //Probar los atributos del doc compararlos y al final hacer update
           if(antes!=null&&diferencia!=null&&existingNode.noty.length>0){
                console.log("entro a enviar la noty UPDATE");
                sendNotification(existingNode.noty,{
                    title:entry.type,
                    body:"hay un cambio de estado! "+diferencia
                });

               }
            entry.position=position;
            db.update({ _id: id }, { $set : entry}, {}, function (err, numReplaced) { console.log('   ['+id+'] DB-Updates:' + numReplaced);});

            escribirLog("EL NODO CON ID: "+id+" CAMBIO DE ESTADO, NUEVO ESTADO: "+diferencia);
        }
          //publish updated node to clients
        io.sockets.emit('UPDATENODE', entry);
        //handle any server side events (email, sms, custom actions)
        handleNodeEvents(entry);
      });
    });
  }
  else
  {
    //console.log('no match: ' + data);
    dbunmatched.insert({_id:(new Date().getTime()), data:data});
  }
    
};
