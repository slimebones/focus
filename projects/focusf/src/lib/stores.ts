import { StartStopNotifier, Writable, writable } from "svelte/store";

export function localStorageWritable(
  storageKey: string,
  val: string | null = null,
  start: StartStopNotifier<string> | undefined = undefined
): Writable<string>
{
  if (val === null)
  {
    val = localStorage.getItem(storageKey) ?? "";
  }
  localStorage.setItem(storageKey, val);

  const orig = writable<string>(val);

  function setCustom(val: string): void
  {
    localStorage.setItem(storageKey, val);
    orig.set(val);
  }

  function updCustom(fn: (v: string) => string)
  {
    setCustom(fn(val as string));
  }

  return {
    subscribe: orig.subscribe,
    set: setCustom,
    update: updCustom
  };
}
