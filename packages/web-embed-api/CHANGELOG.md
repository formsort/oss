# 2.0.1

- Embed event names now match the analytics event names (such as `"FlowLoaded"` instead of `"flowloaded"`).
- `"StepLoaded"` and `"StepCompleted"` are now available to embeds.
- When embedded in a whitelisted origin, event handlers now will receive answers, as `{ answers: { ... } }`
- Embeds can now cancel redirects, by returning an object `{ cancel: true }` in the handler for the `redirect` event
