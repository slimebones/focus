import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AlertService,
  ClientBus,
  ConnService,
  FcodeCore,
  GotDocUdtoEvt,
  GotDocUdtosEvt,
  LocalStorage,
  OkEvt,
  StorageService,
  log } from "@almazrpe/ngx-kit";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { environment } from "src/environments/environment";
import { ProjectService } from "./project/project.service";
import { AppViewType, ViewData } from "./models";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit, OnDestroy
{
  public AppView = AppViewType;

  public title = "client";
  public openedViewType = AppViewType.TPI;
  private readonly UnselectedViewCssSelectors: string[] = ["hover:underline"];
  private readonly SelectedViewCssSelectors: string[] = ["underline"];
  public views: ViewData[] = [
    {
      title: "Tasks",
      type: AppViewType.TPI,
      cssSelectors: this.SelectedViewCssSelectors
    },
    {
      title: "Ideas",
      type: AppViewType.Ideas,
      cssSelectors: this.UnselectedViewCssSelectors
    },
    {
      title: "Events",
      type: AppViewType.Events,
      cssSelectors: this.UnselectedViewCssSelectors
    },
  ];
  private subs: Subscription[] = [];

  public constructor(
    private alertSv: AlertService,
    private connSv: ConnService,
    private route: ActivatedRoute,
    private storageSv: StorageService,
    private projectSv: ProjectService
  )
  {
  }

  public ngOnInit()
  {
    // maybe redundant: problem probably was with incorrect dockerfile setup
    FcodeCore.ie.secure({
      "got-doc-udtos-evt": GotDocUdtosEvt,
      "got-doc-udto-evt": GotDocUdtoEvt,
      "ok-evt": OkEvt
    });

    this.storageSv.addStorage("local", new LocalStorage());
    this.connSv.init(
      "local",
      undefined,
      environment.serverHost + ":" + environment.serverPort);
    this.projectSv.init();

    this.subs.push(this.connSv.serverHostPort$.subscribe({
      next: url =>
      {
        log.info(
          `set server url: ${url}`
        );
      }
    }));
    ClientBus.ie.init(this.alertSv, this.connSv);
  }

  public ngOnDestroy(): void
  {
    for (const sub of this.subs)
    {
      sub.unsubscribe();
    }
  }

  public selectView(view: ViewData): void
  {
    this.openedViewType = view.type;
    for (let view of this.views)
    {
      view.cssSelectors = this.UnselectedViewCssSelectors;
    }
    view.cssSelectors = this.SelectedViewCssSelectors;
  }
}
