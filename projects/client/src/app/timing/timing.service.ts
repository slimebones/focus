import { Injectable } from "@angular/core";
import { Observable, map, switchMap } from "rxjs";
import {
  ResetTimerReq,
  StartTimerReq, StopTimerReq, TimerGroupUdto, TimerUdto } from "./models";
import {
  BusUtils,
  ClientBus,
  CreateDocReq,
  DelDocReq,
  GetDocsReq,
  GotDocUdtoEvt,
  UpdDocReq } from "@almazrpe/ngx-kit";

@Injectable({
  providedIn: "root"
})
export class TimingService
{
  private readonly TIMER_COLLECTION = "timer_doc";
  private readonly GROUP_COLLECTION = "timer_group_doc";

  public constructor() { }

  public getGroupsToTimers$(): Observable<Map<TimerGroupUdto, TimerUdto[]>>
  {
    return this.getGroups$().pipe(switchMap(groups =>
    {
      return this
        .getTimers$({sid: {$in: groups.map(group => group.sid)}}).pipe(
          map(timers =>
          {
            const _map: Map<TimerGroupUdto, TimerUdto[]> = new Map();
            for (let group of groups)
            {
              let groupTimers: TimerUdto[] = [];
              _map.set(group, groupTimers);
              for (let timer of timers)
              {
                if (group.timer_sids.includes(timer.sid))
                {
                  groupTimers.push(timer);
                }
              }
            }
            return _map;
          })
        );
    }));
  }

  public getGroups$(searchq: any = {}): Observable<TimerGroupUdto[]>
  {
    return BusUtils.pubGetDocsReq$(new GetDocsReq({
      collection: this.GROUP_COLLECTION,
      searchQuery: searchq
    }));
  }

  public getTimers$(searchq: any = {}): Observable<TimerUdto[]>
  {
    return BusUtils.pubGetDocsReq$(new GetDocsReq({
      collection: this.TIMER_COLLECTION,
      searchQuery: searchq
    }));
  }

  public startTimer(sid: string): Observable<TimerUdto>
  {
    return ClientBus.ie.pub$(new StartTimerReq({sid: sid})).pipe(map(rae =>
    {
      return (rae.evt as GotDocUdtoEvt<TimerUdto>).udto;
    }));
  }

  public stopTimer(sid: string): Observable<TimerUdto>
  {
    return ClientBus.ie.pub$(new StopTimerReq({sid: sid})).pipe(map(rae =>
    {
      return (rae.evt as GotDocUdtoEvt<TimerUdto>).udto;
    }));
  }

  public setTotalDuration$(
    sid: string, duration: number): Observable<TimerUdto>
  {
    return BusUtils.pubUpdDocReq$(new UpdDocReq({
      collection: this.TIMER_COLLECTION,
      searchQuery: {sid: sid},
      updQuery: {
        "$set": {"total_duration": duration}
      }
    }));
  }

  public resetTimer$(sid: string): Observable<TimerUdto>
  {
    return ClientBus.ie.pub$<ResetTimerReq, GotDocUdtoEvt<TimerUdto>>(
        new ResetTimerReq(sid))
      .pipe(map(rae => rae.evt.udto));
  }

  public createTimer$(duration: number): Observable<TimerUdto>
  {
    return BusUtils.pubCreateDocReq$<TimerUdto>(new CreateDocReq({
      collection: this.TIMER_COLLECTION,
      createQuery: {
        total_duration: duration
      }
    }));
  }

  public delTimer$(sid: string): Observable<void>
  {
    return BusUtils.pubDelDocReq$(new DelDocReq({
      collection: this.TIMER_COLLECTION,
      searchQuery: {sid: sid}
    }));
  }

  public delGroup$(sid: string): Observable<void>
  {
    // all timers for the group will be automatically deleted
    return BusUtils.pubDelDocReq$(new DelDocReq({
      collection: this.GROUP_COLLECTION,
      searchQuery: {sid: sid}
    }));
  }
}
