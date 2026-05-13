const browserNavigation = {
  getOrigin: () => window.location.origin,
  assign: (url: string) => {
    window.location.assign(url);
  },
  pushState: (url: string) => {
    window.history.pushState({}, document.title, url);
  },
};

export default browserNavigation;
