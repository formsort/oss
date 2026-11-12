# Secure embed example

A small page that embeds a Formsort flow with `FormsortSecureWebEmbed`. It
shows how to:

- prefill answers, including compound and repeating compound questions
- load a specific variant revision
- listen to embed events

It uses [Vite](https://vite.dev) and TypeScript, with no UI framework. All the
embed code is in [`src/main.ts`](src/main.ts).

## What you need

- Node.js 20.19+ or 22.12+
- [`cloudflared`](https://github.com/cloudflare/cloudflared), Cloudflare's
  tunnel tool. On macOS: `brew install cloudflared`.
- A Formsort variant that can be embedded on `https://*.trycloudflare.com`
  (see [Why a tunnel?](#why-a-tunnel)). Add `*.trycloudflare.com` in workspace security > embedding domains for testing.
Remove it after finishing testing. See [Formsort docs](https://docs.formsort.com/publishing-and-deployment/embedding#whitelisting-embedding-domains) for more information.
- Questions in that variant that match the answers in `src/main.ts`. Either
  create these questions, or change `initialAnswers` to use your own schema
  keys:

  | Schema key              | Question                                                                                                         | Value in `src/main.ts`                                     |
  | ----------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
  | `previous_visit_reason` | Text                                                                                                             | `'Annual check-up'`                                        |
  | `name`                  | Compound, with the text sub-questions `first_name` and `last_name`                                               | `{ first_name: 'Olivia', last_name: 'Smith' }`             |
  | `medicines`             | Compound that allows multiple entries, with the sub-questions `medication_name` (text) and `daily_dose` (number) | `[{ medication_name: 'Ibuprofen', daily_dose: 400 }, ...]` |

> **Tip:** To see which revision is loaded, add an informational question with
> `{{variant_revision_uuid}}` in its label.

## Run it

1. Install the dependencies, then go to this folder.

   In this repository, install and build the packages from the repository
   root. The example uses the local build of `@formsort/web-embed-api`.

   ```bash
   pnpm install
   pnpm build
   cd packages/web-embed-api/examples/secure-embed
   ```

   In your own project, copy this folder, run `npm install` in it, and remove
   the `optimizeDeps` block from `vite.config.ts`. Then use `npm run dev`
   instead of `pnpm dev` in step 3.

2. Copy `.env.example` to `.env`, then set your labels:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_FORMSORT_CLIENT_LABEL=<client-label>
   VITE_FORMSORT_FLOW_LABEL=<flow-label>
   VITE_FORMSORT_VARIANT_LABEL=<variant-label>
   # Optional. Leave empty to load the latest published revision.
   VITE_FORMSORT_VARIANT_REVISION_UUID=
   ```

3. Start the dev server. It runs on `http://localhost:5173`.

   ```bash
   pnpm dev
   ```

4. In a second terminal, start a Cloudflare quick tunnel to the dev server:

   ```bash
   cloudflared tunnel --url http://localhost:5173
   ```

   It prints a URL like `https://<random-words>.trycloudflare.com`. You get a
   new URL each time you start the tunnel.

5. Open the `trycloudflare.com` URL in your browser.

### Why a tunnel?

Formsort only loads a flow in an iframe on domains that are allowed to embed
it. `http://localhost` is usually not one of them, so the browser blocks the
iframe and shows an error like this in the console:

```text
Framing 'https://<client>.formsort.app/' violates the following Content Security Policy directive: "frame-ancestors ..."
```

A quick tunnel gives your local dev server a public HTTPS address on
`trycloudflare.com`. Make sure `https://*.trycloudflare.com` is one of the
domains allowed to embed your flow. If you don't know where to change this,
contact Formsort support.

> **Warning:** Anyone can start a quick tunnel. If you allow
> `https://*.trycloudflare.com`, any page on that domain can embed your flow.
> Allow it only on a flow or variant that you use for testing, and remove it
> when you are done.

`vite.config.ts` allows `.trycloudflare.com` hosts. Vite blocks requests from
other hostnames by default.

## Try it

- **Answers.** Open **Answers sent to the flow** to see what the page sends.
  The flow shows these answers already filled in.
- **Variant revisions.** The status line above the flow shows the UUID of the
  revision that loaded. Paste a revision UUID and select **Load flow** to load
  that revision. Leave the field empty to load the latest published revision.
  The status line comes from the `variantRevisionUuid` field of the
  `FlowLoaded` event.
- **Events.** The **Events** list shows each event, newest first. Open an event
  to see its payload: the responder, the loaded revision and the answers. The
  answers are only included if your domain is allowed to receive them from
  the flow. This demo cancels redirects so that you stay
  on the page. Remove `return { cancel: true }` in `src/main.ts` to let them
  happen.

## Troubleshooting

| Problem                                                                            | Fix                                                                                                                                         |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| The page asks you to copy `.env.example`                                           | Create `.env` (step 2) and replace the `<placeholders>`, then restart `pnpm dev`. Vite reads `.env` only when it starts.                    |
| The iframe is empty and the console shows a `frame-ancestors` error                | Open the page through the tunnel URL, not `localhost`. Make sure your flow can be embedded on `https://*.trycloudflare.com`.                |
| The tunnel URL shows "Blocked request. This host is not allowed."                  | Add your tunnel's domain to `server.allowedHosts` in `vite.config.ts`.                                                                      |
| An answer is not filled in                                                         | Check that the key matches the question's schema key exactly. For compound questions, use the sub-questions' schema keys inside the object. |
| `does not provide an export named 'FormsortSecureWebEmbed'` (this repository only) | Keep the `optimizeDeps` block in `vite.config.ts`.                                                                                          |
