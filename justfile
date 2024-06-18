set shell := ["nu", "-c"]

build_docker:
	docker-compose up -d --build --remove-orphans

up_docker:
	docker-compose up -d

down_docker:
	docker-compose down

rebuild_docker: docker.down docker.build
