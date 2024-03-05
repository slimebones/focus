<script lang="ts">
  import Projects from "$lib/project/Projects.svelte";
  import Tasks from "$lib/task/Tasks.svelte";

</script>

<svelte:head>
	<title>focus</title>
</svelte:head>

<div class="text-2xl flex flex-row gap-4">
  <Projects />
  <Tasks />
</div>
