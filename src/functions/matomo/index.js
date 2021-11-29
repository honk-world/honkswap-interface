// https://developer.matomo.org/guides/spa-tracking
export const pageview = (url) => {
  window._paq.push(['setCustomUrl', window.location.pathname]);
  window._paq.push(['setDocumentTitle', document.title]);
  window._paq.push(['trackPageView']);
}

// https://matomo.org/docs/event-tracking
export const event = ({ category, action, name, value }) => {
  window._paq.push(['trackEvent', category, action, name, value]);
}
