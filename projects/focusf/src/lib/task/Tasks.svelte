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


