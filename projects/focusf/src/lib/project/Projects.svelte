<script lang="ts">
  import { ClientBus } from "$lib/rxcat";
  import {
      CreateDocReq, GetDocsReq
  } from "$lib/rxcat/msg";
  import { derived, type Readable } from "svelte/store";
  import { type ProjectUdto } from "$lib/project/models";

  const projects = ClientBus.ie.pubstField<ProjectUdto[]>(
    "udtos",
    new GetDocsReq({
        collection: "projectDoc",
        searchQuery: {}
    })
  );

  function createProject(createq: any): Readable<ProjectUdto | undefined>
  {
    return derived(
      ClientBus.ie.pubstField<ProjectUdto>(
        "udto",
        new CreateDocReq({
            collection: "projectDoc",
            createQuery: createq
        })
      ),
      ($udto) =>
      {
        if ($udto !== undefined)
        {
          projects.update(
            val => val === undefined ? [$udto] : [...val, $udto]
          );
        }
        return $udto;
      }
    );
  }
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="flex flex-row gap-4 justify-start items-center">
  {#if $projects !== undefined}
    {#each $projects as project}
      {project.name}
    {/each}
  {/if}

  <button
    class="bg-c10-bg rounded p-2 hover:bg-c10-bg-active"
    on:click={() => createProject({ name: "hello" })}
  >
    New Project
  </button>
</div>
