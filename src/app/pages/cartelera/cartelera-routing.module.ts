import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarteleraPage } from './cartelera.page';

const routes: Routes = [
  {
    path: '',
    component: CarteleraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarteleraPageRoutingModule {}
