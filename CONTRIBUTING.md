> This doc is a WIP and will be expanded shortly.
> 
> In the meantime, please consider looking at the extensive docs in the [Fasten Docs Repository](https://github.com/fastenhealth/docs/tree/main/technical)

# Tech Stack

Fasten is made up of a handful of different components. Here's a summary of the technologies & languages used in Fasten:

**Frontend**
- NodeJS `v18.9.0`
- Yarn `1.22.19`
- Angular `v14.1.3`

**Backend**
- Go `v1.18.3`

**Misc**
- Docker `v20.10.17`

## Setup

If you're on a Mac, you can run the following commands to install the necessary software to get setup:

```bash
brew install node
npm install -g @angular/cli@14.1.3
npm install -g yarn

brew install go

brew install docker
```

# Running Tests

Before making changes to Fasten, you'll want to run the test suites to ensure that your environment is setup correctly:

```bash
make test

# if you only want to run the frontend tests (Angular), you can run:
make test-frontend

# alternatively, if you only care about backend (Go) tests, you can run:
make test-backend
```

# Start Development Environment

To run Fasten from source, you'll need to create 2 separate processes:

- Angular Frontend
- Go Backend

First we'll create a development config file (`config.dev.yaml`)

```yaml
version: 1
web:
  listen:
    port: 9090
    host: 0.0.0.0
    basepath: ''
  src:
    frontend:
      path: ./dist
database:
  location: 'fasten.db'
cache:
  location: ''
log:
  file: '' #absolute or relative paths allowed, eg. web.log
  level: INFO
```

Next we'll start the processes described above:

```bash

# In terminal #1, run the following
cd frontend 
yarn install
yarn dist -- -c [sandbox|prod]
# eg. yarn dist -- -c prod

# In terminal #2, run the following
go mod vendor
go run backend/cmd/fasten/fasten.go start --config ./config.dev.yaml --debug

```

_Note_: Fasten can run in 2 modes: sandbox or production (prod). In sandbox mode, it can only communicate with test servers (full of synthetic health data).

Now you can open a browser to `http://localhost:9090` to see the Fasten UI. 

## Important URL's 

The following URL's and credentials may be helpful as you're developing

- http://localhost:9090/web/dashboard - WebUI

### Credentials
- WebUI: 
  - username: `testuser`
  - password: `testuser`

# Source Code Folder Structure

The Fasten source code is organized into a handful of important folders, which we'll describe below:

## Frontend

```
├── frontend
│   ├── src
│   │   ├── app
│   │   │   ├── app-routing.module.ts
│   │   │   ├── app.component.html
│   │   │   ├── app.component.scss
│   │   │   ├── app.component.spec.ts
│   │   │   ├── app.component.ts
│   │   │   ├── app.module.ts
│   │   │   ├── components                        # contains shared/partial components reused on multiple pages.
│   │   │   │   ├── components-sidebar
│   │   │   │   ├── footer
│   │   │   │   ├── header
│   │   │   │   ├── list-fallback-resource
│   │   │   │   ├── list-generic-resource         # A component containing a table view for every FHIR resource
│   │   │   │   ├── list-patient
│   │   │   │   ├── resource-list                 # Thin shim which populates template depending on FHIR resource type
│   │   │   │   ├── toast                         # Toast/notification component
│   │   │   │   └── utilities-sidebar
│   │   │   ├── models                            # contains classes for communicating with API's and transfering data between pages. 
│   │   │   ├── pages
│   │   │   │   ├── auth-signin                   # Login/Signin page
│   │   │   │   ├── auth-signup                   # Signup page
│   │   │   │   ├── dashboard                     # Dashboard, visible after logging in
│   │   │   │   ├── medical-sources               # Medical Provider connection page
│   │   │   │   ├── patient
│   │   │   │   ├── resource-detail               # Page displaying detailed information about FHIR resource
│   │   │   │   └── source-detail                 # 2 column page displaying FHIR counts, and table listing FHIR resources for selected type
│   │   │   ├── services
│   │   │   │   ├── auth-interceptor.service.ts   # service that looks for 401/403 API responses and triggers Logout
│   │   │   │   ├── is-authenticated-auth-guard.ts    # service that checks if user is logged in
│   │   │   │   ├── fasten-api.service.ts         # api service, used to commnunicate with Go backend (WILL BE REMOVED)
│   │   │   │   ├── fasten-db.service.ts          # db service, used to communicate with CouchDB database
│   │   │   │   ├── lighthouse.service.ts         # api service, used to communicate with auth-gateway (Lighthouse)
│   │   │   │   └── toast.service.ts              # notifications service, used to send notifications
│   │   │   └── workers
│   │   │       ├── queue.service.spec.ts
│   │   │       ├── queue.service.ts              # queue service, used to coordinate background work
│   │   │       └── source-sync.worker.ts         # background job (web-worker) that syncs all FHIR resources from healthcare provider
│   │   ├── lib                                   # root directory for libraries
│   │   │   ├── README.md
│   │   │   ├── conduit                           # Conduit Library - HealthCare provider communication layer (FHIR protocol)
│   │   │   │   ├── fhir                          # contains healthcare provider specific FHIR clients
│   │   │   ├── database                          # Database Library - PouchDB/CouchDB client, compatible with web-worker and browser env
│   │   │   │   ├── plugins
│   │   │   │   └── pouchdb_repository.ts          
│   │   │   ├── models
│   │   │   │   ├── database                      # Classes used to store data in CouchDB
│   │   │   │   ├── fasten                        
│   │   │   │   └── lighthouse                    # Classes used to communicate with Lighthouse API
│   │   │   └── utils
│   │   ├── styles.scss                           # Main sylesheet
```

## Backend

The backend is incredibly simple (by design). The hope is to remove it completely if possible, allowing Fasten to be served by 
a CDN or minimal Nginx deployment. 

```tree
├── backend
│   ├── cmd
│   └── pkg
│       ├── config
│       ├── database                  # contains CouchDB client, allowing creation of new Users (and associated databases)
│       ├── errors
│       ├── models
│       └── web
│           ├── handler               # contains code for API endpoints
│           │   ├── auth.go           # authentication endpoints (create new user)
│           │   ├── cors_proxy.go     # CORS proxy/relay for communicating with healthcare providers who do not support CORS
│           │   ├── couchdb_proxy.go  # reverse proxy for CouchDB api, allowing for database API to be exposed (with limitations)
│           │   └── metadata.go       # API endpoint returning metadata for healthcare providers
```

## Distribution/Docker

```tree
├── docker-compose.yml                  # docker-compose file which can be used to compile and run "all-in-one" image
├── Dockerfile                          # dockerfile for "all-in-one" image, containing frontend, backend & database
├── docker
│   ├── README.md 
│   ├── couchdb                               
│   │   ├── Dockerfile                  # dockerfile for "couchdb" only image, used for development
│   │   └── local.ini
│   └── rootfs                          # filesystem configs, used in Dockerfiles to setup s6-overlay service manager
│       └── etc
│           ├── cont-init.d
│           │   ├── 01-timezone
│           │   └── 50-couchdb-init
│           └── services.d
│               ├── couchdb
│               └── fasten

```

# FAQ

### How do I run individual frontend tests?

- ng test --include='**/base_client.spec.ts'    
- ng test --include='lib/**/*.spec.ts'     


### How do I change the default encryption key and admin credentials
- FASTEN_ISSUER_JWT_KEY


### Generate JWT for local use
```bash
curl -X POST http://localhost:9090/api/auth/signup -H 'Content-Type: application/json' -d '{"username":"user1","password":"user1"}'

curl -X POST http://localhost:9090/api/auth/signin -H 'Content-Type: application/json' -d '{"username":"user1","password":"user1"}'


curl -H "Authorization: Bearer ${JWT_TOKEN_HERE}" http://localhost:5984/_session

```


# Run Component Storybook
```bash
ng run fastenhealth:storybook
```


# Access Encrypted SQLite Database with IntelliJ

- Download the latest `sqlite-jdbc-crypt` jar from https://github.com/Willena/sqlite-jdbc-crypt/releases
- Open IntelliJ -> Data Source Properties -> Driver Tab
- Find & Select `Sqlite` -> Right Click -> Duplicate
- Rename to `Sqlite (Encrypted)`
- Find `Driver Files` -> Select `sqlite-jdbc-crypt` jar that you downloaded previously
- Remove `Xerial Sqlite JDBC` jar
- Click `Apply` -> Click `OK`
- Create New Data Source -> Select `Sqlite (Encrypted)` -> Change Connection Type to `Url only`
- Specify the following connection url: `jdbc:sqlite:fasten.db?cipher=sqlcipher&legacy=3&hmac_use=0&kdf_iter=4000&legacy_page_size=1024&key=123456789012345678901234567890`
- Replace `key` with the encryption key specified in your config file (`database.encryption_key`)
- Click `Test Connection` -> Should be successful
- Click `Apply` -> Click `OK`

# Flush SQLite Write-Ahead-Log (WAL) to Database

```sqlite
PRAGMA wal_checkpoint(TRUNCATE);
```

See: https://sqlite.org/forum/info/fefd56014e2135589ea57825b0e2aa3e2df5daf53b5e41aa6a9d8f0c29d0b8e5
TODO: check if https://www.sqlite.org/pragma.html#pragma_wal_checkpoint can be used to do this automatically. 
