# 2.0.2

- `addEventListener` now has the correct behavior of _adding_ a new listener, rather than replacing any existing listener.

# 2.0.1

- Embed event names now match the analytics event names (such as `"FlowLoaded"` instead of `"flowloaded"`).
- `"StepLoaded"` and `"StepCompleted"` are now available to embeds.
- When embedded in a whitelisted origin, event handlers now will receive answers, as `{ answers: { ... } }`.
- Embeds can now cancel redirects, by returning an object `{ cancel: true }` in the handler for the `redirect` event.
- Add react@17 to peerDependencies.
