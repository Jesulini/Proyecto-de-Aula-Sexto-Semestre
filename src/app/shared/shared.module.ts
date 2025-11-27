import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from 'src/app/components/header-component/header.component';
import { SidebarMenuComponent } from 'src/app/components/sidebar-menu/sidebar-menu.component';
import { MessageBoxComponent } from 'src/app/components/message-box/message-box.component';
import { MovieCarouselComponent } from 'src/app/components/movie-carousel/movie-carousel.component';
import { LoadingComponent } from 'src/app/components/loading/loading.component';
import { MovieLoadingComponent } from '../components/movie-loading/movie-loading.component';
import { CarouselComponent } from '../components/carousel/carousel.component';
@NgModule({
  declarations: [
    HeaderComponent,
    SidebarMenuComponent,
    MessageBoxComponent,
    MovieCarouselComponent,
    LoadingComponent,
    MovieLoadingComponent,
    CarouselComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    SidebarMenuComponent,
    MessageBoxComponent,
    MovieCarouselComponent,
    LoadingComponent,
    MovieLoadingComponent,
    CarouselComponent
  ]
})
export class SharedModule { }
 