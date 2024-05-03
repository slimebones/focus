import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { DomainUdto } from "src/app/models";
import { DomainService } from "../domain.service";
import { Observable, Subscription } from "rxjs";
import { StorageService } from "@almazrpe/ngx-kit";

@Component({
  selector: "app-domains",
  templateUrl: "./domains.component.html",
  styles: [
  ]
})
export class DomainsComponent implements OnInit, OnDestroy
{
  public domains: DomainUdto[] = [];
  public subs: Subscription[] = [];

  private selectedDomainSid$: Observable<string>;

  @Input()
  public selectDomain?: (domain: DomainUdto) => void = undefined;

  public constructor(
    private domainSv: DomainService,
    private storageSv: StorageService
  )
  {
  }

  public ngOnInit()
  {
    this.storageSv.addItem("local", "selected_domain_sid");
    this.selectedDomainSid$ = this.storageSv.initItem$(
      "local", "selected_domain_sid", this.tryGetDefaultSelectedDomainSid());

    this.subs.push(this.selectedDomainSid$.subscribe({next: val =>
    {
      let index = this.domains.findIndex(domain => domain.sid == val);
      if (index == -1)
      {
        this.storageSv.setItemVal(
          "local",
          "selected_domain_sid",
          this.tryGetDefaultSelectedDomainSid());
        return;
      }
      if (this.selectDomain !== undefined)
      {
        this.selectDomain(this.domains[index]);
      }
    }}));

    this.subs.push(this.domainSv.getMany$().subscribe({
      next: val =>
      {
        this.domains = val;
      }
    }));
  }

  public onCreate(name: string)
  {
    this.domainSv.create$({name: name}).subscribe({
      next: val =>
      {
        this.domains.splice(0, 0, val);
      }
    });
  }

  private tryGetDefaultSelectedDomainSid(): string | undefined
  {
    if (this.domains.length > 0)
    {
      return this.domains[0].sid;
    }
    return undefined;
  }

  public ngOnDestroy()
  {
    for (let sub of this.subs)
    {
      sub.unsubscribe();
    }
  }

  public _selectDomain(domain: DomainUdto): void
  {
    this.storageSv.setItemVal(
      "local",
      "selected_domain_sid",
      domain.sid);
  }
}
