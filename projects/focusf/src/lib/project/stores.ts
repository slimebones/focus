import { localStorageWritable } from "$lib/stores";
import { Writable } from "svelte/store";

export let selectedProjectSid: Writable<string> = localStorageWritable(
  "selectedProjectSid"
);
