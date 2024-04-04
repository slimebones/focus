import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subscription, map, of, switchMap } from "rxjs";
import { TaskUdto } from "src/app/models";
import { TaskService } from "../task.service";
import { FormControl, FormGroup } from "@angular/forms";
import { InputType, StorageService, asrt, log } from "@almazrpe/ngx-kit";
import { ProjectService } from "src/app/project/project.service";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  styles: [
  ]
})
export class TasksComponent implements OnInit, OnDestroy
{
  public InputType = InputType;
  public tasks: TaskUdto[] = [];
  public createForm: FormGroup;
  public subs: Subscription[] = [];

  public constructor(
    public projectSv: ProjectService,
    private taskSv: TaskService,
    private storageSv: StorageService
  ) {}

  public ngOnInit(): void
  {
    const sub = this.projectSv.currentProject$.pipe(
        switchMap(project =>
          {
            if (project === null)
            {
              return of([]);
            }
            log.warn(project);
            return of([]);
            // return this.taskSv.getMany$({sid: {"$in": project.task_sids}});
          }))
      .subscribe({
        next: tasks =>
        {
          this.tasks = tasks;
        }
      });
    this.subs.push(sub);
    this.createForm = new FormGroup({
      text: new FormControl("")
    });
  }

  public ngOnDestroy(): void
  {
    for (let sub of this.subs)
    {
      sub.unsubscribe();
    }
  }

  public create$(text: string): Observable<TaskUdto>
  {
    return this.taskSv.create$({text: text}).pipe(
      map(task =>
        {
          // add to the top
          this.tasks.splice(0, 0, task);
          return task;
        })
    );
  }

  public onKeydownEnter(): void
  {
    this.onCreateSubmit();
  }

  private getDistilledTextInput(): string
  {
    return this.createForm.value.text.trim();
  }

  public onCreateSubmit(): void
  {
    const text = this.getDistilledTextInput();
    if (text === "")
    {
      return;
    }
    this.taskSv.create$({text: text}).subscribe({
      next: val =>
      {
        this.tasks.splice(0, 0, val);
        const project = this.projectSv.getCurrentProject();
        if (project === null)
        {
          asrt.fail();
          throw new Error();
        }
        this.projectSv.attachTask$(project, val);
        this.createForm.setValue({text: ""});
      }});
  }

  public complete$(sid: string): Observable<TaskUdto>
  {
    return this.taskSv.complete$(sid).pipe(
      map(task =>
        {
          this.tasks.splice(this.tasks.indexOf(task), 1);
          return task;
        })
    );
  }

  public del(task: TaskUdto)
  {
    this.taskSv.del$(task.sid).subscribe({
      next: _ =>
      {
        const deldTask = this.tasks.indexOf(task);
        this.tasks.splice(deldTask, 1);
      }});
  }
}
