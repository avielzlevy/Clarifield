// middlewares/authMiddleware.ts
import { Context } from "../deps.ts";
import { verify } from "../deps.ts";
import { getKey } from "../keyManager.ts";

// Define Algorithm type locally
type Algorithm = "HS256" | "HS384" | "HS512";

const key = getKey()

export const authMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  if (!key) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Server error: Key not initialized" };
    return;
  }

  const authHeader = ctx.request.headers.get("Authorization");
  if (!authHeader) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Authentication header missing" };
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Token missing" };
    return;
  }

  try {
    const payload = await verify(token, key);
    ctx.state.user = payload;
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Invalid token",details: error };
  }
};
