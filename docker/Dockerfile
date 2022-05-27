ARG BASE_VERSION
FROM strapi/base:${BASE_VERSION}

ARG STRAPI_PKG

# Optionally bust cache if you're developing
# ARG CACHEBUST=0
RUN yarn global add ${STRAPI_PKG} && yarn global list
RUN mkdir /srv/app && chown 1000:1000 -R /srv/app

WORKDIR /srv/app
VOLUME /srv/app

COPY docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["strapi", "develop"]
