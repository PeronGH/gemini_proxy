const TARGET_ORIGIN = "https://generativelanguage.googleapis.com";

const forward: (targetOrigin: string) => Deno.ServeHandler =
  (targetOrigin) => (req) => {
    const requestOrigin = new URL(req.url).origin;
    const newUrl = new URL(req.url.slice(requestOrigin.length), targetOrigin);
    return fetch(newUrl, req);
  };

export const forwarder = forward(TARGET_ORIGIN);
