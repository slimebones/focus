<script lang="ts">
	import { onDestroy } from "svelte";
  import { MongoUtils } from "$lib/mongo/utils";
  import { type TaskUdto } from "./models";
  import { type ProjectUdto } from "$lib/project/models";
  import { selectedProjectSid } from "$lib/project/stores";
  import { complete, create } from "./utils";
  import circleImg from "$lib/assets/circle-outline.svg";
  import { remove } from "$lib/jskit/arr";

const unsubs: (() => void)[] = [];
  const Collection: string = "taskDoc";
  let tasks: TaskUdto[] = [];
  let nameInp: string = "";

  unsubs.push(selectedProjectSid.subscribe(val_selectedProjectSid =>
  {
    if (val_selectedProjectSid === "")
    {
      return;
    }
    MongoUtils.get<ProjectUdto>(
      "projectDoc",
      {sid: val_selectedProjectSid},
      unsubs,
      val_project => MongoUtils.getMany<TaskUdto>(
        Collection,
        {
          sid: {
            "$in": val_project.taskSids
          }
        },
        unsubs,
        val_tasks => tasks = val_tasks.filter(t => !t.isCompleted)
      ),
      () =>
      {
        // no project found for the selected project sid => invalidate it
        selectedProjectSid.set("");
      }
    );
  }));

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
      <div class="flex flex-row justify-center items-center">
        <button
          class="mr-2"
          on:click={() => complete(
            task.sid,
            unsubs,
            t => tasks = remove(val => val.sid === t.sid, tasks)
          )}
        >
          <img
            class="h-6 filter-white"
            src={circleImg}
            alt="O"
          />
        </button>
        <span class="mr-6">{task.text}</span>
        <button
          class="bg-red-500 rounded p-0.5 hover:bg-red-300 text-sm"
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
      on:click={(() =>
      {
        if (nameInp.trim() === "")
        {
          return;
        }
        create(
          { text: nameInp.trim() },
          $selectedProjectSid,
          unsubs,
          val => tasks = [...tasks, val]
        );
      })}
    >
      +
    </button>
  </div>
</div>
