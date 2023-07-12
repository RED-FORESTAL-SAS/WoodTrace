import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { TakePhotosPage } from "./take-photos.page";

const routes: Routes = [
  {
    path: "",
    component: TakePhotosPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TakePhotosPageRoutingModule {}
