# Pre-populating Answers via postMessage

## Problem

When using `queryParams` to pre-populate form answers, CloudFront blocks requests with excessively long query strings (typically >2KB-8KB depending on configuration). This limitation can prevent users from successfully loading flows with large amounts of pre-populated data.

## Solution

The new `answers` parameter allows you to send answer data via `postMessage` instead of query parameters. This approach:

- **Bypasses URL length limitations** - Data is sent after the iframe loads, not in the URL
- **Works with any payload size** - No practical limit on the amount of data you can send
- **Maintains backward compatibility** - Existing code using `queryParams` continues to work

## Usage Examples

### Web Embed API

```typescript
import FormsortWebEmbed from '@formsort/web-embed-api';

const embed = FormsortWebEmbed(document.getElementById('formsort-container'));

// Pre-populate with large dataset
embed.loadFlow(
  'my-client',
  'my-flow',
  'main',
  undefined, // queryParams (can be omitted or used for small metadata)
  {
    // Large answer dataset
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
    address: {
      address_1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      country: 'US'
    },
    preferences: ['option1', 'option2', 'option3', 'option4', 'option5'],
    biography: 'A very long biography text that would exceed URL length limits...',
    customData: {
      /* large nested object */
    }
  }
);
```

### React Embed

```tsx
import EmbedFlow from '@formsort/react-embed';

function MyComponent() {
  const largeAnswerData = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    companyInfo: {
      name: 'Acme Corp',
      employees: '50-100',
      industry: 'Technology'
    },
    previousResponses: [
      // Array of previous survey responses
      { questionId: 'q1', answer: 'value1' },
      { questionId: 'q2', answer: 'value2' },
      // ... many more items
    ]
  };

  return (
    <EmbedFlow
      clientLabel="my-client"
      flowLabel="my-flow"
      variantLabel="main"
      answers={largeAnswerData}
      onFlowFinalized={() => console.log('Flow completed!')}
    />
  );
}
```

## When to Use `answers` vs `queryParams`

### Use `answers` when:
- ✅ You have large amounts of data to pre-populate (>1KB recommended threshold)
- ✅ You're encountering CloudFront errors due to URL length
- ✅ Your data contains complex nested objects or arrays
- ✅ You want to keep sensitive data out of the URL

### Use `queryParams` when:
- ✅ You have small amounts of data (<1KB)
- ✅ You need the values visible in the URL for tracking/analytics
- ✅ You need the URL to be shareable with pre-populated values
- ✅ You're working with legacy code that expects query parameters

### Using Both Together

You can use both `queryParams` and `answers` simultaneously:

```typescript
embed.loadFlow(
  'my-client',
  'my-flow',
  'main',
  [
    ['utm_source', 'email'],      // Small tracking params in URL
    ['utm_campaign', 'spring2024']
  ],
  {
    // Large form data via postMessage
    customerProfile: { /* large object */ },
    historicalData: [ /* large array */ ]
  }
);
```

## How It Works

1. The embed creates the iframe with the flow URL (with optional query params)
2. The iframe loads and the flow initializes
3. When the `FlowLoaded` event fires, the embed sends the `answers` data via `postMessage`
4. The Formsort application receives the message and applies the answers to the form

This approach is similar to how authenticated flows already work - data is sent securely via `postMessage` after the iframe is ready.

## Migration Guide

### Before (using queryParams for everything):

```typescript
const queryParams = [
  ['name', userData.name],
  ['email', userData.email],
  ['preferences', JSON.stringify(userData.preferences)], // Can cause issues with large data
  ['history', JSON.stringify(userData.history)]           // CloudFront may block this
];

embed.loadFlow('client', 'flow', 'variant', queryParams);
```

### After (using answers for large data):

```typescript
const queryParams = [
  ['utm_source', 'campaign']  // Keep small tracking params in URL if needed
];

const answers = {
  name: userData.name,
  email: userData.email,
  preferences: userData.preferences,     // No need to stringify
  history: userData.history               // Works regardless of size
};

embed.loadFlow('client', 'flow', 'variant', queryParams, answers);
```

## Implementation Note for Formsort

This POC demonstrates the client-side SDK changes needed to support answer prepopulation via `postMessage`. The Formsort application will need to be updated to:

1. Listen for the `EMBED_ANSWERS_MSG` (`ƒ_wea`) message type
2. Apply the received answers to the form state when the message is received
3. Merge with any existing answers from query parameters

The message format is:

```typescript
{
  type: 'ƒ_wea',  // WebEmbedMessage.EMBED_ANSWERS_MSG
  payload: {
    answers: {
      [answerKey: string]: string | number | boolean | Array | Object
    }
  }
}
```


