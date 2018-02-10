import { Component, ViewChild } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { WebSocketProvider } from '../../providers/web-socket/web-socket';
import nipplejs from 'nipplejs';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})

export class HomePage {
  u = false;
  d = false;
  l = false;
  r = false;
  re = false;
  pins: {
    left:
    {
      front: string,
      back: string
    },
    right: {
      front: string,
      back: string
    }
  };
  status = 'VELOCIDADE';

  constructor(private navCtrl: NavController, private socket: WebSocketProvider, private toastCtrl: ToastController) {
    this.socket.connect();  
    this.socket.on('close',()=>{
      this.showToast('Conexão encerrada');
    });
    

  }
  




  ionViewWillLeave() {
    this.socket.disconnect();
  }
  gas(f) {
    if (f) {
      this.showToast('Acelera');
      this.socket.emit('acelerador');
    }
  }
  reverse(f) {
    if (f) {
      this.showToast('Reverso');
      this.socket.emit('reverso');
    }

  }
  break() {
    
    this.socket.emit('freio');
  }
  left(f) {
    if (f) {
      this.showToast('Esquerda');
      this.socket.emit('esquerda');
    }
  }
  right(f) {
    if (f) {
      this.showToast('Direita');
      this.socket.emit('direita');
    }
  }
  pinos() {
    this.socket.emit('reverso');
    console.log('Pega Pinos');
  }
  showToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 1000,
      position: 'middle'
    });
    toast.present();
  }
  ionViewDidLoad() {
    let options = {
      zone: document.getElementById('zone_joystick'),
      mode: 'static',
      position: { left: '30%', top: '100%' },
      color: 'red',

    };
    let options2 = {
      zone: document.getElementById('zone_joystick2'),
      mode: 'static',
      position: { left: '70%', top: '100%' },
      color: 'orange'

    };

    let manager = nipplejs.create(options);
    let manager2 = nipplejs.create(options2);

    manager.on('move', (evt, nipple) => {
      if (nipple.direction.angle == 'up' && nipple.force >= 0.8) {
        if (!this.u) {
          this.d= false;
          this.break();
          this.gas(true);
          this.u = true;
        }
      } else if (nipple.direction.angle == 'down' && nipple.force >= 0.8) {
        if (!this.d) {
          this.u = false;
          this.break();
          this.reverse(true);
          this.d = true;
        }

      }
    });
    manager2.on('move', (evt, nipple) => {
    
      if (nipple.direction.angle == 'left' && nipple.force >= 0.8) {
        if (!this.l) {
          this.r = false;
          this.break();
          this.left(true);
          this.l = true;
        }
      } else if (nipple.direction.angle == 'right' && nipple.force >= 0.8) {
        if (!this.r) {
          this.l = false;
          this.break();
          this.right(true);
          this.r = true;
        }
      }
    });
    manager.on('end', () => {
      if (this.d) {
        this.break();
        this.d = false;
      }
      if (this.u) {
        this.break();
        this.u = false;
      }
    });
    manager2.on('end', () => {
      if (this.l) {
        this.break();
        this.l = false;
      }
      if (this.r) {
        this.break();
        this.r = false;
      }
    });

  }
}

