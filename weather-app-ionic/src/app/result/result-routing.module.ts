import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ResultPage } from './result.page';

const routes: Routes = [
  {
    path: '',
    component: ResultPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResultPageRoutingModule {}
