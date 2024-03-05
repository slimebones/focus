import { browser } from "$app/environment";
import { localStorageWritable } from "$lib/stores";
import { Writable } from "svelte/store";

let selectedProjectSid: Writable<string>;
if (browser)
{
  selectedProjectSid = localStorageWritable(
    "selectedProjectSid"
  );
}
export { selectedProjectSid };
