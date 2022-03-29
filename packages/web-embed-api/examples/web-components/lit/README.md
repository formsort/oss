# Example for embedding Formsort using [Lit](https://lit.dev/) Web Components

The project was bundled with [Parcel](https://parceljs.org/cli.html).

### Instructions

1. Install the [parcel](https://parceljs.org/cli.html) package bundler: `yarn global add parcel-bundler`
1. Install dependencies using `yarn install --frozen-lockfile`.
1. Add an `.env` file to the project root with the following variables:

```
CLIENT = my-client
FLOW = first-flow
VARIANT = main
```

Also, you can optionally add a value `FORMSORT_ORIGIN`, if different then the default `https://flow.formsort.com`.

1. Start the project using either `yarn start` or `parcel index.html`.
