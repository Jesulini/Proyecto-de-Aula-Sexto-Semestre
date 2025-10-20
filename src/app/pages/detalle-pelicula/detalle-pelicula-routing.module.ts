import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallePeliculaPage } from './detalle-pelicula.page';

const routes: Routes = [
  {
    path: '',
    component: DetallePeliculaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallePeliculaPageRoutingModule {}
