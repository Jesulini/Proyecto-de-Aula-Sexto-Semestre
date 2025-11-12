import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from 'src/app/components/header-component/header.component';
import { SidebarMenuComponent } from 'src/app/components/sidebar-menu/sidebar-menu.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SidebarMenuComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule   
  ],
  exports: [
    HeaderComponent,
    SidebarMenuComponent
  ]
})
export class SharedModule {}
