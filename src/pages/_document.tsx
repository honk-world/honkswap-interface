import Document, { Head, Html, Main, NextScript } from 'next/document'

import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    return (
      <Html lang="en" dir="ltr">
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

          <link rel="manifest" href="/site.webmanifest" />

          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />

          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/apple-touch-icon-precomposed.png" />

          <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png" />
          <link rel="apple-touch-icon-precomposed" sizes="57x57" href="/apple-touch-icon-57x57-precomposed.png" />

          <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png" />
          <link rel="apple-touch-icon-precomposed" sizes="60x60" href="/apple-touch-icon-60x60-precomposed.png" />

          <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png" />
          <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/apple-touch-icon-72x72-precomposed.png" />

          <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png" />
          <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/apple-touch-icon-76x76-precomposed.png" />

          <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png" />
          <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/apple-touch-icon-114x114-precomposed.png" />

          <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />
          <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/apple-touch-icon-120x120-precomposed.png" />

          <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png" />
          <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/apple-touch-icon-144x144-precomposed.png" />

          <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
          <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/apple-touch-icon-152x152-precomposed.png" />

          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
          <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/apple-touch-icon-180x180-precomposed.png" />

          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="shortcut icon" href="/favicon.ico" />

          <link rel="manifest" href="/manifest.json" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                var _paq = window._paq = window._paq || [];
                _paq.push(['trackPageView']);
                _paq.push(['enableLinkTracking']);
                (function() {
                  var u="//matomo.mistswap.fi/";
                  _paq.push(['setTrackerUrl', u+'matomo.php']);
                  _paq.push(['setSiteId', '1']);
                  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                  g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
                })();
              `
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
