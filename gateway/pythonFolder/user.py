#compara el usuario en el archivo guardado

#!/bin/python

import sys

userId=sys.argv[1]
userPas=sys.argv[2]
bien=False
file = open("/home/pi/gateway/pythonFolder/user","r")

user = file.readline().rstrip('\n')
pas = file.readline().rstrip('\n')
if user==userId:
   if pas==userPas:
       bien=True
print bien
