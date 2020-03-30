#!/bin/python

import sys

id=sys.argv[1]
file = open("/home/pi/gateway/pythonFolder/ids","a")
file.write(id)
file.write("\n")
print ("agregado en la base de datos python con id: "+id)