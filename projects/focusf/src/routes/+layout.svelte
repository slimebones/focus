<script>
	import "../main.css";
	import "../tailwind.css";
    import { ClientBus } from "$lib/rxcat";
    import { onMount } from "svelte";

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
            "localhost",
            9051
        );
    });
</script>

<div class="bg-c60-bg h-screen w-screen">
	<main>
		<slot />
	</main>
</div>

