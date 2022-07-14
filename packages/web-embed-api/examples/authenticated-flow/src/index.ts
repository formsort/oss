import FormsortWebEmbed from '@formsort/web-embed-api';
import { getConfig } from './utils';

import './index.css';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void,
          renderButton: (element: HTMLElement, config: { theme: string, size: string }) => void,
          prompt: () => void
        }
      }
    };
  }
}

(() => {
  const { googleClientId, rootEl, googleSignInButton, clientLabel, flowLabel, variantLabel, origin } = getConfig();

  // Wait for the Google script to load
  window.onload = () => {
    const google = window.google;

    google.accounts.id.initialize({
      client_id: googleClientId, // use your Client ID from Google Console
      callback: (response: { credential: string }) => {
        const authentication = { idToken: response.credential };

        const embed = FormsortWebEmbed(rootEl, {
          origin,
          style: { width: '100%', height: '500px' },
          authentication,
        });
      
        embed.addEventListener('unauthorized', () => {
          // eslint-disable-next-line no-console
          console.error('Unauthorized');
        });
      
        embed.loadFlow(clientLabel, flowLabel, variantLabel);
      },
    });

    google.accounts.id.renderButton(
      googleSignInButton,
      { theme: 'outline', size: 'large' } // customization attributes
    );

    google.accounts.id.prompt(); // also display the One Tap dialog
  };
})();
