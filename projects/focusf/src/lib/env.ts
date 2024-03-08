import { browser, dev } from "$app/environment";
import { log } from "$lib/jskit/log";

const devHost = import.meta.env.VITE_SERVER_HOST_DEV ?? "localhost";
const devPort = Number.parseInt(
  import.meta.env.VITE_SERVER_PORT_DEV ?? "9050"
);
const prodHost = import.meta.env.VITE_SERVER_HOST_PROD ?? "localhost";
const prodPort = Number.parseInt(
  import.meta.env.VITE_SERVER_PORT_PROD ?? "9050"
);

let devEnv: {[key: string]: any} = {
  serverHost: devHost,
  serverPort: devPort,
};
let prodEnv: {[key: string]: any} = {
  serverHost: prodHost,
  serverPort: prodPort,
};

let env: {[key: string]: any} = prodEnv;
if (dev)
{
  env = devEnv;
}

if (browser)
{
  const altHost = localStorage.getItem("altHost");
  const altPort = localStorage.getItem("altPort");
  if (altHost !== null)
  {
    env.serverHost = altHost;
  }
  if (altPort !== null)
  {
    env.serverPort = Number.parseInt(altPort);
  }
}

log.info(`installed env: ${JSON.stringify(env)}`);

export default env;
