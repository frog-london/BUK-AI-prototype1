import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ScrollViewStyleReset />
        <link rel="stylesheet" href="https://use.typekit.net/otb3sts.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
