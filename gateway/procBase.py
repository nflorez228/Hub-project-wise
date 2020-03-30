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
import os


def agregar(id):
    nombre=sys.argv[1]
    file = open("/home/pi/gateway/ids","a")
    file.write(id)
    file.write("\n")
    print ("message")

def eliminar(id):
    f = open("/home/pi/gateway/ids","r+")
    #agrega el enter al final pues se va a comparar con las lineas que contienen enter al final
    linea=(id+"\n")
    #guarda en una lista todaslas lineas del archivo (aprovechando que son maximo 255)
    d = f.readlines()
    #pone el cursor en la posicion 0
    f.seek(0)
    encontrado = False
    for i in d:
        if i != linea:
            f.write(i)
            encontrado=True
   #elimina todo lo que queda despues de lo ultimo que escribio
    f.truncate()
    f.close()
    if encontrado:
        print ("Eliminado")
    else: 
        print ("id no encontrado")

def ultimo():
    f = open("/home/pi/gateway/ids","r")
    #guarda en una lista todaslas lineas del archivo (aprovechando que son maximo 255)
    d = f.readlines()
    #pone el cursor en la posicion 0
    f.seek(0)
    ultimo=2
    cuenta=2
    for i in d:
         if d.endswith('\n'):
            if d[:-2]==cuenta:
                ultimo = d[:-2]
            cuenta=cuenta+1
            
    f.close()
    print ('message') 
    print ultimo

    