import { Injectable, NgModule } from '@angular/core';
import { Socket } from 'ng-socket-io';
 
@Injectable()
export class WebSocketProvider extends Socket {
 
    constructor() {
        super({ url: 'http://192.168.0.3:1337', options: {} });
    }
    
 
}
 
