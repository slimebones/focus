import {
  BusUtils,
  CreateDocReq, GetDocsReq, Query, UpdDocReq } from "@almazrpe/ngx-kit";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IdeaUdto } from "./models";

@Injectable({
  providedIn: "root"
})
export class IdeaService
{
  public readonly COLLECTION = "ideaDoc";

  public getMany$(sq: Query = {}): Observable<IdeaUdto[]>
  {
    return BusUtils.pubGetDocsReq$(new GetDocsReq({
      collection: this.COLLECTION,
      searchQuery: sq
    }));
  }

  public create$(text: string): Observable<IdeaUdto>
  {
    return BusUtils.pubCreateDocReq$(new CreateDocReq({
      collection: this.COLLECTION,
      createQuery: {
        text: text
      }
    }));
  }

  public process$(sid: string): Observable<IdeaUdto>
  {
    return BusUtils.pubUpdDocReq$(new UpdDocReq({
      collection: this.COLLECTION,
      searchQuery: {sid: sid},
      updQuery: {
        $set: {
          is_processed: true,
          last_process_time: Date.now() / 1000
        }
      }
    }));
  }
}
