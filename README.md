
# KontRes

This is a simple page which is used to book TIHLDE's office!


## Installation

```bash
git clone https://github.com/tihlde/kontresv2.git
cd kontresv2

# If this is your first time running the application:
pnpm install

# Thats it!
```

From now on, it's enough to run `pnpm run dev` to start the application.

### Development database (Docker)

To run a local PostgreSQL database for development:

```bash
docker compose up -d
```

This starts Postgres 16 on `localhost:5433` (port 5433 avoids conflict with a local Postgres on 5432). Credentials come from your `.env` (see `.env.example`). Apply migrations with:

```bash
pnpm prisma migrate deploy
```

Stop the database with `docker compose down`.

## ⚙ Configuration
The application requires configuration of some environment variables in order to run. These should be put in a .env file in the repository root.

```bash
NEXT_PUBLIC_API_URL=YOUR_API_URL_HERE
```
## 🔧 Technologies

- NextJS
- Typescript
- Tailwind
- Shadcn



## ❤ Contributing

KontRes is an open source project built on voluntary work.
We are committed to a fully transparent development process
and highly appreciate any contributions.
Whether you are helping us fixing bugs, proposing new features, improving our documentation
or spreading the word - **we would love to have you as part of the community**.

## 🤝 Found a bug? Missing a specific feature?

Feel free to file a new issue with a respective title and description
on the the [tihlde/kontresv2](https://github.com/TIHLDE/kontresv2/issues) repository.
If you already found a solution to your problem, we would love to review your pull request!
Please format your code with prettier.
If you open the workspace-file in VSCode, the code will be formatted automatically on save.

## 📫 Contact

Feel free to send us a message on our official [slack channel](https://tihlde.slack.com/archives/C01CJ0EQCFM).
Of course you can always reach out to us directly at index@tihlde.org.

## 📘 Licence

The code in this project is licensed under MIT license.
