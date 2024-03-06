<script lang="ts">
	import "../main.css";
	import "../tailwind.css";
    import { ClientBus } from "$lib/rxcat";
    import { onMount } from "svelte";
  import env from "$lib/env";

    // clear console between HMR
    if (import.meta.hot)
    {
      import.meta.hot.on(
        "vite:beforeUpdate",
        () => console.clear()
      );
    }

    onMount(() =>
    {
        ClientBus.ie.init(
          env.serverHost,
          env.serverPort
        );
    });
</script>

<div class="bg-c60-bg h-screen w-screen text-c60-fg">
	<main>
		<slot />
	</main>
</div>

