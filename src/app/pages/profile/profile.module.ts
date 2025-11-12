import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';

import { AvatarUploadComponent } from 'src/app/components/avatar-upload/avatar-upload.component';
import { MessageBoxComponent } from 'src/app/components/message-box/message-box.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule
    , SharedModule
  ],
  declarations: [ProfilePage, AvatarUploadComponent, MessageBoxComponent]
})
export class ProfilePageModule {}
