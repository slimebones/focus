import { Component, OnInit } from "@angular/core";
import { ProjectUdto } from "src/app/models";
import { ProjectService } from "../project.service";
import { FormControl, FormGroup } from "@angular/forms";
import { InputType } from "@almazrpe/ngx-kit";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styles: [
  ]
})
export class ProjectsComponent implements OnInit
{
  public InputType = InputType;

  public projects: ProjectUdto[] = [];
  public projectCreateForm: FormGroup;
  private unsubs: (() => void)[];

  public constructor(
    private projectSv: ProjectService)
  {}

  public ngOnInit(): void
  {
    this.projectSv.getMany$().subscribe({next: val => this.projects = val});
    this.projectCreateForm = new FormGroup({
      name: new FormControl("")
    });
  }

  public ngOnDestroy(): void
  {
    for (const unsub of this.unsubs)
    {
      unsub();
    }
  }

  public onKeydownEnter(): void
  {
    this.onProjectCreateSubmit();
  }

  private getDistilledProjectNameInput(): string
  {
    return this.projectCreateForm.value.name.trim();
  }

  public onProjectCreateSubmit(): void
  {
    const name = this.getDistilledProjectNameInput();
    if (name === "")
    {
      return;
    }
    this.projectSv.create$({name: name}).subscribe({
      next: val => this.projects.splice(0, 0, val)});
    this.projectCreateForm.setValue({name: ""});
  }

  public selectProject(project: ProjectUdto): void
  {
    this.projectSv.currentProject$.next(project);
  }

  public getProjectSelectors(project: ProjectUdto): string[]
  {
    if (this.projectSv.currentProject$.value?.sid === project.sid)
    {
      return ["underline"];
    }
    return [];
  }

  public delProject(project: ProjectUdto): void
  {
    this.projectSv.del$(project.sid).subscribe({
      next: _ =>
      {
        const deldProject = this.projects.indexOf(project);
        if (this.projectSv.currentProject$.value?.sid === project.sid)
        {
          this.projectSv.currentProject$.next(null);
        }
        this.projects.splice(deldProject, 1);
      }});
  }
}
