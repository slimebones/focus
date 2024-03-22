import { Component, OnInit } from "@angular/core";
import { AlertService, ClientBus, ConnService, log } from "@almazrpe/ngx-kit";
import { Subscription, take } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit
{
  public title = "client";
  private subs: Subscription[] = [];

  public constructor(
    private alertSv: AlertService,
    private connSv: ConnService,
    private route: ActivatedRoute
  )
  {
  }

  public ngOnInit()
  {
    this.redefineUrlsFromQuery();
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

  public redefineUrlsFromQuery(): void
  {
    this.route.queryParams.pipe(take(2)).subscribe({
      next: (params: any) =>
      {
        let host = environment.serverHost;
        let port = environment.serverPort;

        if (params.cpasbHost !== undefined)
        {
          host = params.cpasbHost;
        }

        if (params.cpasbPort !== undefined)
        {
          port = params.cpasbPort;
        }

        this.connSv.serverHostPort$.next(host + ":" + port);
      }
    });
  }
}
