.ONESHELL: # Applies to every targets in the file! .ONESHELL instructs make to invoke a single instance of the shell and provide it with the entire recipe, regardless of how many lines it contains.
.SHELLFLAGS = -ec

########################################################################################################################
# General
########################################################################################################################
.PHONY: test
test: test-backend test-frontend

.PHONY: serve-frontend
serve-frontend:
	cd frontend && yarn dist -- -c sandbox

.PHONY: serve-frontend-prod
serve-frontend-prod:
	cd frontend && yarn dist -- -c prod

.PHONY: serve-backend
serve-backend:
	go run backend/cmd/fasten/fasten.go start --config ./config.dev.yaml --debug


########################################################################################################################
# Backend
########################################################################################################################

.PHONY: clean-backend
clean-backend:
	go clean

.PHONY: dep-backend
dep-backend:
	go mod vendor

.PHONY: test-backend
test-backend: dep-backend
	go vet ./...
	go test -v ./...

.PHONY: test-backend-coverage
test-backend-coverage: dep-backend
	go test -coverprofile=backend-coverage.txt -covermode=atomic -v ./...

########################################################################################################################
# Frontend
########################################################################################################################
.PHONY: dep-frontend
dep-frontend:
	cd frontend
	yarn install --frozen-lockfile

.PHONY: build-frontend-sandbox
build-frontend-sandbox: dep-frontend
	cd frontend
	yarn run build -- --configuration sandbox --output-path=../dist

.PHONY: build-frontend-prod
build-frontend-prod: dep-frontend
	cd frontend
	yarn run build -- --configuration prod --output-path=../dist

.PHONY: test-frontend
# reduce logging, disable angular-cli analytics for ci environment
test-frontend: dep-frontend
	cd frontend && npx ng test --watch=false

.PHONY: test-frontend-coverage
# reduce logging, disable angular-cli analytics for ci environment
test-frontend-coverage: dep-frontend
	cd frontend && npx ng test --watch=false --code-coverage

.PHONY: test-frontend-coverage-ci
# reduce logging, disable angular-cli analytics for ci environment
test-frontend-coverage-ci: dep-frontend
	cd frontend && npx ng test --watch=false --code-coverage --browsers=ChromeHeadlessCI
