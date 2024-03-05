<script lang="ts">
  import Projects from "$lib/project/Projects.svelte";
  import Tasks from "$lib/task/Tasks.svelte";

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="text-2xl flex flex-row">
  <Projects />
  <Tasks />
</div>
