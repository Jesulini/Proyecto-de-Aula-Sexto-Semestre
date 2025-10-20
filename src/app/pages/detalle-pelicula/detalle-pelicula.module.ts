import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallePeliculaPageRoutingModule } from './detalle-pelicula-routing.module';

import { DetallePeliculaPage } from './detalle-pelicula.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallePeliculaPageRoutingModule
  ],
  declarations: [DetallePeliculaPage]
})
export class DetallePeliculaPageModule {}
