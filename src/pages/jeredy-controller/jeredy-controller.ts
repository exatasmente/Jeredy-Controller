import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import nipplejs from 'nipplejs';
import io from 'socket.io-client';
import { LoadingController } from 'ionic-angular';
import { Loading } from 'ionic-angular';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Alert } from 'ionic-angular/components/alert/alert';
import { OnInit } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';

@IonicPage()
@Component({
  selector: 'page-jeredy-controller',
  templateUrl: 'jeredy-controller.html',
})
export class JeredyControllerPage implements OnInit {
  moviment = { up: 0, down: 0, left: 0, right: 0 };
  socket;
  servidor;
  loading: Loading;
  alert: Alert;
  status;
  interval;
  constructor(private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private navParam: NavParams,
    private alertCtrl: AlertController,
    private screenOrientation: ScreenOrientation,
    private toastCrtl: ToastController) {
    this.servidor = this.navParam.get('servidor');
    this.socket = io(this.servidor.endereco, {
      reconnectionAttempts: 5,
      timeout: 500
    });
    this.showLoad('Connectando ao Jeredy');
    this.socket.connect();
    this.socket.emit('pair', (value) => {
      this.closeLoad();
      if (value) {
        this.interval = setInterval(() => {
          this.socket.emit('latency', Date.now(), (time) => {
            var latency = Date.now() - time;
            this.status = latency;

          });
        }, 500);
      } else {
        this.showAlert("Não Foi Possivél Conectar. Outro usuário está Conectado", "Permissão Negada");
      }
    });

    this.socket.on('reconnect', () => {
      this.closeLoad();
      this.toastCrtl.create({
        message: "Reconectado",
        position: 'top',
        duration: 2000,
        dismissOnPageChange: true
      }).present();
    })
    this.socket.on('reconnect_failed', () => {
      this.closeLoad();
      this.showAlert("Não Foi Possivél Reconectar", "Conexão Perdida");

    });
    this.socket.on('reconnect_attempt', (n) => {
      if (this.loading) {
        this.loading.setContent('Conexão Perdida, tentantando reconectar. Tentativa ' + n + ' de 5');
      } else {
        this.showLoad('Conexão Perdida, tentantando reconectar. Tentativa ' + n + ' de 5');
      }
    });

  }
  showAlert(msg, subtitle) {
    if (!this.alert) {
      this.alert = this.alertCtrl.create({
        message: msg,
        title: "Erro",
        subTitle: subtitle,

        buttons: [
          {
            text: "OK",
            handler: () => {

            }
          }
        ]
      })
      this.alert.onDidDismiss(() => {
        clearInterval(this.interval);
        this.navCtrl.pop();
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

      });
      this.alert.present();

    }
  }

  showLoad(msg) {
    if (!this.loading) {
      this.loading = this.loadingCtrl.create({
        content: msg,
        spinner: 'dots',
        dismissOnPageChange: true

      });
      this.loading.present();
    }
  }
  closeLoad() {
    this.loading.dismiss();
    this.loading = null;
  }



