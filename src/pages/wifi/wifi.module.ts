import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WifiPage } from './wifi';

@NgModule({
  declarations: [
    WifiPage,
  ],
  imports: [
    IonicPageModule.forChild(WifiPage),
  ],
})
export class WifiPageModule {}
