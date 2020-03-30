import sys

rid=sys.argv[1]
title=sys.argv[2]
body=sys.argv[3]

# Send to single device.
from pyfcm import FCMNotification

push_service = FCMNotification(api_key="AIzaSyA3hfQjZ3xn2a_4KKA3rKaPCaP_71B7CCQ")

# Your api-key can be gotten from:  https://console.firebase.google.com/project/<project-name>/settings/cloudmessaging


registration_id = rid.split()
message_title = title
message_body = body
result = push_service.notify_multiple_devices(registration_ids=registration_id, message_body=message_body,sound="Default")


print result
