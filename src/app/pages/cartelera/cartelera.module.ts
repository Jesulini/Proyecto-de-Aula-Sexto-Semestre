import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CarteleraPageRoutingModule } from './cartelera-routing.module';
import { CarteleraPage } from './cartelera.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [CarteleraPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarteleraPageRoutingModule,
    SharedModule
  ]
})
export class CarteleraPageModule {}
