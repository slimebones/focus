import { Component, OnDestroy, OnInit } from "@angular/core";
import { DomainService } from "./domain.service";
import { StorageService } from "@almazrpe/ngx-kit";
import { Subscription } from "rxjs";
import { DomainUdto } from "../models";

@Component({
  selector: "app-domain",
  templateUrl: "./domain.component.html",
  styles: [
  ]
})
export class DomainComponent implements OnInit, OnDestroy
{
  public domain?: DomainUdto = undefined;
  private subs: Subscription[] = [];

  public constructor(
    private domainSv: DomainService,
    private storageSv: StorageService)
  {
  }

  public ngOnInit(): void
  {
    this.subs.push(this.storageSv.getItem$("local", "selected_domain_sid")
      .subscribe({
      }));
  }

  public ngOnDestroy(): void
  {
    for (let sub of this.subs)
    {
      sub.unsubscribe();
    }
  }
}
