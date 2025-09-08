
setup:
	pnpm install
	docker compose up -d
	pnpm prisma db push

