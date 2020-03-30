#!/bin/python

#Este script es llamado desde el socket.io (gateway.js)
#Funcion: borrar todos los datos y dejar el dispositivo de fabrica
#Ingresa: por stdin el nombre que desea el cliente
#Sale: confirmacion de la creacion o que ya existe un tunel
#Envia errores de depuracion
#Orden: inicia preguntando si existe el tunel con wget, si la respuesta no inicia por Tunnel
#    entonces no existe el tunel y se puede continuar, si no, devuelve un error

import os
import subprocess


os.system('sudo rm /home/pi/gateway/data/db/gateway.db')
print "Base Borrada"
os.system('sudo rm /home/pi/gateway/data/db/gateway_log.db')
print "registros Borrados"
os.system('sudo rm /home/pi/gateway/data/db/gateway_nonmatches.db')
print "comunicados Borrados"
os.system('sudo rm /home/pi/gateway/data/db/gateway_noty.db')
print "notificaciones Borradas"
os.system('sudo rm /home/pi/tunel/cfgtunel.yml')
print "configuracion del tunel borrada"
os.system('sudo rm /home/pi/tunel/config.yml')
print "configuracion de ip Borrada"
os.system('sudo pm2 delete ngrok')
print "servicio de tunel borrado"
os.system('sudo shutdown -r now')
subprocess.Popen(['shutdown','-r','now'])
print "reiniciando"



