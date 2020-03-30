# -*- coding: utf-8 -*-
#este script se encarga de cambiar la contrasea de login

import subprocess
import sys
import os

login=sys.argv[1]
pwd=sys.argv[2]

#crea una concatenacion del comando de creacion de contrasena
#el comando recibe un user y pass y usa codificacion salt
texto='sudo echo -e "'+login+":`perl -le 'print crypt("+'"'+pwd+'"'+","+'"SALT")'+"'"+'`"'
p = subprocess.Popen(texto, shell=True ,stdout=subprocess.PIPE, stderr=subprocess.PIPE)
out, error = p.communicate()

path ="/home/pi/gateway/.htpasswd"

# abre el archivo y escribe el nuevo usuario y contrasena
file = open(path, 'w')
file.write(out)
file.close()

#esta seccion se encarga de cambiar los persmisos y mandarlo a su ubicacion final

uid = os.environ.get('SUDO_UID')
gid = os.environ.get('SUDO_GID')
if uid is not None:
     #os.chown(path, int(uid), int(gid))
     cmd1 = 'sudo chown '+path+' '+'pi'+' '+'pi'
     r = subprocess.Popen(cmd1, shell=True ,stdout=subprocess.PIPE, stderr=subprocess.PIPE)
     fin, er = r.communicate()
     print er

cmd2 = 'sudo mv -f '+path+' /home/pi/gateway/data/secure/.htpasswd'
q = subprocess.Popen(cmd2, shell=True ,stdout=subprocess.PIPE, stderr=subprocess.PIPE)    
resultado, err = q.communicate()
print err
