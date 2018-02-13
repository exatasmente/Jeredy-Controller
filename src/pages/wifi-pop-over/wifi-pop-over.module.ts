import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WifiPopOverPage } from './wifi-pop-over';

@NgModule({
  declarations: [
    WifiPopOverPage,
  ],
  imports: [
    IonicPageModule.forChild(WifiPopOverPage),
  ],
})
export class WifiPopOverPageModule {}
