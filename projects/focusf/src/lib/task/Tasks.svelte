<script lang="ts">
	import { onDestroy } from "svelte";
  import { MongoUtils } from "$lib/mongo/utils";
  import { type TaskUdto } from "./models";

  const unsubs: (() => void)[] = [];
  const Collection: string = "taskDoc";
  let tasks: TaskUdto[] = [];
  let nameInp: string = "";

  MongoUtils.getMany<TaskUdto>(Collection, {}, unsubs, val =>
    tasks = [...tasks, ...val]
  );

  onDestroy(() => unsubs.map(fn => fn()));
</script>

<div
  class="
    flex flex-col gap-4 justify-center items-center text-c30-fg
    bg-c30-bg p-4 rounded
  "
>
  {#if tasks.length > 0}
    {#each tasks as task}
      <div class="flex flex-row justify-center items-center gap-4">
        <span>{task.text}</span>
        <button
          class="bg-red-500 rounded p-2 hover:bg-red-300 text-sm"
          on:click={() => MongoUtils.delBySid(
            Collection, task.sid, unsubs, () =>
            {
              tasks.splice(
                tasks.findIndex(v => v.sid == task.sid),
                1
              );
              tasks = tasks;
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
      on:click={(() => MongoUtils.create(
        Collection,
        { name: nameInp },
        unsubs,
        val => tasks = [...tasks, val]
      ))}
    >
      +
    </button>
  </div>
</div>
