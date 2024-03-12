import { Udto } from "@slimebones/jskit";

export interface ProjectUdto extends Udto
{
  name: string;
  taskSids: string[];
}
