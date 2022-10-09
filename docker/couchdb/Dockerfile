#########################################################################################################
# CouchDB Build
# NOTE: the context for this build should be the root of the repository.
#########################################################################################################
FROM couchdb:3.2

ARG S6_ARCH=amd64
RUN curl https://github.com/just-containers/s6-overlay/releases/download/v1.21.8.0/s6-overlay-${S6_ARCH}.tar.gz -L -s --output /tmp/s6-overlay-${S6_ARCH}.tar.gz \
    && tar xzf /tmp/s6-overlay-${S6_ARCH}.tar.gz -C / \
    && rm -rf /tmp/s6-overlay-${S6_ARCH}.tar.gz

COPY /docker/couchdb/local.ini /opt/couchdb/etc/
COPY /docker/rootfs /
RUN rm -rf /etc/services/fasten #delete the fasten app from the couchdbase container.

ENTRYPOINT ["/init"]
