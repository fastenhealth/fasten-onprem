#########################################################################################################
# Frontend Build
#########################################################################################################
# Note, when running on Github, we cannot use standard Github Action runners, as ARM support is only via QEMU emulation
# (until https://github.com/actions/runner-images/issues/2187)
# QEMU emulation has a bunch of performance issues, as described in the links below.
# https://blog.thesparktree.com/docker-multi-arch-github-actions#q-i-enabled-multi-arch-builds-and-my-builds-take-1h-what-gives
# https://github.com/fastenhealth/fasten-onprem/issues/43
#
# instead, we use https://depot.dev/ to do our multi-arch builds on native ARM and AMD nodes.

FROM node:18 as frontend-build
ARG FASTEN_ENV=sandbox
WORKDIR /usr/src/fastenhealth/frontend
COPY frontend/package.json frontend/yarn.lock ./

RUN yarn install --frozen-lockfile
COPY frontend/ ./
RUN yarn run build -- --configuration ${FASTEN_ENV} --output-path=../dist

#########################################################################################################
# Backend Build
#########################################################################################################
FROM golang:1.18 as backend-build

WORKDIR /go/src/github.com/fastenhealth/fastenhealth-onprem
COPY . .

RUN go mod vendor \
    && go install github.com/golang/mock/mockgen@v1.6.0 \
    && go generate ./... \
    && go vet ./... \
    && go test ./...
RUN CGO_ENABLED=0 go build -o /go/bin/fasten ./backend/cmd/fasten/

# create folder structure
RUN mkdir -p /opt/fasten/db \
  && mkdir -p /opt/fasten/web \
  && mkdir -p /opt/fasten/config

#########################################################################################################
# Distribution Build
#########################################################################################################
FROM gcr.io/distroless/static-debian11


WORKDIR /opt/fasten/
COPY --from=backend-build  /opt/fasten/ /opt/fasten/
COPY --from=frontend-build /usr/src/fastenhealth/dist /opt/fasten/web
COPY --from=backend-build /go/bin/fasten /opt/fasten/fasten
COPY LICENSE.md /opt/fasten/LICENSE.md
COPY config.yaml /opt/fasten/config/config.yaml

CMD ["/opt/fasten/fasten", "start", "--config", "/opt/fasten/config/config.yaml"]





