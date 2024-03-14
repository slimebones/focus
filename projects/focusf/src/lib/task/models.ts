import { Udto } from "$lib/jskit/dto";

export interface TaskUdto extends Udto
{
  text: string;
  isCompleted: boolean;
}
