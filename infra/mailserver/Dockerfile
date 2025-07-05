FROM ghcr.io/docker-mailserver/docker-mailserver:latest

# COPY dkim.private.key /etc/exim4/dkim.private.key
COPY dkim.private.key /tmp/docker-mailserver/opendkim/dkim.key

ENV ENABLE_FAIL2BAN=1 \
ENABLE_SPAMASSASSIN=0 \
ENABLE_CLAMAV=0 \
ENABLE_RSPAMD=0 \
ENABLE_POP3=0 \
ENABLE_MANAGESIEVE=0 \
ENABLE_LDA=0 \
ENABLE_LDAP=0 \
ENABLE_LDAPS=0 \
ENABLE_SASLAUTHD=0 \
ENABLE_DOVECOT=0 \
ENABLE_POSTFIX=0 \
ENABLE_DKIM=1 \
DKIM_KEY_PATH=/tmp/docker-mailserver/opendkim/dkim.private.key \
DKIM_SELECTOR=blackholejs \
SSL_TYPE=manual \
SSL_CERT_PATH=/certs/fullchain.pem \
SSL_KEY_PATH=/certs/privkey.pem \
PERMIT_DOCKER=network \
SPOOF_PROTECTION=0 \
ENABLE_POSTFIX_VIRTUAL_TRANSPORT=0 \
POSTFIX_DAGENT=smtp:auth:465 \
REPORT_RECIPIENT=1 \
MAILNAME=blackholejs.art

COPY init.sh /init.sh
RUN chmod +x /init.sh

ENTRYPOINT ["/init.sh"]