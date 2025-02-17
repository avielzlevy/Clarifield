// controllers/authController.ts
import { Context } from "../deps.ts";
import { create, getNumericDate } from "../deps.ts";
import { getKey } from "../keyManager.ts";
import ldap from "npm:ldapjs"; // Import ldapjs using Deno's npm compatibility

// Read the LDAP_AUTH environment variable
const USE_LDAP = Deno.env.get("LDAP_AUTH") === "true";

// Define Algorithm type locally
type Algorithm = "HS256" | "HS384" | "HS512";

const key = getKey();

// LDAP Configuration
const ldapConfig = {
  url: "ldap://ldap.dental.org.il", // Update this with your LDAP server URL
  baseDN: "DC=dental,DC=org,DC=il", // Update this to match your LDAP directory
  domainSuffix: "@dental.org.il", // If your LDAP uses domain suffixes for logins
};

// Function to authenticate with LDAP
function ldapAuthenticate(username: string, password: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url: ldapConfig.url,
      tlsOptions: {
        rejectUnauthorized: false, // Development only, remove in production
      },
    });

    const userDN = `${username}${ldapConfig.domainSuffix}`;

    client.bind(userDN, password, (err: Error | null) => { // Explicitly define error type
      if (err) {
        console.error(`LDAP Authentication failed for ${username}: ${err.message}`);
        client.unbind();
        return reject(false);
      }

      console.log(`LDAP Authentication successful for ${username}`);
      client.unbind();
      resolve(true);
    });
  });
}
// Sign-in Function
export const signIn = async (ctx: Context) => {
  if (!key) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Server error: Key not initialized" };
    return;
  }

  const body = ctx.request.body({ type: "json" });
  const { username, password } = await body.value;

  if (!username || !password) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Username and password are required" };
    return;
  }

  let authenticated = false;

  if (USE_LDAP) {
    console.log("Using LDAP authentication...");
    try {
      authenticated = await ldapAuthenticate(username, password);
    } catch {
      authenticated = false;
    }
  } else {
    console.log("Using local authentication...");
    authenticated = username === "admin" && password === "password";
  }

  if (authenticated) {
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

// Token verification function
export const verifyToken = (ctx: Context) => {
  if (!key) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Server error: Key not initialized" };
    return;
  }

  ctx.response.status = 200;
  ctx.response.body = { message: "Token is valid" };
};
