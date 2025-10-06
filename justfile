setup:
	{{ if path_exists('.env') != "true" { "cp .env.example .env" } else { "" } }}
	pnpm install
	docker compose up --wait -d
	pnpm prisma db push

