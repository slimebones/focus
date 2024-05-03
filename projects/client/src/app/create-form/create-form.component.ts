import { InputType } from "@almazrpe/ngx-kit";
import {
  Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "app-create-form",
  templateUrl: "./create-form.component.html",
  styles: [
  ]
})
export class CreateFormComponent implements OnInit
{
  @Input()
  public onCreate: (val: string) => void = _ => {};

  @ViewChild("inp", {read: ElementRef})
  private inp: ElementRef;

  public InputType = InputType;
  public form: FormGroup;

  public ngOnInit(): void
  {
    this.form = new FormGroup({
      name: new FormControl("")
    });
  }

  public onSubmit()
  {
    this.inp.nativeElement.querySelector("input").focus();
    const name = this.form.value.name.trim();
    if (name === "")
    {
      return;
    }
    this.onCreate(name);
  }

  public onKeydownEnter()
  {
    this.onSubmit();
  }
}
