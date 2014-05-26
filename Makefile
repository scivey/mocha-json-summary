

main:
	jshint ./lib
	jshint ./test
	npm test
	node ./test-integration/run.js
