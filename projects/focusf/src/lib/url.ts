import env from "./env";

export function constructHttp(host: string, port: number): string
{
  return "http://" + host + ":" + port;
}

export function constructEnvHttp(): string
{
  return constructHttp(env.serverHost, env.serverPort);
}

export let ServerShareUrl = constructEnvHttp() + "/share";
