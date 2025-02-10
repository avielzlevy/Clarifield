import { Application, oakCors, send } from "./deps.ts";
import router from "./routes/routes.ts";
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

// const useHttps = fs.existsSync('./certs/cert.pem') && fs.existsSync('./certs/key.pem');
const certPath = `${Deno.cwd()}\\certs\\cert.pem`;
const keyPath = `${Deno.cwd()}\\certs\\key.pem`;

const useHttps = existsSync(certPath) && existsSync(keyPath);
console.log(certPath);

if (useHttps) {
  console.log("Certificate and key found, using HTTPS on port 443");
  await app.listen({
    port: 443,
    hostname: "0.0.0.0",
    secure: true,
    cert: Deno.readTextFileSync(certPath),
    key: Deno.readTextFileSync(keyPath),
  });
} else {
  console.log("No certificate found, falling back to HTTP on port 443");
  await app.listen({ port: 443 });
}
