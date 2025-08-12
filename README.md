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