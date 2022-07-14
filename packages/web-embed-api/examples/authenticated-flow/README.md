# Example for embedding an authenticated Formsort Flow using Google OAuth

## Instructions

1. Install dependencies using `yarn install --frozen-lockfile`.
1. Set up your Authenticated Flow by following the [documentation](https://docs.formsort.com/going-live/embedding/adding-authentication).
1. Add an `.env` file to the project root with the following variables:

```env
GOOGLE_CLIENT_ID=your-client-id
CLIENT_LABEL=my-client
FLOW_LABEL=first-flow
VARIANT_LABEL=main
```

1. Start the dev server using the command `yarn start`.
