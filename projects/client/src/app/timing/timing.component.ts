import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  BehaviorSubject, Observable, Subscription, map, of, switchMap } from "rxjs";
import { TimingService } from "./timing.service";
import { TimerUdto } from "./models";

@Component({
  selector: "app-timing",
  templateUrl: "./timing.component.html",
  styles: [
  ]
})
export class TimingComponent implements OnInit, OnDestroy
{
  public currentTimer$: Observable<TimerUdto>;

  private readonly PLAY_BTN_IMG_URL = "assets/play.png";
  private readonly PAUSE_BTN_IMG_URL = "assets/pause.png";
  public togglePlayBtnImgUrl: string;

  public isEnabled: boolean = true;
  public toggleBtnSelectors$: BehaviorSubject<string[]> =
    new BehaviorSubject(["filter-white"]);

  private subs: Subscription[] = [];
  private readonly DEFAULT_TIMER_DURATION = 60 * 30;

  public readonly BASIC_GROUP_SELECTOR_CLASSES: string[] = [
    "border", "rounded"
  ];
  public readonly SELECTED_GROUP_SELECTOR_CLASSES: string[] = [
    ...this.BASIC_GROUP_SELECTOR_CLASSES,
    "bg-c10-bg"
  ];
  public readonly UNSELECTED_GROUP_SELECTOR_CLASSES: string[] = [
    ...this.BASIC_GROUP_SELECTOR_CLASSES,
    "hover:bg-c10-bg-active"
  ];

  public constructor(
    private timingSv: TimingService
  )
  {
  }

  public ngOnInit(): void
  {
    this.currentTimer$ = this.timingSv.getTimers$().pipe(
      switchMap(timers =>
      {
        if (timers.length == 0)
        {
          return this.timingSv.createTimer$(this.DEFAULT_TIMER_DURATION);
        }
        return of(timers[0]);
      }),
      map(timer =>
      {
        switch (timer.status)
        {
          case "tick":
            this.togglePlayBtnImgUrl = this.PAUSE_BTN_IMG_URL;
            break;
          // for paused and finished states
          default:
            this.togglePlayBtnImgUrl = this.PLAY_BTN_IMG_URL;
        }
      }));
  }

  public ngOnDestroy(): void
  {
    for (let sub of this.subs)
    {
      sub.unsubscribe();
    }
  }

  public toggleTiming()
  {
    this.isEnabled = !this.isEnabled;
    this.isEnabled
      ? this.toggleBtnSelectors$.next(["filter-gray"])
      : this.toggleBtnSelectors$.next(["filter-white"]);
  }

  public togglePlay()
  {
  }
}
