import { localStorageWritable } from "$lib/stores";
import { Writable } from "svelte/store";

let selectedProjectSid: Writable<string> = localStorageWritable(
  "selectedProjectSid"
);
export { selectedProjectSid };
