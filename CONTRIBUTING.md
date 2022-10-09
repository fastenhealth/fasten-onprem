
```
cd frontend 
npm run dist
go mod vendor
go run backend/cmd/fasten/fasten.go start --config ./config.example.yaml --debug

docker build -t fasten-couchdb -f docker/couchdb/Dockerfile .
docker run --rm -it -p 5984:5984 -v './.couchdb/data:/opt/couchdb/data' fasten-couchdb
```

# Docker 
``

- http://localhost:9090/web/dashboard - WebUI
- http://localhost:9090/database - CouchDB proxy
- http://localhost:5984/_utils/ - CouchDB admin UI

# Credentials
- Couchdb:
  - username: `admin`
  - password: `mysecretpassword`
- WebUI: 
  - username: `testuser`
  - password: `testuser`
