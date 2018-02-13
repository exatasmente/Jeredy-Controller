import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import io from 'socket.io-client';

import { NgZone } from '@angular/core';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Hotspot, HotspotNetwork } from '@ionic-native/hotspot';
import { OnInit } from '@angular/core';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})

export class HomePage implements OnInit {
  servidores: any[];
  ip;
  baseIp;
  porta = 1337;
  constructor(
    private navCtrl: NavController,
    public zone: NgZone,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private screenOrientation: ScreenOrientation,
    private hotspot: Hotspot
  ) {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

  }
  ngOnInit() {
    this.hotspot.isWifiOn().then(rep => {
      if (!rep) {

      }else{
        this.hotspot.getConnectionInfo().then(info => {
          this.baseIp = info.IPAddress.slice(0,info.IPAddress.lastIndexOf('.')-1);
          console.log(info.IPAddress);
        });
      }
    });
  }
  buscarJeredys() {
    this.servidores = [];
    var port = 1337;
    var ipBase = this.baseIp;
    var ipLow = 1;
    var ipHigh = 255;
    var ipCurrent = +ipLow;
    ipHigh = +ipHigh;
    let loading = this.loadingCtrl.create({
      content: "Buscando Jeredy's",
      spinner: 'dots'
    });
    loading.present();
    while (ipCurrent <= ipHigh) {
      this.tryOne(ipBase, ipCurrent++, port, loading);


    }

  }

  tryOne(ipBase, ip, port, loading) {
    var address = "http://" + ipBase + ip + ":" + port;
    var socket = io(address, {
      reconnection: false,
      autoConnect: false,
      timeout: 1000
    });
    socket.connect();
    socket.on('connect', () => {
      socket.emit('getRobot', (robot) => {
        this.zone.run(() => {
          var time = setTimeout(() => {
            loading.dismiss();
          }, 1000);
          this.servidores.push({ endereco: address, data: robot });
          socket.disconnect();
        });
      });

    });

    socket.on('connect_error', (err) => {
      if (ip == 255) {
        var time = setTimeout(() => {
          loading.dismiss();
        }, 15000);


      }


    });

  }
  showAlert() {
    let prompt = this.alertCtrl.create({
      title: 'Busca Manual',
      message: "Digite o IP do Jeredy",

      inputs: [
        {
          name: 'ip',
          placeholder: 'ex: 192.168.0.1'
        },
      ],
      buttons: [
        {
          text: 'Cancela',
          handler: data => {

          }
        },
        {
          text: 'Buscar',
          handler: data => {
            this.ip = data.ip;
            this.buscaManual();

          }
        }
      ]
    });
    prompt.present();

  }
  buscaManual() {

    let ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(this.ip)) {
      this.alertCtrl.create({
        title: "Erro",
        subTitle: "IP Inválido",
        message: "O IP não é válido digite um ip válido e tente novamente",
        buttons: [
          {
            text: "OK"
          }
        ]
      }).present();
      return;
    }
    this.servidores = [];
    var address = "http://" + this.ip + ":" + this.porta;
    var socket = io(address, {
      reconnection: false,
      autoConnect: false,
      timeout: 1000
    });
    socket.connect();
    let loading = this.loadingCtrl.create({
      content: "Buscando Jeredy's",
      spinner: 'dots'
    });
    loading.present();
    socket.on('connect', () => {
      socket.emit('getRobot', (robot) => {
        this.zone.run(() => {
          var time = setTimeout(() => {
            loading.dismiss();
          }, 1000);
          this.servidores.push({ endereco: address, data: robot });
          socket.disconnect();
        });
      });

    });
    socket.on('connect_error', (err) => {
      loading.dismiss();
      this.alertCtrl.create({
        title: 'Aleta',
        subTitle: 'Sem Resultado',
        message: "Nenhum Jeredy encontrado, verfique o servidor, a sua conexão ou o IP digitado",
        buttons: [
          {
            text: 'OK'
          }
        ]
      }).present();



    })
  }
  gotoCotroller(s) {

    var socket = io(s.endereco, {
      reconnection: false,
      autoConnect: false,
      timeout: 1000
    });
    socket.connect();
    socket.on('connect', () => {
      socket.disconnect();
      setTimeout(()=>{
        this.navCtrl.push('JeredyControllerPage', { servidor: s })
      },1000);
    });

    socket.on('connect_error', (err) => {

      var alert = this.alertCtrl.create({
        title: "Erro",
        subTitle: "Falha na conexão",
        message: "Não Foi Possivél Conectar ao servidor, atualize a lista ou busque novamente o servidor",
        buttons: [
          {
            text: "OK"
          }
        ]
      });
      alert.onWillDismiss(() => {
        this.servidores.splice(this.servidores.find(s), 1);
      });
      alert.present();
    });


  }


}

