import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  BehaviorSubject, Observable, Subscription, of, switchMap } from "rxjs";
import {timer as rxjsTimer} from "rxjs";
import { TimingService } from "./timing.service";
import { FinishedTimerEvt, TimerUdto } from "./models";
import { FormControl, FormGroup } from "@angular/forms";
import { ClientBus, InputType, StorageService } from "@almazrpe/ngx-kit";

@Component({
  selector: "app-timing",
  templateUrl: "./timing.component.html",
  styles: [
  ]
})
export class TimingComponent implements OnInit, OnDestroy
{
  public InputType = InputType;
  public currentTimer$ = new BehaviorSubject<TimerUdto | null>(null);
  public remainingDuration: number;
  public remainingDurationMinutes: string;
  public remainingDurationSeconds: string;
  public isEditingMode: boolean = false;
  public readonly ENABLE_EDIT_IMG: string = "assets/pencil.png";
  public readonly APPLY_EDIT_IMG: string = "assets/apply.png";
  public editingModeImg: string = this.ENABLE_EDIT_IMG;
  public editingForm: FormGroup;

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

  public isEnabled: boolean = false;
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
  private unsubs: (() => void)[] = [];

  public constructor(
    public timingSv: TimingService,
    private storageSv: StorageService
  )
  {
  }

  public ngOnInit(): void
  {
    this.unsubs.push(ClientBus.ie.sub(
      FinishedTimerEvt,
      evt =>
      {
        const udto = (evt as FinishedTimerEvt).udto;
        if (udto.sid === this.currentTimer$.value?.sid)
        {
          this.currentTimer$.next(udto);
        }
      }
    ));

    this.editingForm = new FormGroup({
      totalDurationMinutes: new FormControl(0),
      totalDurationSeconds: new FormControl(0)
    });

    this.timingSv
      .getTimers$()
      .pipe(
        switchMap(timers =>
        {
          if (timers.length == 0)
          {
            return this.timingSv.createTimer$(
              this.DEFAULT_TIMER_DURATION,
              "http://"
                + this.storageSv.getItem("local", "conn_hostport")
                + "/share/galaxy_theme.mp3");
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

        const currentTime = Date.now() / 1000;
        if (timer.last_launch_time === 0)
        {
          this.remainingDuration = timer.total_duration;
        }
        else if (timer.status === "tick")
        {
          this.remainingDuration =
            timer.total_duration
            - timer.current_duration
            - (
              currentTime - timer.last_launch_time);
        }
        else
        {
          this.remainingDuration =
            timer.total_duration - timer.current_duration;
        }

        if (timer.status === "tick" && this.timerUpdSub === null)
        {
          this.timerUpdSub = rxjsTimer(1000, 1000).subscribe({
            next: _ =>
            {
              this.remainingDuration--;
              if (this.remainingDuration <= 0)
              {
                this.remainingDuration = 0;
              }
              this.setDurationData();
            }
          });
        }
        if (timer.status !== "tick" && this.timerUpdSub !== null)
        {
          this.timerUpdSub.unsubscribe();
          this.timerUpdSub = null;
        }
        this.setDurationData();
        return timer;
      }
    }));
  }

  private setDurationData()
  {
    const remainingDurationMinutes = Math.floor(
      this.remainingDuration / 60);
    this.remainingDurationMinutes = remainingDurationMinutes.toString();
    this.remainingDurationSeconds = Math.floor(
        this.remainingDuration - remainingDurationMinutes * 60)
      .toString();

    if (this.remainingDurationMinutes.length === 1)
    {
      this.remainingDurationMinutes = "0" + this.remainingDurationMinutes;
    }
    if (this.remainingDurationSeconds.length === 1)
    {
      this.remainingDurationSeconds = "0" + this.remainingDurationSeconds;
    }

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
    const currentTimer = this.currentTimer$.value;
    if (currentTimer === null)
    {
      return;
    }

    let obs$: Observable<TimerUdto>;
    if (currentTimer.status == "tick")
    {
      obs$ = this.timingSv.stopTimer(currentTimer.sid);
    }
    else
    {
      obs$ = this.timingSv.startTimer(currentTimer.sid);
    }

    obs$.subscribe({
      next: timer =>
      {
        this.currentTimer$.next(timer);
      }
    });
  }

  public setTotalDuration(duration: number)
  {
    const currentTimer = this.currentTimer$.value;
    if (currentTimer === null)
    {
      return;
    }
    this.timingSv.setTotalDuration$(currentTimer.sid, duration).subscribe({
      next: timer =>
      {
        this.currentTimer$.next(timer);
      }
    });
  }

  public resetTimer()
  {
    const currentTimer = this.currentTimer$.value;
    if (currentTimer === null)
    {
      return;
    }
    this.timingSv.resetTimer$(currentTimer.sid).subscribe({
      next: timer =>
      {
        this.currentTimer$.next(timer);
      }
    });
  }

  public toggleEditingMode()
  {
    this.isEditingMode = !this.isEditingMode;
    this.editingModeImg = this.isEditingMode
      ? this.APPLY_EDIT_IMG
      : this.ENABLE_EDIT_IMG;
    const currentTimer = this.currentTimer$.value;
    if (currentTimer === null)
    {
      return;
    }

    if (this.isEditingMode)
    {
      // on join editing mode - upd timer values
      const minutes = Math.floor(currentTimer.total_duration / 60);
      const seconds = Math.floor(currentTimer.total_duration - minutes * 60);
      this.editingForm.setValue({
        "totalDurationMinutes": minutes,
        "totalDurationSeconds": seconds,
      });
    }
    // on apply - send data to the server, but only if inputs are dirty
    else if (this.editingForm.dirty)
    {
      let newDuration =
        Number.parseInt(this.editingForm.value.totalDurationMinutes) * 60
        + Number.parseInt(this.editingForm.value.totalDurationSeconds);
      if (newDuration <= 0)
      {
        newDuration = 1;
      }
      this.timingSv
        .setTotalDuration$(currentTimer.sid, newDuration)
        .subscribe({
          next: timer =>
          {
            this.editingForm.markAsPristine();
            this.currentTimer$.next(timer);
          }
        });
    }
  }
}
