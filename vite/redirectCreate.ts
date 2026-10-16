import type { ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";

const CREATE_PATH = "/create";

/** Returns the trailing-slash location for exactly `/create`, otherwise null. */
export function getCreateRedirect(url: string): string | null {
  const queryStart = url.indexOf("?");
  const pathname = queryStart === -1 ? url : url.slice(0, queryStart);
  if (pathname !== CREATE_PATH) return null;

  const query = queryStart === -1 ? "" : url.slice(queryStart);
  return `${CREATE_PATH}/${query}`;
}

function redirectCreate(
  request: Connect.IncomingMessage,
  response: ServerResponse,
  next: Connect.NextFunction,
): void {
  const location = getCreateRedirect(request.url ?? "");
  if (location === null) return next();

  response.statusCode = 302;
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
