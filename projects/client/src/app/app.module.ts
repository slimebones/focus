import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ProjectComponent } from './project/project.component';
import { TaskComponent } from './task/task.component';
import { ProjectsComponent } from './project/projects/projects.component';
import { TasksComponent } from './task/tasks/tasks.component';

@NgModule({
  declarations: [
    AppComponent,
    ProjectComponent,
    TaskComponent,
    ProjectsComponent,
    TasksComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
