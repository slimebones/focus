import {
  Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Observable, Subscription, map, of, switchMap } from "rxjs";
import { TaskUdto } from "src/app/models";
import { TaskService } from "../task.service";
import { FormControl, FormGroup } from "@angular/forms";
import {
  ConnService, InputType, StorageService, asrt } from "@almazrpe/ngx-kit";
import { ProjectService } from "src/app/project/project.service";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  styles: [
  ]
})
export class TasksComponent implements OnInit, OnDestroy
{
  @ViewChild("task_create_inp", { read: ElementRef })
  private taskCreateInp: ElementRef;

  public InputType = InputType;
  public tasks: TaskUdto[] = [];
  public createForm: FormGroup;
  public subs: Subscription[] = [];

  public constructor(
    public projectSv: ProjectService,
    private taskSv: TaskService,
    private storageSv: StorageService,
    private connSv: ConnService
  ) {}

  public ngOnInit(): void
  {
    const sub = this.projectSv.currentProject$.pipe(
        switchMap(project =>
          {
            if (project === null || project === undefined)
            {
              return of([]);
            }
            return this.taskSv.getMany$({sid: {"$in": project.task_sids}});
          }))
      .subscribe({
        next: tasks =>
        {
          this.tasks = tasks.filter(val => !val.is_completed);
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

  public onKeydownEnter(evt: Event): void
  {
    this.onCreateSubmit(evt);
  }

  private getDistilledTextInput(): string
  {
    return this.createForm.value.text.trim();
  }

  public onCreateSubmit(event: any): void
  {
    this.taskCreateInp.nativeElement.querySelector("input").focus();
    const text = this.getDistilledTextInput();
    if (text === "")
    {
      return;
    }
    this.taskSv.create$({text: text}).subscribe({
      next: val =>
      {
        this.tasks.splice(0, 0, val);
        const projectSid = this.projectSv.getCurrentProjectSid();
        if (projectSid === null)
        {
          asrt.fail();
          throw new Error();
        }
        this.projectSv.attachTask$(projectSid, val.sid);
        this.createForm.setValue({text: ""});
      }});
  }

  public complete(sid: string)
  {
    return this.taskSv.complete$(sid).pipe(
        map(task =>
          {
            this.tasks.splice(this.tasks.findIndex(t => t.sid == task.sid), 1);
            const clickAudio = new Audio(
              "http://"
              + this.storageSv.getItem("local", "conn_hostport")
              + "/share/click.wav");
            clickAudio.play();
            return task;
          }))
      .subscribe({
        next: task => {}
      });
  }

  public del(task: TaskUdto)
  {
    this.taskSv.del$(task.sid).subscribe({
      next: _ =>
      {
        const deldTaskIndex = this.tasks.findIndex(t => t.sid == task.sid);
        if (deldTaskIndex === undefined)
        {
          asrt.fail();
          throw new Error();
        }
        this.tasks.splice(deldTaskIndex, 1);
      }});
  }
}
