// controllers/authController.ts
import { Context } from "../deps.ts";
import { create, getNumericDate } from "../deps.ts";
import { getKey } from "../keyManager.ts";

// Define Algorithm type locally
type Algorithm = "HS256" | "HS384" | "HS512";

const key = getKey()

export const signIn = async (ctx: Context) => {
  if (!key) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Server error: Key not initialized" };
    return;
  }

  const body = ctx.request.body({ type: "json" });
  const { username, password } = await body.value;
  if (username === "admin" && password === "password") {
    const payload = {
      iss: username,
      exp: getNumericDate(60 * 60), // Expires in 1 hour
    };
    const header = { alg: "HS256" as Algorithm, typ: "JWT" };
    const token = await create(header, payload, key);
    ctx.response.status = 200;
    ctx.response.body = { token, username };
  } else {
    ctx.response.status = 401;
    ctx.response.body = { message: "Invalid credentials" };
  }
};


export const verifyToken = (ctx: Context) => {
  if (!key) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Server error: Key not initialized" };
    return;
  }

  ctx.response.status = 200;
  ctx.response.body = { message: "Token is valid" };
};