  ngOnInit() {
    this.screenOrientation.unlock();
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
  }
  ionViewWillLeave() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.socket.disconnect();
  }
  moveRobot(values) {
    this.socket.emit('moveRobot',values);
  }

  ionViewDidLoad() {
    let options = {
      zone: document.getElementById('zone_joystick'),
      mode: 'static',
      position: { left: '20%', top: '50%' },
      color: 'red',

      isVerticalLocked: true
    };
    let options2 = {
      zone: document.getElementById('zone_joystick2'),
      mode: 'static',
      position: { left: '80%', top: '50%' },
      color: 'orange',
      isHorizontalLocked: true
    };

    let manager = nipplejs.create(options);
    let manager2 = nipplejs.create(options2);

    manager.on('move', (evt, nipple) => {
      try {
        if (nipple.direction.angle == 'up' && nipple.force >= 0.8) {
          this.moviment.up = 1;
          this.moviment.down = 0;
          if (this.moviment.left) {
            this.moveRobot(this.moveUpLeft());
          } else if (this.moviment.right) {
            this.moveRobot(this.moveUpRight());
          } else {
            this.moveRobot(this.moveUp());
          }
        } else if (nipple.direction.angle == 'down' && nipple.force >= 0.8) {
          this.moviment.down = 1;
          this.moviment.up = 0;
          if (this.moviment.left) {
            this.moveRobot(this.moveDownLeft());
          } else if (this.moviment.right) {
            this.moveRobot(this.moveDownRight());
          } else {
            this.moveRobot(this.moveDown());
          }
        } else {
          this.moviment.up = 0;
          this.moviment.down = 0;
          this.moveRobot(this.moveStop());
        }

      } catch (e) {

      }
    });
    manager2.on('move', (evt, nipple) => {
      try {
        if (nipple.direction.angle == 'left' && nipple.force >= 0.8) {
          this.moviment.left = 1;
          this.moviment.right = 0;
          if (this.moviment.up) {
            this.moveRobot(this.moveUpLeft());
          } else if (this.moviment.down) {
            this.moveRobot(this.moveDownLeft());
          } else {
            this.moveRobot(this.moveLeft());
          }
        } else if (nipple.direction.angle == 'right' && nipple.force >= 0.8) {
          this.moviment.right = 1;
          this.moviment.left = 0;
          if (this.moviment.up) {
            this.moveRobot(this.moveUpRight());
          } else if (this.moviment.down) {
            this.moveRobot(this.moveDownRight());
          } else {
            this.moveRobot(this.moveRight());
          }
        } else {
          this.moviment.left = 0;
          this.moviment.right = 0;
          this.moveRobot(this.moveStop());
        }
      } catch (e) {

      }
    });

    manager.on('end', () => {
      this.moviment.up = 0;
      this.moviment.down = 0;
      if (this.moviment.left) {
        this.moveRobot(this.moveLeft());
      } else if (this.moviment.right) {
        this.moveRobot(this.moveRight());
      } else {
        this.moveRobot(this.moveStop());
      }

    });
    manager2.on('end', () => {
      this.moviment.left = 0;
      this.moviment.right = 0;
      if (this.moviment.up) {
        this.moveRobot(this.moveUp());
      } else if (this.moviment.down) {
        this.moveRobot(this.moveDown());
      } else {
        this.moveRobot(this.moveStop());
      }
    });

  }




  moveUp() {
    return {
      left:
        {
          front: 1,
          back: 1,
          reverse: [0, 0]
        },
      right: {
        front: 1,
        back: 1,
        reverse: [0, 0]
      }
    };
  }
  moveUpLeft() {
    return {
      left:
        {
          front: 1,
          back: 1,
          reverse: [0, 0]
        },
      right: {
        front: 0,
        back: 0,
        reverse: [0, 0]
      }
    };
  }
  moveUpRight() {
    return {
      left:
        {
          front: 0,
          back: 0,
          reverse: [0, 0]
        },
      right: {
        front: 1,
        back: 1,
        reverse: [0, 0]
      }
    };
  }

  moveDownLeft() {
    return {
      left:
        {
          front: 0,
          back: 0,
          reverse: [0, 0]
        },
      right: {
        front: 0,
        back: 0,
        reverse: [1, 1]
      }
    };
  }

  moveDownRight() {
    return {
      left:
        {
          front: 0,
          back: 0,
          reverse: [1, 1]
        },
      right: {
        front: 0,
        back: 0,
        reverse: [0, 0]
      }
    };
  }

  moveDown() {
    return {
      left:
        {
          front: 0,
          back: 0,
          reverse: [1, 1]
        },
      right: {
        front: 0,
        back: 0,
        reverse: [1, 1]
      }
    };
  }
  moveRight() {
    return {
      left:
        {
          front: 0,
          back: 0,
          reverse: [1, 1]
        },
      right: {
        front: 1,
        back: 1,
        reverse: [0, 0]
      }
    };
  }
  moveLeft() {
    return {
      left:
        {
          front: 1,
          back: 1,
          reverse: [0, 0]
        },
      right: {
        front: 0,
        back: 0,
        reverse: [1, 1]
      }
    };
  }
  moveStop() {
    return {
      left:
        {
          front: 0,
          back: 0,
          reverse: [0, 0]
        },
      right: {
        front: 0,
        back: 0,
        reverse: [0, 0]
      }
    };
  }



}


