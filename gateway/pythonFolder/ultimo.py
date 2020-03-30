#!#!/bin/python

f = open("/home/pi/gateway/pythonFolder/ids","r")
#guarda en una lista todaslas lineas del archivo (aprovechando que son maximo 255)
d = f.readlines()
#pone el cursor en la posicion 0
f.seek(0)
e=sorted(d, key=int) 
ultimo=2
cuenta=2
for i in e:
     if int(i)==cuenta:
        ultimo = cuenta+1
     else:
        falta=cuenta
     cuenta=cuenta+1       
f.close()
print ultimo