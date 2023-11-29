# CHANGELOG

## 2.6.1

### Various fixes & improvements

- chore: update babel and jest (#122) by @alikirec
- Load from formsort.app rather than flow.formsort.com (#121) by @fzembow

## 2.6.0

### Various fixes & improvements

- update `constants` in `web-embed-api` (#117) by @alikirec
- Update `embed-messaging-manager` in `web-embed-api` (#116) by @alikirec

## 2.5.0

### Various fixes & improvements

- Add support for ResponderStateUpdated in web-embed-api (#105) by @fzembow

## 2.4.1

### Various fixes & improvements

- upgrade constants (#89) by @helencho

## 2.4.0

### Various fixes & improvements

- Send `styleSet` to embedded flow when requested (#85) by @helencho
- update readme for more clarity around embeds (#81) by @helencho

## 2.3.0

### Various fixes & improvements

- Issue 72 - Support React 18 (#79) by @atikenny
- Revert Client subdomain as default domain (#78) by @atikenny

## 2.2.2

### Various fixes & improvements

- Remove Client label from the default Flow Url (#77) by @atikenny
- release: 2.2.1 (68829a45) by @formsort-release

## 2.2.1

### Various fixes & improvements

- update default Flow origin to {clientLabel}.formsort.app (#76) by @atikenny
- Authenticated Flow example (#73) by @atikenny

## 2.2.0

- Add `unauthorized` event listeners.

## 2.0.2

- `addEventListener` now has the correct behavior of _adding_ a new listener, rather than replacing any existing listener.

## 2.0.1

- Embed event names now match the analytics event names (such as `"FlowLoaded"` instead of `"flowloaded"`).
- `"StepLoaded"` and `"StepCompleted"` are now available to embeds.
- When embedded in a whitelisted origin, event handlers now will receive answers, as `{ answers: { ... } }`.
- Embeds can now cancel redirects, by returning an object `{ cancel: true }` in the handler for the `redirect` event.
- Add react@17 to peerDependencies.
