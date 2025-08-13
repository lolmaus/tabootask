# Tabootask

A Markdown-based task list.

## Development

### Env Vars and Dotenv FIles

This project violates Turborepo [recommendation](https://turborepo.com/docs/crafting-your-repository/using-environment-variables#use-env-files-in-packages) and keeps dotenv files in the root folder.

This is because:

* I (@lolmaus) found it difficult to manage env vars scattered across multiple folders. It's too easy to miss something important.
* Frameworks such as Next and Convex make their own assumptions on what dotenv files there should be, in which order they are read, etc. It's too easy to stumble upon a framework reading from an incorrect dotenv file.
* Convex writes into `.env.local` whenever you switch between dev and test local databases, and there seems to be no way to disable this behavior.
* There is a tragic confusion in the word "environment" between two unrelated concepts:
    * Deployment target, e. g. production server, staging server, dev server, testing server.
    * Build/runtime mode, e. g. code minification, verbose logging, debug features, testing APIs, etc.

    For example, you might want to run a non-minified dev build against a production server, and you want a separate dotenv file that captures this specific combination.

    This in turn means that the choice of dotenv file should be the source of truth for such env vars as `NODE_ENV`, `IS_TEST`, and not vice versa.

Filenames of dotenv files may contain more than one segment, e. g. `.env.prod-dev`:

* The first segment represents deploy target.
* The second segment represents build/runtime mode.

To start an `package.json` script with a specfic dotenv file, use the `dotenv` command (install it via `pnpm i -g dotenv-cli`):

```sh
dotenv - .env.dev -- pnpm run dev
```

## Deployment with Dokploy

As of 2025, Dokploy does not support environments, so create a separate project for each environment.

## Domains

* `tabootask.lolma.us` — production frontend (Next.js) @ `renton.lolma.us`
* `api.tabootask.lolma.us` — production backend (Convex SDK API) @ `renton.lolma.us`
* `http.tabootask.lolma.us` — production backend (Convex HTTP API) @ `renton.lolma.us`
* `convex.tabootask.lolma.us` — production Convex dashboard @ `renton.lolma.us`
* `*.tabootask-preview.lolma.us` — preview deployments for frontend (Next) and ephemeral backend (Convex) @ `renton.lolma.us`

### Production environment

Services:

* Postgres
    * Type: Database
    * Image: `postgres:17`
    * Database name: `convex`
    * Password: generate one and save
    * Manually create a database `convex_self_hosted` via terminal in the Posgtres container after deployment:

        ```sh
        psql -U postgres
        ```

        ```sql
        CREATE DATABASE convex_self_hosted;
        ```
* Convex
    * Type: Compose (Docker Compose)
    * Provider: Raw
    * `docker-compose.yml`:
        * copy from [here](https://github.com/get-convex/convex-backend/blob/main/self-hosted/README.md#docker-configuration)
        * add this to each service:

            ```yml
            networks:
              - dokploy-network
            ```

        * add this to the `data` volume:

            ```yml
            driver: local
            ```

        * add this to the root:

            ```yml
            networks:
              dokploy-network:
                external: true
            ```
    * Env vars:

        ```sh
        # Unique subdomain on your domain
        CONVEX_CLOUD_ORIGIN=https://api.tabootask.lolma.us

        # Another unique subdomain on your domain
        CONVEX_SITE_ORIGIN=https://http.tabootask.lolma.us

        # Copy `Internal Connection Url` from Convex service, remove `convex` from the end
        POSTGRES_URL=postgresql://postgres:password@convex-container-name:5432

        # Localhost connections do not need encryption (SSL is not set up, so it won't work anyway)
        DO_NOT_REQUIRE_SSL=1
        ```
    * Domains (service names become available after deployment):
        * Convex SDK API
            * Service name: `backend`
            * Host: `api.tabootask.lolma.us`
            * Path: `/`
            * Internal path: `/`
            * Container port: `3210`
            * HTTPS: yes
            * Certificate provider: Let's Encrypt
        * Convex HTTP API
            * Service name: `backend`
            * Host: `http.tabootask.lolma.us`
            * Path: `/`
            * Internal path: `/`
            * Container port: `3211`
            * HTTPS: yes
            * Certificate provider: Let's Encrypt
        * Convex Dashboard
            * Service name: `dashboard`
            * Host: `convex.tabootask.lolma.us`
            * Path: `/`
            * Internal path: `/`
            * Container port: `6791`
            * HTTPS: yes
            * Certificate provider: Let's Encrypt
    * Copy admin key from terminal via:

        ```sh
        cd /convex
        ls
        ./generate_admin_key.hs
        ```
* Next
    * Type: Application
    * Provider: GitHub
    * Repository: pick `tabootask` from list
    * Branch: pick `main` from list
    * Env vars:

        ```sh
        # Dokploy
        NIXPACKS_INSTALL_CMD="pnpm install --frozen-lockfile"
        NIXPACKS_BUILD_CMD="pnpm run deploy:prod && pnpm build:prod"
        NIXPACKS_START_CMD="pnpm run serve:prod"

        # Backend
        CONVEX_SELF_HOSTED_ADMIN_KEY=convex-self-hosted|bla-bla-bla

        # Frontend
        NEXT_PUBLIC_CONVEX_URL=https://api.tabootask.lolma.us
        ```

    * Domains:
        
        * Web app:
            * Domain: `tabootask.lolma.us`
            * Path: `/`
            * Internal path: `/`
            * Port: `3000`
            * HTTPS: yes
            * Certificate provider: Let's Encrypt