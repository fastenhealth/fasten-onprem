FROM node:18.9.0 as frontend-build
WORKDIR /usr/src/fastenhealth/frontend
#COPY frontend/package.json frontend/yarn.lock ./
COPY frontend/package.json ./
RUN yarn install --frozen-lockfile
COPY frontend/ ./
RUN yarn run build -- --output-path=../dist

FROM golang:1.18 as backend-build
WORKDIR /go/src/github.com/fastenhealth/fastenhealth-onprem
COPY . .

RUN go mod vendor \
    && go install github.com/golang/mock/mockgen@v1.6.0 \
    && go generate ./... \
    && go vet ./... \
    && go test ./...

RUN CGO_ENABLED=0 go build -o /go/bin/fasten ./backend/cmd/fasten/

FROM gcr.io/distroless/static-debian11

COPY --from=frontend-build /usr/src/fastenhealth/dist /opt/fasten/dist
COPY --from=backend-build /go/bin/fasten /opt/fasten/fasten
COPY LICENSE.md /opt/fasten/LICENSE.md
COPY config.yaml /opt/fasten/config.yaml
CMD ["/opt/fasten/fasten"]
