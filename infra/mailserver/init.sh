#!/bin/bash

mail_setup() {
    /usr/local/bin/setup email add $EMAIL_HOST_USER $EMAIL_HOST_PASSWORD > /dev/null 2>&1
}

mail_setup

exec /usr/bin/dumb-init -- /usr/bin/supervisord -c /etc/supervisor/supervisord.conf