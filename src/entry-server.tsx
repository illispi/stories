import { StartServer, createHandler } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang={"en"}>
        <head>
          <title>test</title>
          <meta charset={"utf-8"} />
          <meta
            name={"viewport"}
            content={"width=device-width, initial-scale=1"}
          />
          <link rel={"icon"} href={"/favicon.png"} />
          {assets}
        </head>
        <body class="min-h-screen lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
          <div id={"app"}>{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
