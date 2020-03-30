#!/bin/python

import sys

id=sys.argv[1]

f = open("/home/pi/gateway/pythonFolder/ids","r+")
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