// controllers/authController.ts
import { Context } from "../deps.ts";
import { create, getNumericDate } from "../deps.ts";
import { getKey } from "../keyManager.ts";
import ldap from "npm:ldapjs"; // Import ldapjs using Deno's npm compatibility

// Define Algorithm type locally
type Algorithm = "HS256" | "HS384" | "HS512";

const key = getKey();

// Function to authenticate with LDAP and check group membership
function ldapAuthenticate(
  username: string,
  password: string,
  ldapConfig: { url: string; baseDN: string; domainSuffix: string; allowedGroups: string[] }
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url: ldapConfig.url,
      tlsOptions: {
        rejectUnauthorized: false, // Development only, remove in production
      },
    });

    const userDN = `${username}${ldapConfig.domainSuffix}`;

    client.bind(userDN, password, (err: Error | null) => {
      if (err) {
        console.error(`LDAP Authentication failed for ${username}: ${err.message}`);
        client.unbind();
        return reject(false);
      }

      console.log(`LDAP Authentication successful for ${username}`);

      // Step 2: Search for user's groups
      const searchOptions = {
        scope: "sub",
        filter: `(sAMAccountName=${username})`, // Adjust if needed
        attributes: ["memberOf"], // Fetch groups
      };

      client.search(ldapConfig.baseDN, searchOptions, (err: Error | null, res: any) => {
        if (err) {
          console.error("LDAP search error:", err.message);
          client.unbind();
          return reject(false);
        }

        let userGroups: string[] = [];

        res.on("searchEntry", (entry:any) => {
          const memberOf = entry.attributes.find((attr:any) => attr.type === "memberOf");
          if (!memberOf || !memberOf.vals) {
            console.log(`No groups found for user: ${username}`);
            return reject(new Error("No groups found"));
          }

          // Store all user groups
          userGroups = memberOf.vals;

          // Step 3: Check if user is in allowed groups
          const inAllowedGroup = ldapConfig.allowedGroups.some((allowedGroup) =>
            userGroups.some((group) => group.includes(allowedGroup))
          );

          if (!inAllowedGroup) {
            console.log(`User ${username} is not in allowed groups:`, ldapConfig.allowedGroups);
            return reject(new Error("User not in allowed group"));
          }

          console.log(`User ${username} is in allowed group(s):`, userGroups);
          resolve(true);
        });

        res.on("error", (err:Error) => {
          console.error("LDAP search error:", err.message);
          reject(new Error("LDAP search failed"));
        });

        res.on("end", () => {
          client.unbind();
        });
      });
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

  // Load the LDAP_AUTH setting dynamically
  const USE_LDAP = Deno.env.get("LDAP_AUTH") === "true";
  if(USE_LDAP && (!Deno.env.get("LDAP_URL") || !Deno.env.get("LDAP_BASE_DN") || !Deno.env.get("LDAP_DOMAIN_SUFFIX")|| !Deno.env.get("LDAP_ALLOWED_GROUPS"))){
    ctx.response.status = 500;
    console.log("LDAP is enabled but LDAP_URL, LDAP_BASE_DN, or LDAP_DOMAIN_SUFFIX is not set");
    ctx.response.body = { message: "LDAP is enabled but LDAP_URL, LDAP_BASE_DN, LDAP_DOMAIN_SUFFIX or LDAP_ALLOWED_GROUPS is not set" };
    return;
  }

  // Load ldapConfig dynamically inside signIn
  const ldapConfig = {
    url: Deno.env.get("LDAP_URL") || "ldap://localhost", 
    baseDN: Deno.env.get("LDAP_BASE_DN") || "DC=example,DC=com",
    domainSuffix: Deno.env.get("LDAP_DOMAIN_SUFFIX") || "@example.com",
    allowedGroups: Deno.env.get("LDAP_ALLOWED_GROUPS")?.split(",") || [],
  };

  console.log("Using LDAP authentication:", USE_LDAP);
  console.log("LDAP Config Loaded:", ldapConfig);

  const body = ctx.request.body({ type: "json" });
  const { username, password } = await body.value;

  if (!username || !password) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Username and password are required" };
    return;
  }

  let authenticated = false;

  if (USE_LDAP) {
    try {
      authenticated = await ldapAuthenticate(username, password, ldapConfig);
    } catch {
      console.log(`Trying local authentication`);
      authenticated = username === "admin" && password === "password";
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
