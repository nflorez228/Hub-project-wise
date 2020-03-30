/**
 * Created by miner on 12/10/2016.
 */

function queryString() {
    var q = window.location.search.substr(1), qs = {};
    if (q.length) {
        var keys = q.split("&"), k, kv, key, val, v;
        for (k = keys.length; k--; ) {
            kv = keys[k].split("=");
            key = kv[0];
            val = decodeURIComponent(kv[1]);
            if (qs[key] === undefined) {
                qs[key] = val;
            } else {
                v = qs[key];
                if (v.constructor != Array) {
                    qs[key] = [];
                    qs[key].push(v);
                }
                qs[key].push(val);
            }
        }
    }
    return qs;
}

var nombre=queryString().nombre;
console.log("nombre que llega: "+nombre);
//modela la cantidad de intentos que se llevan
var intentos=0;

var intervalo = setInterval(function(){
    if(intentos<5) {
        intentos++;
        function ifServerOnline(ifOnline, ifOffline)
        {
            var img = document.body.appendChild(document.createElement("img"));
            img.id = "test";
            img.onload = function()
            {
                ifOnline && ifOnline.constructor == Function && ifOnline();
            };
            img.onerror = function()
            {
                ifOffline && ifOffline.constructor == Function && ifOffline();
            };
            img.src = "http://"+nombre+".en.bewise.com.co/images/anapo.jpg";
        }

        ifServerOnline(function()
            {
                console.log("SERVIDOR EN LINEA!");//  server online code here
                setTimeout(function(){
                    window.location.replace("http://"+nombre+".en.bewise.com.co");
                },3000);

            },
            function ()
            {
                console.log("SERVIDOR FUERA DE LINEA");
                //  server offline code here
            });
    }
    else{
        console.log("error maximo de repeticiones");
        clearInterval(intervalo);
    }
},5000);

