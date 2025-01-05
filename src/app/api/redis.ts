import Redis from "ioredis";

const connections: { [name: string]: Redis } = {};
const raidsDetails = {
  host: process.env.REDIS_HOST || "0.0.0.0",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || "",
};
export function getPrefixedClient(keyPrefix: string) {
  if (connections[keyPrefix]) return connections[keyPrefix];
  const client = new Redis({
    ...raidsDetails,
    enableOfflineQueue: false,
    keyPrefix,
  });

  client.on("error", (err) => {
    console.log({ msg: "redis error", err, connection: keyPrefix });
  });

  client.once("connect", (...args) => {
    console.log("connected");
  });

  connections[keyPrefix] = client;
  return client;
}

export default getPrefixedClient("server:");
