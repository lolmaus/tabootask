# Tabootask

## Development

### Prerequisites

- Docker;
- A Dev Container capable IDE such as VS Code.

This readme assumes you're using VS Code. You'll have to improvise for another IDE>

### Starting local development

1. Open this codebase in VS Code.
2. If you haven't already, run `Reopen in Container` in Command Palette. For the first time, it will take a while.
3. Open a Bash terminal in VS Code. Note that you can use the `Move Terminal into New Window` command for convenienc.
4. Start Postgres with `docker-compose up` in Bash.
5. Open another terminal.
6. If you haven't already, run `pnpm i`.
7. If you haven't already, run `pnpm exec drizzle-kit migrate` to set up your database schema.
8. Run `pnpm run dev` in Bash.
9. Make sure that the 5713 port is forwarded in VS code.
10. Open http://localhost:5173 in the browser.

### Installing dependencies

This project uses `pnpm`, so:

    pnpm i

### Accessing Postgres directly

This project uses Drizzle, so:

    pnpm run db:studio

Then access `https://local.drizzle.studio` in the browser. Note: ditch the `?host=0.0.0.0` part from the URL.

### Migrating the database

1.  Make changes to your `src/lib/server/db/schema.ts`.
2.  To generate a migration:

        pnpm exec drizzle-kit generate --name meaningful-description-of-changes

3.  To apply migrations:

        pnpm exec drizzle-kit migrate

4.  Don't forget to commit your changes.
