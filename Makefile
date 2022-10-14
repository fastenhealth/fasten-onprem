.ONESHELL: # Applies to every targets in the file! .ONESHELL instructs make to invoke a single instance of the shell and provide it with the entire recipe, regardless of how many lines it contains.
.SHELLFLAGS = -ec

########################################################################################################################
# General
########################################################################################################################
.PHONY: test
test: backend-test frontend-test


########################################################################################################################
# Backend
########################################################################################################################

.PHONY: backend-clean
backend-clean:
	go clean

.PHONY: backend-dep
backend-dep:
	go mod vendor

.PHONY: backend-test
backend-test: backend-dep
	go vet ./...
	go test -v ./...

.PHONY: backend-test-coverage
backend-test-coverage: backend-dep
	go test -coverprofile=backend-coverage.txt -covermode=atomic -v ./...

########################################################################################################################
# Frontend
########################################################################################################################
.PHONY: frontend-dep
frontend-dep:
	cd frontend
	yarn install --frozen-lockfile

.PHONY: frontend-test
# reduce logging, disable angular-cli analytics for ci environment
frontend-test: frontend-dep
	cd frontend && ng test --watch=false

.PHONY: frontend-test-coverage
# reduce logging, disable angular-cli analytics for ci environment
frontend-test-coverage: frontend-dep
	cd frontend && ng test --watch=false --code-coverage
