import type { ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";

const CREATE_PATH = "/create";

function redirectCreate(
  request: Connect.IncomingMessage,
  response: ServerResponse,
  next: Connect.NextFunction,
): void {
  const [pathname = "", query] = (request.url ?? "").split("?");
  if (pathname !== CREATE_PATH) return next();

  const location = query === undefined ? `${CREATE_PATH}/` : `${CREATE_PATH}/?${query}`;
  response.statusCode = 301;
  response.setHeader("Location", location);
  response.end();
}

/** Dev and preview only: production relies on the static host's directory redirect. */
export function redirectCreatePlugin(): Plugin {
  return {
    name: "redirect-create-to-trailing-slash",
    configureServer(server) {
      server.middlewares.use(redirectCreate);
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirectCreate);
    },
  };
}
