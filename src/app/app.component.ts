import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../pages/home/home';

import { ScreenOrientation } from '@ionic-native/screen-orientation';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  constructor(private screenOrientation: ScreenOrientation,platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
     this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

