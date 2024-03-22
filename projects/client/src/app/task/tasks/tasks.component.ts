import { Component, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, map, switchMap } from "rxjs";
import { TaskUdto } from "src/app/models";
import { ProjectService } from "src/app/project/project.service";
import { TaskService } from "../task.service";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  styles: [
  ]
})
export class TasksComponent implements OnInit
{
  public tasks$ = new BehaviorSubject<TaskUdto[]>([]);
  public unsubs: (() => void)[] = [];

  public constructor(
    private projectSv: ProjectService,
    private taskSv: TaskService
  ) {}

  public ngOnInit(): void
  {
    const sub = this.projectSv.currentProject$.pipe(
        switchMap(project =>
          {
            if (project === null)
            {
              return [];
            }
            return this.taskSv.getMany$({sid: {"$in": project.task_sids}});
          })
      )
      .subscribe({
        next: tasks =>
        {
          this.tasks$.next(tasks);
        }
      });
    this.unsubs.push(sub.unsubscribe);
  }

  public create$(txt: string): Observable<TaskUdto>
  {
    return this.taskSv.create$({txt: txt}).pipe(
      map(task =>
        {
          // add to the top
          this.tasks$.next([task, ...this.tasks$.value]);
          return task;
        })
    );
  }

  public complete$(sid: string): Observable<TaskUdto>
  {
    return this.taskSv.complete$(sid).pipe(
      map(task =>
        {
          this.tasks$.next(this.tasks$.value.filter(t => t.sid !== sid));
          return task;
        })
    );
  }

  public del$(sid: string): Observable<void>
  {
    return this.taskSv.del$(sid).pipe(
      map(_ =>
        {
          this.tasks$.next(this.tasks$.value.filter(t => t.sid !== sid));
        })
    );
  }
}
