import { code } from "./fcode";

export abstract class Err extends Error
{
}

@code("not-found-err")
export class NotFoundErr extends Err
{
  public constructor(s: any)
  {
    super(`${s} is not found`);
  }
}

@code("already-processed-err")
export class AlreadyProcessedErr extends Err
{
  public constructor(s: any)
  {
    super(`${s} is already processed`);
  }
}

@code("unsupported-err")
export class UnsupportedErr extends Err
{
  public constructor(s: any)
  {
    super(`${s} is unsupported`);
  }
}

@code("inp-err")
export class InpErr extends Err
{
  public constructor(s: any)
  {
    super(`${s} is invalid input`);
  }
}

/**
  * Some obj is locked to do read/write on it.
  */
@code("lock-err")
export class LockErr extends Err
{
  public constructor(s: any)
  {
    super(`${s} is locked`);
  }
}

