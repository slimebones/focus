<script lang="ts">
	import { ClientBus } from "$lib/rxcat";
  import {
      CreateDocReq, DelDocReq, GetDocsReq, OkEvt

  } from "$lib/rxcat/msg";
  import { type ProjectUdto } from "$lib/project/models";
  import { onDestroy } from "svelte";

  const unsubs: (() => void)[] = [];

  let projects: ProjectUdto[] = [];
  unsubs.push(ClientBus.ie.pubstf<ProjectUdto[]>(
    "udtos",
    new GetDocsReq({
        collection: "projectDoc",
        searchQuery: {}
    })
  ).subscribe(udtos =>
  {
    if (udtos !== undefined)
    {
      projects = [...projects, ...udtos];
    }
  }));

  function createProject(createq: any)
  {
    unsubs.push(
      ClientBus.ie.pubstf<ProjectUdto>(
        "udto",
        new CreateDocReq({
            collection: "projectDoc",
            createQuery: createq
        })
      ).subscribe(udto =>
      {
          if (udto !== undefined)
          {
            projects = [...projects, udto];
          }
      })
    );
  }

  function delLastProject()
  {
    const lastProjectSid = projects[projects.length - 1].sid;
    unsubs.push(
      ClientBus.ie.pubst<OkEvt>(
        new DelDocReq({
          collection: "projectDoc",
          searchQuery: {
            sid: lastProjectSid
          }
        })
      ).subscribe(ok =>
      {
        if (ok !== undefined)
        {
          projects = projects.slice(0, projects.length - 1);
        }
      })
    );
  }

  onDestroy(() => unsubs.map(fn => fn()));
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="flex flex-row gap-4 justify-start items-center">
  {#if projects.length > 0}
    {#each projects as project}
      <div>
        {project.name}
      </div>
    {/each}
  {/if}

  <button
    class="bg-green-500 rounded p-2 hover:bg-green-300"
    on:click={(() => createProject({ name: "hello" }))}
  >
    New Project
  </button>
  <button
    class="bg-red-500 rounded p-2 hover:bg-red-300"
    on:click={(() => delLastProject())}
  >
    Delete Project
  </button>
</div>
