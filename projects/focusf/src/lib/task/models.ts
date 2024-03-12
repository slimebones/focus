import { Udto } from "@slimebones/jskit";

export interface TaskUdto extends Udto
{
  text: string;
  isCompleted: boolean;
}
