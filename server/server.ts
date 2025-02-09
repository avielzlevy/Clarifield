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

if (Deno.env.get("PORT")) {
  const port = parseInt(Deno.env.get("PORT") as string);
  console.log(`Server running on http://localhost:${port}`);
  await app.listen({ port });
} else {
  console.log("Server running on http://localhost:443");
  await app.listen({ port: 443 });
}
