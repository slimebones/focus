import { Injectable } from "@angular/core";
import { ProjectCreate, ProjectUdto, TaskUdto } from "../models";
import {
  BusUtils,
  CreateDocReq,
  DelDocReq,
  GetDocsReq,
  StorageService,
  UpdDocReq,
  log } from "@almazrpe/ngx-kit";
import { Observable, map } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ProjectService
{
  public currentProject$: Observable<ProjectUdto | null>;

  private readonly Collection = "projectDoc";

  public constructor(
    private storageSv: StorageService
  )
  {
  }

  public init()
  {
    this.currentProject$ = this.storageSv.addItem$<string | null>(
        "local", "current_project", null)
      .pipe(map(projectStr => this.parseProjectStr(projectStr)));
  }

  public getCurrentProject(): ProjectUdto | null
  {
    return this.parseProjectStr(this.storageSv.getItem(
      "local", "current_project", null));
  }

  private parseProjectStr(projectStr: string | null): ProjectUdto | null
  {
    if (projectStr == null)
    {
      return null;
    }
    return JSON.parse(projectStr) as ProjectUdto;
  }

  public setCurrentProject(project: ProjectUdto | null)
  {
    log.warn("set current project");
    this.storageSv.setItemVal(
      "local", "current_project", JSON.stringify(project));
  }

  public getMany$(searchq: object = {}): Observable<ProjectUdto[]>
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

  public attachTask$(
    project: ProjectUdto, task: TaskUdto): Observable<ProjectUdto>
  {
    return BusUtils.pubUpdDocReq$(new UpdDocReq({
      collection: this.Collection,
      searchQuery: {
        sid: project.sid
      },
      updQuery: {
        "$push": {
          taskSids: task.sid
        }
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
