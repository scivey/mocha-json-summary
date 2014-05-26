main:
	jshint ./lib
	jshint ./test
	npm test
	jshint ./test-integration
	jshint ./test-integration/sample_tests
	node ./test-integration/run.js
