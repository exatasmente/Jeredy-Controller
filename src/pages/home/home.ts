import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import io from 'socket.io-client';

import { NgZone } from '@angular/core';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})

export class HomePage {
  servidores: any[];
  ip;
  porta = 1337;
  constructor(
    private navCtrl: NavController,
    public zone: NgZone,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController
  ) {

    
  }
  buscarJeredys() {
    this.servidores = [];
    var port = 1337;
    var ipBase = "192.168.0.";
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
      socket.emit('jeredy');
      //this.sockets.push(socket);
      socket.on('jeredy', (data) => {
        this.zone.run(() => {
          var time = setTimeout( ()=>{
            loading.dismiss();
          },1000);
          this.servidores.push({ endereco: address, data: data });
          socket.disconnect();
        });
      });
    });

    socket.on('connect_error', (err) => {
      if (ip == 255) {
        var time = setTimeout( ()=>{
          loading.dismiss();
        },40000);
        
        
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
            console.log(data);
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
      socket.emit('jeredy');
      //this.sockets.push(socket);
      socket.on('jeredy', (data) => {
        this.zone.run(() => {
          loading.dismiss();
          this.servidores.push({ endereco: address, data: data });
          socket.disconnect();
        });
      });
    });

    socket.on('connect_error', (err) => {
      loading.dismiss();
      this.alertCtrl.create({
        title: 'Opa',
        subTitle: 'Falha no engano',
        message: "Nenhum Jeredy encontrado, verfique o servidor e a sua conexão",
        buttons: [
          {
            text: 'OK'
          }
        ]
      }).present();



    })
  }
  gotoCotroller(s) {
    this.navCtrl.push('JeredyControllerPage', { servidor: s });
  }


}

