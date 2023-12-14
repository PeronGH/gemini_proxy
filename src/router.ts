import { chatCompletion } from "custom_openai_api";
import { forwarder } from "./forwarder.ts";
import { chatCompletionHandler } from "./openai.ts";

/** `pathname` to `handler` */
type RouterTable = Map<string, Deno.ServeHandler>;

const route: (
  catchAllHandler: Deno.ServeHandler,
) => (table: RouterTable) => Deno.ServeHandler =
  (catchAllHandler) => (table) => (req, info) => {
    const { pathname } = new URL(req.url);
    const handler = table.get(pathname);
    try {
      return handler ? handler(req, info) : catchAllHandler(req, info);
    } catch (error) {
      console.error(error);
      return Response.json(error, { status: 500 });
    }
  };

const routeTable: RouterTable = new Map();
routeTable.set("/v1/chat/completions", chatCompletionHandler);

export const router = route(forwarder)(routeTable);
