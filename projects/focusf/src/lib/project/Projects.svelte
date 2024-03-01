<script lang="ts">
  import { ClientBus } from "$lib/rxcat";
  import {
      CreateDocReq, GetDocsReq, GotDocUdtoEvt, GotDocUdtosEvt
  } from "$lib/rxcat/msg";
  import { type Readable, derived } from "svelte/store";
  import { type ProjectUdto } from "$lib/project/models";

  const projects: Readable<ProjectUdto[]> = ClientBus.ie.pubstField(
      "udtos",
      new GetDocsReq({
          collection: "projectDoc",
          searchQuery: {}
      })
  );

  function createProject(createq: any): Readable<ProjectUdto>
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
          projects
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
  {#if $projects !== null}
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
