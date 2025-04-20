export default {
  fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/ws")) {
      return handleWebsocketRequest(request);
    }
    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        name: "API Response from Cloudflare Worker",
      });
    }
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;


async function handleWebsocketRequest(request: Request) {
  const upgradeHeader = request.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();

  server.addEventListener('message', event => {
    console.log("Message received:", event.data);
    server.send(JSON.stringify({ name: "Message Reponse from Cloudflare Worker" }));
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}