import { Context } from "https://deno.land/x/oak@v12.5.0/mod.ts";

// deps.ts
export {
  Application,
  Router,
  Context,
  helpers,
  type RouterContext,
} from "https://deno.land/x/oak@v12.5.0/mod.ts";
export { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
export {
  create,
  verify,
  getNumericDate,
  type Header,
} from "https://deno.land/x/djwt@v2.8/mod.ts";

export const getLogs = async (ctx: Context) => {
  try {
    const logs = await Deno.readTextFile("./logs/audit.log");
    ctx.response.body = logs;
    ctx.response.status = 200;
  } catch (e:any) {
    console.log(e.message)
    ctx.response.body = "No logs found";
    ctx.response.status = 404;
  }
};
