import { Component, OnInit } from "@angular/core";
import { AlertService } from "@almazrpe/ngx-kit";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit
{
  public title = "client";

  public constructor(
    private alertSv: AlertService
  )
  {
  }

  public ngOnInit()
  {

  }
}
