.ONESHELL: # Applies to every targets in the file! .ONESHELL instructs make to invoke a single instance of the shell and provide it with the entire recipe, regardless of how many lines it contains.
.SHELLFLAGS = -ec

########################################################################################################################
# General
########################################################################################################################
.PHONY: test
test: test-backend test-frontend

.PHONY: build-storybook
build-storybook: dep-frontend
	cd frontend && npx ng run fastenhealth:build-storybook

.PHONY: serve-storybook
serve-storybook: dep-frontend
	cd frontend && npx ng run fastenhealth:storybook

.PHONY: serve-frontend
serve-frontend: dep-frontend
	cd frontend && ng serve --hmr --live-reload -c dev

.PHONY: serve-frontend-prod
serve-frontend-prod: dep-frontend
	cd frontend && yarn dist -- -c prod

.PHONY: serve-backend
serve-backend: dep-backend
	go run backend/cmd/fasten/fasten.go start --config ./config.dev.yaml --debug

.PHONY: migrate
migrate: dep-backend
	go run backend/cmd/fasten/fasten.go migrate --config ./config.dev.yaml --debug

.PHONY: serve-docker-prod
serve-docker-prod:
	docker compose -f docker-compose-prod.yml up -d

.PHONY: serve-docker
serve-docker:
	docker compose up -d


########################################################################################################################
# Backend
########################################################################################################################

.PHONY: clean-backend
clean-backend:
	go clean

.PHONY: dep-backend
dep-backend:
	go mod tidy && go mod vendor
	cd scripts && go generate ./...


.PHONY: test-backend
test-backend: dep-backend
	go vet ./...
	go test -v ./...

.PHONY: test-backend-coverage
test-backend-coverage: dep-backend
	go test -coverprofile=backend-coverage.txt -covermode=atomic -v ./...

.PHONY: generate-backend
generate-backend:
	go generate ./...
	tygo generate

########################################################################################################################
# Frontend
########################################################################################################################
.PHONY: dep-frontend
dep-frontend:
	cd frontend && yarn install --frozen-lockfile --network-timeout 1000000

.PHONY: build-frontend-sandbox
build-frontend-sandbox: dep-frontend
	cd frontend && yarn build -- -c sandbox

.PHONY: build-frontend-prod
build-frontend-prod: dep-frontend
	cd frontend && yarn build -- -c prod

.PHONY: build-frontend-desktop-sandbox
build-frontend-desktop-sandbox: dep-frontend
	cd frontend && yarn build -- -c desktop_sandbox

.PHONY: build-frontend-desktop-prod
build-frontend-desktop-prod: dep-frontend
	cd frontend && yarn build -- -c desktop_prod

.PHONY: build-frontend-offline-sandbox
build-frontend-offline-sandbox: dep-frontend
	cd frontend && yarn build -- -c offline_sandbox

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
