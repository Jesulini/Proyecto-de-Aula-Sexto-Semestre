import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarteleraPageRoutingModule } from './cartelera-routing.module';

import { CarteleraPage } from './cartelera.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarteleraPageRoutingModule
  ],
  declarations: [CarteleraPage]
})
export class CarteleraPageModule {}
