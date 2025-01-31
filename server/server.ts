import { Application,oakCors } from "./deps.ts";
import router from "./routes/routes.ts";
const app = new Application();

app.use(
    oakCors({
      origin: "*",
      credentials: true,
    })
  );

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:5000");
await app.listen({ port: 5000 });
