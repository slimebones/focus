import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  BehaviorSubject, Subscription, of, switchMap } from "rxjs";
import {timer as rxjsTimer} from "rxjs";
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
  public currentTimer$ = new BehaviorSubject<TimerUdto | null>(null);
  public remainingDuration: number;

  private readonly PLAY_BTN_IMG_SELECTORS = [
    "bg-c10-bg",
    "hover:bg-c10-bg-active"
  ];
  private readonly PAUSE_BTN_IMG_SELECTORS = [
    "bg-warn2-bg",
    "hover:bg-warn1-bg"
  ];
  private readonly PLAY_BTN_IMG_URL = "assets/play.png";
  private readonly PAUSE_BTN_IMG_URL = "assets/pause.png";
  public togglePlayBtnImgSelectors: string[];
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

  private timerUpdSub: Subscription | null = null;

  public constructor(
    private timingSv: TimingService
  )
  {
  }

  public ngOnInit(): void
  {
    this.timingSv
      .getTimers$()
      .pipe(
        switchMap(timers =>
        {
          if (timers.length == 0)
          {
            return this.timingSv.createTimer$(this.DEFAULT_TIMER_DURATION);
          }
          return of(timers[0]);
        }))
      .subscribe({
        next: timer =>
        {
          this.currentTimer$.next(timer);
        }
      });
      this.subs.push(this.currentTimer$.subscribe({
        next: timer =>
        {
          if (timer === null)
          {
            return;
          }
          switch (timer.status)
          {
            case "tick":
              this.togglePlayBtnImgUrl = this.PAUSE_BTN_IMG_URL;
              this.togglePlayBtnImgSelectors = this.PAUSE_BTN_IMG_SELECTORS;
              break;
            // for paused and finished states
            default:
              this.togglePlayBtnImgUrl = this.PLAY_BTN_IMG_URL;
              this.togglePlayBtnImgSelectors = this.PLAY_BTN_IMG_SELECTORS;
          }

          this.remainingDuration =
            timer.total_duration - timer.current_duration;

          if (timer.status === "tick" && this.timerUpdSub === null)
          {
            this.timerUpdSub = rxjsTimer(0, 1).subscribe({
              next: _ =>
              {
                this.remainingDuration--;
              }
            });
          }
          if (timer.status !== "tick" && this.timerUpdSub !== null)
          {
            this.timerUpdSub.unsubscribe();
            this.timerUpdSub = null;
          }

          return timer;
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

  public setDuration(duration: number)
  {
    const timer = this.currentTimer$.value;
    if (timer === null)
    {
      return;
    }
    this.timingSv.setDuration$(timer.sid, duration).subscribe({
      next: timer =>
      {
        this.currentTimer$.next(timer);
      }
    });
  }
}
