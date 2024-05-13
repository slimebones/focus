import { Injectable } from "@angular/core";
import { Observable, map, switchMap } from "rxjs";
import { TimerGroupUdto, TimerUdto } from "./models";
import {
  BusUtils, CreateDocReq, GetDocsReq, UpdDocReq } from "@almazrpe/ngx-kit";

@Injectable({
  providedIn: "root"
})
export class TimingService
{
  private readonly TIMER_COLLECTION = "timer_udto";
  private readonly GROUP_COLLECTION = "timer_group_udto";

  public constructor() { }

  public getGroups$(searchq: any = {}): Observable<TimerGroupUdto[]>
  {
    return BusUtils.pubGetDocsReq$(new GetDocsReq({
      collection: this.GROUP_COLLECTION,
      searchQuery: searchq
    }));
  }

  public getTimers$(searchq: any): Observable<TimerUdto[]>
  {
    return BusUtils.pubGetDocsReq$(new GetDocsReq({
      collection: this.TIMER_COLLECTION,
      searchQuery: searchq
    }));
  }

  public createGroup$(name: string): Observable<TimerGroupUdto>
  {
    return BusUtils.pubCreateDocReq$(new CreateDocReq({
      collection: this.GROUP_COLLECTION,
      createQuery: {
        name: name
      }
    }));
  }

  public createTimerForGroup$(
    duration: number, groupSid: string): Observable<TimerUdto>
  {
    return BusUtils.pubCreateDocReq$<TimerUdto>(new CreateDocReq({
      collection: this.TIMER_COLLECTION,
      createQuery: {
        total_duration: duration
      }
    })).pipe(switchMap(timer_udto =>
    {
      return BusUtils.pubUpdDocReq$(new UpdDocReq({
        collection: this.GROUP_COLLECTION,
        searchQuery: {
          sid: groupSid
        },
        updQuery: {
          "$push": {
            "timer_sids": timer_udto.sid
          }
        }
      })).pipe(map(_ => {return timer_udto;}));
    }));
  }
}
