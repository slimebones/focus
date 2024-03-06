<script lang="ts">
	import { type ProjectUdto } from "$lib/project/models";
  import { onDestroy } from "svelte";
  import { selectedProjectSid } from "./stores";
  import { MongoUtils } from "$lib/mongo/utils";

  const unsubs: (() => void)[] = [];
  const Collection: string = "projectDoc";
  let projects: ProjectUdto[] = [];
  let nameInp: string = "";

  MongoUtils.getMany<ProjectUdto>(Collection, {}, unsubs, val =>
    projects = [...projects, ...val]
  );

  onDestroy(() => unsubs.map(fn => fn()));
</script>

<div
  class="
    flex flex-col gap-4 justify-center items-center text-c30-fg
    bg-c30-bg p-4 rounded
  "
>
  {#if projects.length > 0}
    {#each projects as project}
      <div class="flex flex-row justify-center items-center gap-4">
        <button on:click={() => selectedProjectSid.set(project.sid)}>
          <span
            class={
              $selectedProjectSid === project.sid
              ? "underline"
              : "hover:underline"
            }
          >
            {project.name}
          </span>
        </button>
        <button
          class="bg-red-500 rounded p-0.5 hover:bg-red-300 text-sm"
          on:click={() => MongoUtils.delBySid(
            Collection, project.sid, unsubs, () =>
            {
              projects.splice(
                projects.findIndex(v => v.sid == project.sid),
                1
              );
              projects = projects;
            }
          )}
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
      on:click={(() => nameInp.trim() !== ""
        ? MongoUtils.create(
          Collection,
          { name: nameInp },
          unsubs,
          val => projects = [...projects, val]
        )
        : undefined
      )}
    >
      new
    </button>
  </div>
</div>
