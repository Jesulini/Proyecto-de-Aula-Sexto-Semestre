import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MiListaPage } from './mi-lista.page';

const routes: Routes = [
  {
    path: '',
    component: MiListaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MiListaPageRoutingModule {}
