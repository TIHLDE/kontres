
setup:
	pnpm install
	docker compose up -d
	pnpm prisma db push

prod:
	docker build -t dev-kontres.tihlde.org .
	- docker rm -f dev-kontres.tihlde.org
	- prisma migrate deploy
	docker run --env-file .env -p 9000:3000 --name dev-kontres.tihlde.org --restart unless-stopped -d dev-kontres.tihlde.org

