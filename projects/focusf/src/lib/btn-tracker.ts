import { EnterKeydownEvt } from "./msg";
import { ClientBus } from "@slimebones/jsrxcat";

const unsubs: (() => void)[] = [];
let attachedOnEnter: (evt: EnterKeydownEvt) => void = () => {};

export function init()
{
  unsubs.push(
    ClientBus.ie.sub<EnterKeydownEvt>(EnterKeydownEvt, onEnterKeydown)
  );
}

export function destroy()
{
  for (const unsub of unsubs)
  {
    unsub();
  }
}

export function attachOnEnter(fn: (evt: EnterKeydownEvt) => void)
{
  attachedOnEnter = fn;
}

function onEnterKeydown(evt: EnterKeydownEvt)
{
  attachedOnEnter(evt);
}
