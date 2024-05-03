import { Udto } from "@almazrpe/ngx-kit";

export interface TaskCreate
{
  text: string;
}

export interface ProjectCreate
{
  name: string;
}

export interface TaskUdto extends Udto
{
  text: string;
  is_completed: boolean;
  completion_time: number;
}

export interface ProjectUdto extends Udto
{
  name: string;
  task_sids: string[];
}

export enum ViewType
{
  TPI = "tpi",
  Ideas = "ideas",
  Events = "events",
  Domains = "domains"
}

export interface ViewData
{
  title: string;
  type: ViewType;
  cssSelectors: string[];
}

export interface DomainUdto extends Udto
{
  name: string;
  color_palette: ColorPalette;
  timer_sids: string[];
}

export interface ColorPalette
{
  c60_bg: string;
  c30_bg: string;
  c10_bg: string;
  c60_fg: string;
  c30_fg: string;
  c10_fg: string;
}

export interface DomainCreate
{
  name: string;
  color_palette: ColorPalette;
}

export interface TimerGroup
{
  name: string;
  timer_sids: string[];
  current_timer_index: number;
  timer_end_action: any;
  group_end_action: any;
}

export interface Timer
{
  current_duration: number;
  total_duration: number;
  last_launch_time: number;
  finish_sound_asset_sid?: string;
  status: string;
}
