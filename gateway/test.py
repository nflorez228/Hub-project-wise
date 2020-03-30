#!/bin/python

#Este script es llamado desde el socket.io (gateway.js) 
#recibe comandos por stdin y se comunica con el gateway mediante stdout
#Funcion: cambiar el nombre del tunel de la ip al nombre que el cliente desea
#Ingresa: por stdin el nombre que desea el cliente
#Sale: confirmacion de la creacion o que ya existe un tunel
#Envia errores de depuracion
#Orden: inicia preguntando si existe el tunel con wget, si la respuesta no inicia por Tunnel
#    entonces no existe el tunel y se puede continuar, si no, devuelve un error

import sys
import requests
import os


nombre=sys.argv[1]
print (nombre)
pagina='http://'+nombre+'.en.bewise.com.co'
e=requests.get(pagina)
text=e.text
if not(text.startswith('Tunnel')):
    print ('existe')
else:
    print ('creado')