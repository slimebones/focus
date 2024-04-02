import { Component, OnInit } from "@angular/core";
import { Observable, map, switchMap } from "rxjs";
import { TaskUdto } from "src/app/models";
import { TaskService } from "../task.service";
import { FormControl, FormGroup } from "@angular/forms";
import { InputType, asrt } from "@almazrpe/ngx-kit";
import { ProjectService } from "src/app/project/project.service";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  styles: [
  ]
})
export class TasksComponent implements OnInit
{
  public InputType = InputType;
  public tasks: TaskUdto[] = [];
  public createForm: FormGroup;
  public unsubs: (() => void)[] = [];

  public constructor(
    public projectSv: ProjectService,
    private taskSv: TaskService
  ) {}

  public ngOnInit(): void
  {
    this.projectSv.currentProject$.pipe(
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
          this.tasks = tasks;
        }
      });
    this.createForm = new FormGroup({
      text: new FormControl("")
    });
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
        const project = this.projectSv.currentProject$.value;
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
