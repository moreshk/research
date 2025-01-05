import redis from "./redis";

type withCahcePropType<T> = {
  key: string;
  ex: number;
  fn: () => Promise<T>;
};

export default async function withCache<T>({
  key,
  ex,
  fn,
}: withCahcePropType<T>): Promise<T> {
  let value: T | null = JSON.parse((await redis.get(key)) || "null");

  if (!value) {
    const result = await fn();
    if (result) {
      await redis.set(key, JSON.stringify(result), "EX", ex);
    }
    value = result;
  }

  return value! as T;
}
