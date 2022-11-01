#########################################################################################################
# CouchDB Build
# NOTE: the context for this build should be the root of the repository.
#########################################################################################################
FROM couchdb:3.2

ENV FASTEN_COUCHDB_ADMIN_USERNAME=admin
ENV FASTEN_COUCHDB_ADMIN_PASSWORD=mysecretpassword
ENV FASTEN_ISSUER_JWT_KEY=mysessionpassword

ARG S6_ARCH=amd64
RUN curl https://github.com/just-containers/s6-overlay/releases/download/v1.21.8.0/s6-overlay-${S6_ARCH}.tar.gz -L -s --output /tmp/s6-overlay-${S6_ARCH}.tar.gz \
    && tar xzf /tmp/s6-overlay-${S6_ARCH}.tar.gz -C / \
    && rm -rf /tmp/s6-overlay-${S6_ARCH}.tar.gz

COPY /docker/couchdb/fasten.ini /opt/couchdb/etc/local.ini
COPY /docker/rootfs /
RUN rm -rf /etc/services.d/fasten #delete the fasten app from the couchdbase container.

ENTRYPOINT ["/init"]
