#!/bin/bash

    # "Path": "/usr/bin/dumb-init",
    # "Args": [
    #     "--",
    #     "supervisord",
    #     "-c",
    #     "/etc/supervisor/supervisord.conf"
    # ],

#  setup email add $EMAIL_HOST_USER $EMAIL_HOST_PASSWORD

# /usr/bin/dumb-init -- /usr/bin/supervisord -c /etc/supervisor/supervisord.conf &

# smtp_pid=$!

# echo "setup email add $EMAIL_HOST_USER $EMAIL_HOST_PASSWORD"

# sleep 10

# kill $smtp_pid
# wait $smtp_pid

# echo "email setup complete"

# exec /usr/local/bin/start-mailserver.sh

# echo "setup email add $EMAIL_HOST_USER $EMAIL_HOST_PASSWORD"

mail_setup() {
    /usr/local/bin/setup email add $EMAIL_HOST_USER $EMAIL_HOST_PASSWORD > /dev/null 2>&1
    # echo "setup email add $EMAIL_HOST_USER $EMAIL_HOST_PASSWORD"
}

mail_setup

exec /usr/bin/dumb-init -- /usr/bin/supervisord -c /etc/supervisor/supervisord.conf