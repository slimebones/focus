import { Component, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { TimingService } from "./timing.service";
import { TimerGroupUdto, TimerUdto } from "./models";

@Component({
  selector: "app-timing",
  templateUrl: "./timing.component.html",
  styles: [
  ]
})
export class TimingComponent implements OnInit
{
  public isEnabled: boolean = true;
  public toggleBtnSelectors$: BehaviorSubject<string[]> =
    new BehaviorSubject(["filter-white"]);

  public groupToTimers: Map<TimerGroupUdto, TimerUdto[]> = new Map();

  public constructor(
    private timingSv: TimingService
  )
  {
  }

  public ngOnInit(): void
  {
  }

  public toggleTiming()
  {
    this.isEnabled = !this.isEnabled;
    this.isEnabled
      ? this.toggleBtnSelectors$.next(["filter-gray"])
      : this.toggleBtnSelectors$.next(["filter-white"]);
  }
}
