.PHONY: lint test build-client copy-test

main: test build-client

test: lint
	npm test
	node ./test-integration/run.js

lint:
	grunt jshint

copy-test: build-client
	cp ./build/reporter.js ../mocha_fixtures/simple/js/test

build-client:
	browserify --no-bundle-external -e ./index.js -s AReporter -o build/reporter.js
