import { NotFoundErr } from "./err";

export abstract class ArrUtils
{
  public static getOnlyFirstOrErr<T>(arr: T[]): T
  {
    if (arr.length == 0)
    {
      throw new NotFoundErr("arr contents");
    }
    if (arr.length > 1)
    {
      throw new Error(
        "arr "
        + arr.map(v => JSON.stringify(v)).join(", ")
        + " of length more than 1 given"
      );
    }
    return arr[0];
  }
}
