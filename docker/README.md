# Dockerfiles

Note, the context for Dockerfiles in this directory is **always** the repository root.

```bash
docker build -f docker/couchdb/Dockerfile -t couchdb-fasten .

docker run --rm -it -p 5984:5984 -v `pwd`/.couchdb/data:/opt/couchdb/data  -v `pwd`/.couchdb/config:/opt/couchdb/etc/local.d couchdb-fasten
```
