import { log } from "./log";

export function remove<T>(
  predicate: (val: T, index: number, arr: T[]) => boolean, arr: T[]
): T[]
{
  const index = arr.findIndex(predicate);
  if (index < 0)
  {
    log.err(
      "failed to remove item"
      + ` from arr ${JSON.stringify(arr)}`
      + " => ret as it is"
    );
    return arr;
  }
  arr.splice(index, 1);
  return arr;
}
