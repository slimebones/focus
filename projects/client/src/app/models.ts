import { Udto } from "@almazrpe/ngx-kit";

export interface TaskCreate
{
  txt: string;
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
