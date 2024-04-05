import { Component, OnInit } from "@angular/core";
import { ProjectUdto } from "src/app/models";
import { ProjectService } from "../project.service";
import { FormControl, FormGroup } from "@angular/forms";
import { InputType, StorageService, asrt } from "@almazrpe/ngx-kit";

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
    private projectSv: ProjectService,
    private storageSv: StorageService)
  {}

  public ngOnInit(): void
  {
    this.projectSv.getMany$().subscribe({next: val =>
      {
        this.projects = val;

        // select first project if nothing selected - later might want to
        // toggle this via the settings
        if (
          this.projects.length > 0
          && this.projectSv.getCurrentProjectSid() === null)
        {
          this.selectProject(this.projects[0]);
        }
      }});
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
    this.projectSv.setCurrentProject(project);
  }

  public getProjectSelectors(project: ProjectUdto): string[]
  {
    if (this.projectSv.getCurrentProjectSid() === project.sid)
    {
      return ["underline"];
    }
    return [];
  }

  public del(project: ProjectUdto): void
  {
    this.projectSv.del$(project.sid).subscribe({
      next: _ =>
      {
        const deldIndex = this.projects.findIndex(v => v.sid == project.sid);
        if (this.projectSv.getCurrentProjectSid() === project.sid)
        {
          this.projectSv.setCurrentProject(null);
        }
        if (deldIndex === undefined)
        {
          asrt.fail();
          throw new Error();
        }
        this.projects.splice(deldIndex, 1);
      }});
  }
}
