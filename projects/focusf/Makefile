export t=.
export args
export port=3000

lint:
	cd ../../ && npx eslint --fix $(args) projects/hqf/src/$(t)

test:
	ng test

check: lint test

run:
	cd ../../ && ng s --port $(port)
