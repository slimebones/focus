import { Udto } from "$lib/jskit/dto";

export interface ProjectUdto extends Udto
{
  name: string;
  taskSids: string[];
}
