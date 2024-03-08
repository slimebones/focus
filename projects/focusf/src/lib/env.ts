import { browser, dev } from "$app/environment";

let devEnv: {[key: string]: any} = {
  serverHost: "localhost",
  serverPort: 9051,
};
let prodEnv: {[key: string]: any} = {
  serverHost: "localhost",
  serverPort: 9151,
};

let env: {[key: string]: any} = prodEnv;
if (dev)
{
  env = devEnv;
}
if (!browser)
{
  let host: string | undefined = process.env.HQ_EXTERNAL_HOST;

  if (host === undefined || host === "") 
  {
    throw Error("Define environ HQ_EXTERNAL_HOST");
  }

  if (host[host.length - 1] === "/") 
  {
    host = host.slice(0, host.length - 1);
  }

  export const environment: any = {
    production: true,
    cpasbUrl: {
      host: host,
      port: "5010"
    },
    hqaUrl: {
      host: host,
      port: "5015"
    }
  };
}

export default env;
