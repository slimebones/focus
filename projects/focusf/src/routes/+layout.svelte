<script lang="ts">
	import "../main.css";
	import "../tailwind.css";
    import { ClientBus } from "$lib/rxcat";
    import { onMount } from "svelte";
    import { GetDocsReq } from "$lib/rxcat/msg";

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

    const st_gotDocs = ClientBus.ie.st_pub(new GetDocsReq({
        collection: "projectDoc",
        searchQuery: {}
    }));
</script>

<div class="bg-c60-bg h-screen w-screen text-c60-fg">
	<main>
        {JSON.stringify($st_gotDocs)}
		<slot />
	</main>
</div>

