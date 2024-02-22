export t=.
export a
export port=3000

lint:
	cd ../../ && npx eslint --fix $(a) projects/hqf/src/$(t)

test:
	ng test

check: lint test

run:
	cd ../../ && ng s focusf --port $(port)

g:
	cd ../../ && ng g $(a)
