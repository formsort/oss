# Example for embedding Formsort using `@formsort/react-embed`

The project was bundled with [Parcel](https://parceljs.org/cli.html).

### Instructions

1. Install dependencies using `npm install`.
1. Add an `.env` file to the project root with the following variables:

```
CLIENT=my-client
FLOW=first-flow
VARIANT=main
```

You can optionally add a `FORMSORT_ORIGIN` variable, if this value is different then the default `https://flow.formsort.com`.

Start the project using `npm start`. 

_note_: In order to receive answers from the embedded flow, the domain in which it is embedded must be whitelisted. To do so in the Formsort studio, go to the "security" tab and add the url in "Allowed embedding domains". To work when running this project locally, you can use an application such as [ngrok](https://ngrok.com/) to create a public url for the locally running server on `localhost:1234`. Remember to navigate in your browser to the url that starts with `https://`. 

