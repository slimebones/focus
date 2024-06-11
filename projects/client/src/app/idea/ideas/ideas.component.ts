import { InputType, asrt } from "@almazrpe/ngx-kit";
import {
  Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { IdeaUdto } from "../models";
import { IdeaService } from "../idea.service";

@Component({
  selector: "app-ideas",
  templateUrl: "./ideas.component.html",
  styles: [
  ]
})
export class IdeasComponent implements OnInit, OnDestroy
{
  @ViewChild("create_inp", {read: ElementRef})
  private createInp: ElementRef;
  public InputType = InputType;
  public createForm: FormGroup;
  public ideas: IdeaUdto[] = [];
  public processedIdeas: IdeaUdto[] = [];

  public constructor(private ideaSv: IdeaService) {}

  public ngOnInit(): void
  {
    this.createForm = new FormGroup({
      text: new FormControl("")
    });
    this.ideaSv.getMany$().subscribe({
      next: ideas =>
      {
        for (let idea of ideas)
        {
          idea.is_processed
            ? this.processedIdeas.push(idea)
            : this.ideas.push(idea);
        }
      }
    });
  }

  public ngOnDestroy(): void
  {
  }

  public onCreateSubmit(): void
  {
    this.createInp.nativeElement.querySelector("input").focus();
    const text = this.createForm.value.text.trim();
    if (text === "")
    {
      return;
    }
    this.ideaSv.create$(text).subscribe({
      next: val => this.ideas.splice(0, 0, val)});
    this.createForm.setValue({text: ""});
  }

  public process(idea: IdeaUdto): void
  {
    asrt.run(
      !idea.is_processed, "processed idea shouldn't appear in the main list");
    this.ideaSv.process$(idea.sid).subscribe({
      next: idea =>
      {
        let deld = this.ideas.splice(
          this.ideas.findIndex(t => t.sid == idea.sid), 1);
        asrt.run(deld.length == 1);
        this.processedIdeas.splice(0, 0, deld[0]);
      }
    });
  }

  public onKeydownEnter(): void
  {
    this.onCreateSubmit();
  }
}

