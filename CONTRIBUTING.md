
```
cd frontend 
npm run dist
go mod vendor
go run backend/cmd/fasten/fasten.go start --config ./config.example.yaml --debug
```
