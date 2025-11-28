import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

import { HeaderComponent } from 'src/app/components/header-component/header.component';
import { SidebarMenuComponent } from 'src/app/components/sidebar-menu/sidebar-menu.component';
import { MessageBoxComponent } from 'src/app/components/message-box/message-box.component';
import { MovieCarouselComponent } from 'src/app/components/movie-carousel/movie-carousel.component';
import { LoadingComponent } from 'src/app/components/loading/loading.component';
import { MovieLoadingComponent } from 'src/app/components/movie-loading/movie-loading.component';
import { CarouselComponent } from 'src/app/components/carousel/carousel.component';
import { AdminPanelComponent } from 'src/app/components/AdminPanelComponent/admin-panel.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SidebarMenuComponent,
    MessageBoxComponent,
    MovieCarouselComponent,
    LoadingComponent,
    MovieLoadingComponent,
    CarouselComponent,
    AdminPanelComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
  ],
  exports: [
    HeaderComponent,
    SidebarMenuComponent,
    MessageBoxComponent,
    MovieCarouselComponent,
    LoadingComponent,
    MovieLoadingComponent,
    CarouselComponent,
    AdminPanelComponent,
  ]
})
export class SharedModule {}
