import sys

rid=sys.argv[1]
title=sys.argv[2]
body=sys.argv[3]
# Send to single device.
from pyfcm import FCMNotification

push_service = FCMNotification(api_key="AIzaSyA3hfQjZ3xn2a_4KKA3rKaPCaP_71B7CCQ")

# Your api-key can be gotten from:  https://console.firebase.google.com/project/<project-name>/settings/cloudmessaging

registration_id = rid
message_title = title
message_body = body
result = push_service.notify_single_device(registration_id=registration_id, message_title=message_title, message_body=message_body,sound="Default")

#print result
print ('entro al python fcm')