docker.build:
	docker-compose up -d --build --remove-orphans

docker.up:
	docker-compose up -d

docker.down:
	docker-compose down

docker.reup: docker.down docker.up

docker.rebuild: docker.down docker.build
