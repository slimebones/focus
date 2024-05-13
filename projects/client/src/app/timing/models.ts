import { Evt, Req, Udto, code } from "@almazrpe/ngx-kit";

@code("start_timer_req")
export class StartTimerReq extends Req
{
  public sid: string;
}

@code("started_timer_evt")
export class StartedTimerEvt extends Evt
{
  public sid: string;
}

@code("stopped_timer_evt")
export class StoppedTimerEvt extends Evt
{
  public sid: string;
}

@code("stop_timer_req")
export class StopTimerReq extends Req
{
  public sid: string;
}

@code("finished_timer_evt")
export class FinishedTimerEvt extends Evt
{
  public udto: TimerUdto;
}

export interface TimerGroupUdto extends Udto
{
  name: string;
  timer_sids: string[];
  current_timer_index: number;
  timer_end_action: TimerEndActionData;
  group_end_action: TimerGroupEndActionData;
}

export interface TimerUdto extends Udto
{
  current_duration: number;
  total_duration: number;
  last_launch_time: number;
  finish_sound_asset_sid?: string;
  status: string;
}

