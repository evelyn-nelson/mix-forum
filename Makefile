dev-d:
	docker-compose --profile development down

dev-up:
	docker-compose --profile development up --build

dev-b: dev-d dev-up


prod-d:
	docker-compose --profile production down

prod-up:
	docker-compose --profile production up --build -d

prod-b: prod-d prod-up

