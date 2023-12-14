import { forwarder } from "./forwarder.ts";

/** `pathname` to `handler` */
type RouterTable = Map<string, Deno.ServeHandler>;

const route: (
  catchAllHandler: Deno.ServeHandler,
) => (table: RouterTable) => Deno.ServeHandler =
  (catchAllHandler) => (table) => (req, info) => {
    const handler = table.get(req.url);
    return handler ? handler(req, info) : catchAllHandler(req, info);
  };

export const router = route(forwarder)(new Map());
