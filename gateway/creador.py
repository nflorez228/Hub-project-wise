#!/bin/python

#Este script es llamado desde el socket.io (gateway.js) 
#recibe comandos por stdin y se comunica con el gateway mediante stdout
#Funcion: cambiar el nombre del tunel de la ip al nombre que el cliente desea
#Ingresa: por stdin el nombre que desea el cliente
#Sale: confirmacion de la creacion o que ya existe un tunel
#Envia errores de depuracion
#Orden: inicia preguntando si existe el tunel con wget, si la respuesta no inicia por Tunnel
#    entonces no existe el tunel y se puede continuar, si no, devuelve un error

import os
import signal
import subprocess
import sys

nombre=sys.argv[1]
nuevo=sys.argv[2]
file = open("/home/pi/tunel/cfgtunel.yml","w")
file.write("server_addr: en.bewise.com.co:4443\n")
file.write("trust_host_root_certs: false\n")
file.write("tunnels:\n")
file.write("    web:\n")
file.write("      subdomain: ")
file.write(nombre)
file.write("\n")
file.write("      proto:\n")
file.write("         http: 80\n")
file.write("\n")
file.write("    webs:\n")
file.write("      subdomain: ")
file.write(nombre)
file.write("\n")
file.write("      proto:\n")
file.write("         https: 443\n")
file.write("\n")
file.write("    ssh:\n")
file.write("      subdomain: ssh")
file.write(nombre)
file.write("\n")
file.write("      remote_port: 60000\n")
file.write("      proto:\n")
file.write("         tcp: 22\n")
file.close()
if nuevo>0:
    p = subprocess.Popen(['pgrep', '-l' , 'ngrok'], stdout=subprocess.PIPE)
    out, err = p.communicate()

    for line in out.splitlines():
        line = bytes.decode(line)
        pid = int(line.split(None, 1)[0])
        os.kill(pid, signal.SIGKILL)
    os.system('sudo pm2 start /home/pi/tunel/ngrok --max-memory-restart 250M -- -log=stdout -config=/home/pi/tunel/cfgtunel.yml start web ssh')
    os.system('pm2 save')
    print ('creado nuevo')
else:
    os.system("sudo pm2 restart ngrok")
    print ('re-creado')

