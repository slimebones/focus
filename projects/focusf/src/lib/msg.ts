import { code } from "@slimebones/jskit";
import { Evt } from "@slimebones/jsrxcat";

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
