interface IConfig {
  googleClientId: string,
  rootEl: HTMLElement,
  googleSignInButton: HTMLElement,
  clientLabel: string,
  flowLabel: string,
  variantLabel: string,
  origin?: string
}

const getConfig = (): IConfig => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    alert('Need to provide a Google Client ID');
    throw new Error('Need to provide a Google Client ID');
  }

  const clientLabel = process.env.CLIENT_LABEL || '';
  const flowLabel = process.env.FLOW_LABEL || '';
  const variantLabel = process.env.VARIANT_LABEL || '';
  const origin = process.env.ORIGIN || 'https://flow.formsort.com';

  if (!clientLabel || !flowLabel || !variantLabel) {
    alert('Need to provide a client, flow and variant');
    throw new Error('Need to provide a client flow and variant');
  }

  const rootEl = document.querySelector('#formsort-embed') as HTMLElement;
  const googleSignInButton = document.getElementById('google-sign-in') as HTMLElement;

  if (!rootEl) {
    throw new Error(`Could not find root element`);
  }

  if (!googleSignInButton) {
    throw new Error('Could not find Google sign in button');
  }

  return {
    googleClientId,
    rootEl,
    googleSignInButton,
    clientLabel,
    flowLabel,
    variantLabel,
    origin
  };
};

export { getConfig }
