<script lang="ts">
	import {EnterKeydownEvt} from "$lib/msg";
	import "../main.css";
	import "../tailwind.css";
  import { onDestroy, onMount } from "svelte";
  import env from "$lib/env";
  import * as btnTracker from "$lib/btn-tracker";
  import { ClientBus } from "@slimebones/jsrxcat";

  // clear console between HMR
  if (import.meta.hot)
  {
    import.meta.hot.on(
      "vite:beforeUpdate",
      () => console.clear()
    );
  }

  function onkeydown(nativeEvt: any)
  {
    switch (nativeEvt.key)
    {
      case "Enter":
        nativeEvt.preventDefault();
        ClientBus.ie.pub(
          new EnterKeydownEvt({ nativeEvt: nativeEvt }),
          undefined,
          {
            isNetSendSkipped: true
          }
        );
        break;
    }
  }

  onMount(() =>
  {
    ClientBus.ie.init(
      env.serverHost,
      env.serverPort
    );
    btnTracker.init();
  });

  onDestroy(() =>
  {
    btnTracker.destroy();
  });
</script>

<svelte:window
  on:keydown={onkeydown}
/>

<div class="bg-c60-bg h-screen w-screen text-c60-fg">
	<main>
		<slot />
	</main>
</div>

