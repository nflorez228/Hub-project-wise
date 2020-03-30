#!/bin/python

#Este script es llamado desde el init.d por el script tunel
#ese script se registra y asi se logra iniciar con cada boot
#al registrsrse se inicia en los 6 niveles
#este script al ser iniciado por el init.d inicia con permisos root
#en caso de error crea el archivo de log
#al final llama al bash para crear el tunel con la direccion que
#se obtuvo al inicio

import ipgetter
import subprocess
import os.path
import requests
import os


print "inicia chequeo de configuracion previa"
if os.path.isfile("/home/pi/tunel/cfgtunel.yml"):
    print "existe"
    os.system("pm2 start /home/pi/tunel/ngrok --max-memory-restart 250M -- -log=stdout -config=/home/pi/tunel/cfgtunel.yml start web ssh")
    #subprocess.Popen(['pm2','start', '/home/pi/tunel/ngrok','--max-memory-restart','250M','--', '-log=stdout', '-config=/home/pi/tunel/cfgtunel.yml', 'start','web','ssh'],
    #             stdout=open('/dev/null', 'w'))
    print "ngrok andando"
	
else:
    print "no existe"
    r = requests.get('http://ipecho.net/plain')   
    ip = r.text 
    if ip:
        print ip 
        file = open("/home/pi/tunel/config.yml","w")
        file.write("server_addr: en.bewise.com.co:4443\n")
        file.write("trust_host_root_certs: false\n")
        file.write("tunnels:\n")
        file.write("    web:\n")
        file.write("      subdomain: ")
        file.write(ip)
        file.write("\n")
        file.write("      proto:\n")
        file.write("         http: 80\n")
        file.write("\n")
        file.write("    ssh:\n")
        file.write("      subdomain: ssh")
        file.write(ip)
        file.write("\n")
        file.write("      remote_port: 60000\n")
        file.write("      proto:\n")
        file.write("         tcp: 22\n")
        file.close()
        subprocess.Popen(['nohup', './home/pi/tunel/ngrok', '-config=/home/pi/tunel/config.yml', 'start', 'web', 'ssh'],
                         stdout=open('/dev/null', 'w'))
   
    else:
        print "metodo 2"
        myip = ipgetter.myip()
        file = open("/home/pi/tunel/config.yml","w")
        file.write("server_addr: en.bewise.com.co:4443\n")
        file.write("trust_host_root_certs: false\n")
        file.write("tunnels:\n")
        file.write("    web:\n")
        file.write("      subdomain: ")
        file.write(myip)
        file.write("\n")
        file.write("      proto:\n")
        file.write("         http: 80\n")
        file.write("\n")
        file.write("    ssh:\n")
        file.write("      subdomain: ssh")
        file.write(myip)
        file.write("\n")
        file.write("      remote_port: 60000\n")
        file.write("      proto:\n")
        file.write("         tcp: 22\n")
        file.close()
        subprocess.Popen(['nohup', './home/pi/tunel/ngrok', '-config=/home/pi/tunel/config.yml', 'start', 'web', 'ssh'],
                 stdout=open('/dev/null', 'w'))

subprocess.Popen(['config-pin','P9.24','uart'])
subprocess.Popen(['config-pin','P9.26','uart'])

subprocess.Popen(["echo", 'none', '>', '/sys/class/leds/beaglebone\:green\:usr0/trigger'])
subprocess.Popen(["echo", 'none', '>', '/sys/class/leds/beaglebone\:green\:usr1/trigger'])
subprocess.Popen(["echo", 'none', '>', '/sys/class/leds/beaglebone\:green\:usr2/trigger'])
subprocess.Popen(["echo", 'none', '>', '/sys/class/leds/beaglebone\:green\:usr3/trigger'])

