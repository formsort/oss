# [Formsort](https://formsort.com) open source monorepo

## Packages

[`custom-question-api`](/packages/custom-question-api)

Helpers for implementing custom questions in Formsort.

[`react-embed`](/packages/react-embed)

React component to load formsort flows.

[`web-embed-api`](/packages/web-embed-api)

Embed flows within other webpages, allowing communication between the embed and the parent page.

## Publishing

This repo is published using [Craft](https://github.com/getsentry/craft).

You need to set the following environment variables to be able to work with Craft:

1. `GITHUB_TOKEN`: [Create a personal access token](https://github.com/settings/tokens/new?scopes=repo&description=Craft) from GitHub with `repo` permissions and set the token value to this env variable
2. `NPM_TOKEN`: Create an automation token from NPM by visiting https://www.npmjs.com/settings/<npm_user>/tokens/new and select **Automation** as the token type.

Then all you need to do is `yarn workspace @formsort/<package> run release <version>`. We'll take it from here :)

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for an overview of how to contribute to these packages.