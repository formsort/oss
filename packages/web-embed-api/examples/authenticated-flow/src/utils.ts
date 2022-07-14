const getConfig = () => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    alert('Need to provide a Google Client ID');
    throw new Error('Need to provide a Google Client ID');
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
    googleSignInButton
  };
};

export { getConfig }
