import { Application, oakCors, send } from "./deps.ts";
import router from "./routes/routes.ts";
import "https://deno.land/x/dotenv/load.ts";
const app = new Application();
app.use(
  oakCors({
    origin: "*",
    credentials: true,
  })
);

app.use(async (context, next) => {
  const path = context.request.url.pathname;

  if (path === "/") {
    // Serve the React index.html for the root path
    await send(context, "/index.html", {
      root: `${Deno.cwd()}/../client/build`,
    });
  } else {
    try {
      // Serve static files from the React build directory (e.g., JS, CSS, images)
      await send(context, path, {
        root: `${Deno.cwd()}/../client/build`,
        index: "index.html", // Fallback for React Router paths
      });
    } catch {
      await next(); // Continue to the router for API requests
    }
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

function existsSync(path: string): boolean {
  try {
    Deno.statSync(path);
    return true;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return false;
    }
    throw e;
  }
}

let certPath, keyPath;
if (Deno.build.os === "windows") {
  certPath = `${Deno.cwd()}\\certs\\cert.pem`;
  keyPath = `${Deno.cwd()}\\certs\\key.pem`;
} else if (Deno.build.os === "linux") {
  certPath = `${Deno.cwd()}/certs/cert.pem`;
  keyPath = `${Deno.cwd()}/certs/key.pem`;
} else {
  console.log("You are running on a not supported OS");
}
if(!certPath || !keyPath) {
  console.log("Certificate and key paths not found");
  Deno.exit(1);
}
const useHttps = existsSync(certPath) && existsSync(keyPath);
// console.log(certPath);
const port = Deno.env.get("PORT") ? Number(Deno.env.get("PORT")) : 443;
if (useHttps) {
  console.log("Certificate and key found, using HTTPS on port 443");
  await app.listen(<any>{
    port,
    hostname: "0.0.0.0",
    secure: true,
    cert: Deno.readTextFileSync(certPath),
    key: Deno.readTextFileSync(keyPath),
  });
} else {
  console.log(`No certificate found, falling back to HTTP on port  ${port}`);
  await app.listen({ port });
}
