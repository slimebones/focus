import { Query } from "$lib/jskit/mongo";
import { MongoUtils } from "$lib/mongo/utils";
import { ServerShareUrl } from "$lib/url";
import { TaskUdto } from "./models";

const Collection: string = "taskDoc";

export function create(
  createq: Query,
  projectSid: string,
  unsubs: (() => void)[],
  onval: (val: TaskUdto) => void
)
{
  if (projectSid === "")
  {
    return;
  }

  MongoUtils.create(
    Collection,
    createq,
    unsubs,
    val =>
    {
      MongoUtils.upd(
        "projectDoc",
        {sid: projectSid},
        {"$push": {taskSids: val.sid}},
        unsubs
      );
      onval(val);
    }
  );
}

export function complete(
  sid: string,
  unsubs: (() => void)[],
  onval?: (val: TaskUdto) => void
)
{
  MongoUtils.updBySid(
    Collection, sid, {"$set": {isCompleted: true}}, unsubs, onval
  );
  const clickAudio = new Audio(ServerShareUrl + "/click.wav");
  clickAudio.play();
}
