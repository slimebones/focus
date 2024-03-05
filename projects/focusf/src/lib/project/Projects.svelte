<script lang="ts">
	import { ClientBus } from "$lib/rxcat";
  import {
      CreateDocReq, DelDocReq, GetDocsReq, OkEvt

  } from "$lib/rxcat/msg";
  import { type ProjectUdto } from "$lib/project/models";
  import { onDestroy } from "svelte";

  const unsubs: (() => void)[] = [];
  let nameInp: string = "";

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

  function create(createq: any)
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

  function del(sid: string)
  {
    const unsub = ClientBus.ie.pubst<OkEvt>(
      new DelDocReq({
        collection: "projectDoc",
        searchQuery: {
          sid: sid
        }
      })
    ).subscribe(ok =>
    {
      if (ok !== undefined)
      {
        projects.splice(projects.findIndex(project => project.sid == sid), 1);
        projects = projects;
      }
    });
  }

  function delLast()
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

<div
  class="
    flex flex-col gap-4 justify-center items-center text-c30-fg
    bg-c30-bg p-4 rounded
  "
>
  {#if projects.length > 0}
    {#each projects as project}
      <div class="flex flex-row justify-center items-center gap-4">
        <span>{project.name}</span>
        <button
          class="bg-red-500 rounded p-1 hover:bg-red-300 text-sm"
          on:click={() => del(project.sid)}
        >
          <span>X</span>
        </button>
      </div>
    {/each}
  {/if}

  <div class="flex flex-row items-center justify-center gap-2">
    <input class="text-black" bind:value={nameInp}/>
    <button
      class="bg-green-500 rounded p-2 hover:bg-green-300 text-xl"
      on:click={(() => create({ name: nameInp }))}
    >
      new
    </button>
  </div>
</div>
