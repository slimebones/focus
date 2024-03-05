import { Query } from "$lib/jskit/mongo";
import { MongoUtils } from "$lib/mongo/utils";
import { TaskUdto } from "./models";

export abstract class TaskSys
{
  public static Collection: string = "taskDoc";

  public static create(
    createq: Query,
    projectSid: string,
    unsubs: (() => void)[],
    onval: (val: TaskUdto) => void
  )
  {
    MongoUtils.create(
      this.Collection,
      createq,
      unsubs,
      val =>
      {
        MongoUtils.upd(
          "projectDoc",
          {sid: projectSid},
          {taskSids: {"$push": val.sid}},
          unsubs
        );
        onval(val);
      }
    );
  }
}
