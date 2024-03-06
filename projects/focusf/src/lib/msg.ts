import { code } from "./jskit/fcode";
import { Evt } from "./rxcat";

@code("evt.keydown.enter")
export class EnterKeydownEvt extends Evt
{
  public nativeEvt: any;

  public constructor(
    args: any
  )
  {
    super(args);
    this.nativeEvt = args.nativeEvt;
  }
}
