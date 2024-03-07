import { dev } from "$app/environment";

let devEnv: {[key: string]: any} = {
  serverHost: "localhost",
  serverPort: 9051,
};
let prodEnv: {[key: string]: any} = {
  serverHost: "focusb",
  serverPort: 9151,
};

let env: {[key: string]: any} = prodEnv;
if (dev)
{
  env = devEnv;
}

export default env;
