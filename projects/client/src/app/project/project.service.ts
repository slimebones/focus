import { Injectable } from "@angular/core";
import { ProjectCreate, ProjectUdto } from "../models";
import {
  BusUtils, CreateDocReq, DelDocReq, GetDocsReq } from "@almazrpe/ngx-kit";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ProjectService
{
  public currentProject$ = new BehaviorSubject<ProjectUdto | null>(null);

  private readonly Collection = "projectDoc";

  public getMany$(searchq: object): Observable<ProjectUdto[]>
  {
    return BusUtils.pubGetDocsReq$(new GetDocsReq({
      collection: this.Collection,
      searchQuery: searchq
    }));
  }

  public create$(data: ProjectCreate): Observable<ProjectUdto>
  {
    return BusUtils.pubCreateDocReq$(new CreateDocReq({
      collection: this.Collection,
      createQuery: {
        name: data.name
      }
    }));
  }

  public del$(sid: string): Observable<void>
  {
    return BusUtils.pubDelDocReq$(new DelDocReq({
      collection: this.Collection,
      searchQuery: {
        sid: sid
      }
    }));
  }
}
