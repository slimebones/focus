import { Udto } from "@almazrpe/ngx-kit";

export interface IdeaUdto extends Udto
{
  text: string;
  is_processed: boolean;
  last_process_time: number;
}
