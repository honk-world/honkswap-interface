// https://developer.matomo.org/guides/spa-tracking
export const pageview = (url) => {
  window._paq.push(['setCustomUrl', window.location.pathname]);
  window._paq.push(['setDocumentTitle', document.title]);
  window._paq.push(['trackPageView']);
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  /*
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
  */
}
