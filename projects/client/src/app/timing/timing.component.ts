import { Component, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Timer, TimerGroup } from "../models";
import { TimingService } from "./timing.service";

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

  public groupToTimers: Map<TimerGroup, Timer[]> = new Map();

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
