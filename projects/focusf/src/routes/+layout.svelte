<script>
	import "../main.css";
	import "../tailwind.css";
    import { ClientBus } from "$lib/rxcat";
    import { onMount } from "svelte";

    onMount(() =>
    {
        ClientBus.ie.init(
            "localhost",
            3001
        );
    });
</script>

<div class="bg-c60-bg h-screen w-screen">
	<main>
		<slot />
	</main>
</div>

