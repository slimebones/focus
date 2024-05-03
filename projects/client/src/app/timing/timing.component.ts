import { Component } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-timing",
  templateUrl: "./timing.component.html",
  styles: [
  ]
})
export class TimingComponent
{
  public isEnabled: boolean = false;
  public toggleBtnSelectors$: BehaviorSubject<string[]> =
    new BehaviorSubject<string[]>(["filter-white"]);

  public toggleTiming()
  {
    this.isEnabled = !this.isEnabled;
    this.isEnabled
      ? this.toggleBtnSelectors$.next(["filter-gray"])
      : this.toggleBtnSelectors$.next(["filter-white"]);
  }
}
