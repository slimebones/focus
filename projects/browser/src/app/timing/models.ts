import { Evt, Req, Udto, code } from "@almazrpe/ngx-kit";

@code("start_timer_req")
export class StartTimerReq extends Req
{
  public sid: string;

  public constructor(args: any)
  {
    super(args);
    this.sid = args.sid;
  }
}

@code("started_timer_evt")
export class StartedTimerEvt extends Evt
{
  public sid: string;

  public constructor(args: any)
  {
    super(args);
    this.sid = args.sid;
  }
}

@code("stopped_timer_evt")
export class StoppedTimerEvt extends Evt
{
  public sid: string;

  public constructor(args: any)
  {
    super(args);
    this.sid = args.sid;
  }
}

@code("stop_timer_req")
export class StopTimerReq extends Req
{
  public sid: string;

  public constructor(args: any)
  {
    super(args);
    this.sid = args.sid;
  }
}

export interface TimerGroupUdto extends Udto
{
  name: string;
  timer_sids: string[];
  current_timer_index: number;
  timer_end_action: any;
  group_end_action: any;
}

export interface TimerUdto extends Udto
{
  current_duration: number;
  total_duration: number;
  last_launch_time: number;
  finish_sound_url?: string;
  status: string;
}

@code("reset_timer_req")
export class ResetTimerReq extends Req
{
  public sid: string;

  public constructor(args: {sid: string})
  {
    super();
    this.sid = args.sid;
  }
}

@code("finished_timer_evt")
export class FinishedTimerEvt extends Evt
{
  public udto: TimerUdto;

  public constructor(args: {udto: TimerUdto})
  {
    super();
    this.udto = args.udto;
  }
}
