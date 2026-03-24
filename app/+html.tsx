import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#00AEEF" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          html { height: 100%; min-height: calc(100% + env(safe-area-inset-top)); }
          body, #root { margin: 0; padding: 0; height: 100%; overflow: hidden; }
          input:focus, textarea:focus, [contenteditable]:focus { outline: none !important; box-shadow: none !important; }
        ` }} />
        <link rel="stylesheet" href="https://use.typekit.net/otb3sts.css" />
        <script dangerouslySetInnerHTML={{ __html: `new MutationObserver(function(){document.querySelectorAll('video:not([playsinline])').forEach(function(v){v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');});}).observe(document.documentElement,{childList:true,subtree:true});` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
