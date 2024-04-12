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
