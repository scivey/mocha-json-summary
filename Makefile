.PHONY: lint test build-client

main: build-client

test: lint
	npm test
	node ./test-integration/run.js

lint:
	grunt jshint

build-client: test
	browserify --no-bundle-external -e ./index.js -s JSONSummaryReporter -o build/reporter.js
