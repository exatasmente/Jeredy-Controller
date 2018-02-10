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

@IonicPage()
@Component({
  selector: 'page-jeredy-controller',
  templateUrl: 'jeredy-controller.html',
})
export class JeredyControllerPage implements OnInit{
  u = false;
  d = false;
  l = false;
  r = false;
  socket;
  servidor;
  loading: Loading;
  alert: Alert;
  erro;
  constructor(private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private navParam: NavParams,
    private alertCtrl: AlertController,
    private screenOrientation: ScreenOrientation) {
    this.erro = false;;
    this.servidor = this.navParam.get('servidor');
    this.socket = io(this.servidor.endereco, {
      reconnectionAttempts: 5
    });
    this.showLoad('Connectando ao Jeredy');
    this.socket.connect();
    this.socket.emit('pair');
    this.socket.on('userAllowed', () => {
      this.closeLoad();
    });
    this.socket.on('userOn', () => {
      this.closeLoad();
      this.showAlert("Não Foi Possivél Conectar. Outro usuário está Conectado", "Permissão Negada");
    });
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
      this.alert.present().then( ()=>{
        this.navCtrl.pop();
      });
    }
  }

  showLoad(msg) {
    if (!this.loading) {
      this.loading = this.loadingCtrl.create({
        content: msg,
        spinner: 'dots'

      });
      this.loading.present();
    }
  }
  closeLoad() {
    this.loading.dismiss();
    this.loading = null;
  }



  ngOnInit(){
    this.screenOrientation.unlock();
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
  }
  ionViewWillLeave() {
    this.socket.disconnect();
  }
  gas(f) {
    if (f) {
      this.socket.emit('acelerador');
    }
  }
  reverse(f) {
    if (f) {

      this.socket.emit('reverso');
    }

  }
  break() {
    this.socket.emit('freio');
  }
  left(f) {
    if (f) {

      this.socket.emit('esquerda');
    }
  }
  right(f) {
    if (f) {

      this.socket.emit('direita');
    }
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
          this.d = false;
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
