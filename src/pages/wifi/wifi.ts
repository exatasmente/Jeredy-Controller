import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Hotspot, HotspotNetwork } from '@ionic-native/hotspot';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { NgZone } from '@angular/core';


@IonicPage()
@Component({
  selector: 'page-wifi',
  templateUrl: 'wifi.html',
})
export class WifiPage {
  redes: Array<HotspotNetwork>;
  constructor(
    private hotspot: Hotspot,
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public zone : NgZone
  ) {
    let loading = this.loadingCtrl.create({
      content:"Buscando Redes Sem Fio",
      spinner:"dots"
    });
    loading.present();
    this.hotspot.scanWifi().then((networks: Array<HotspotNetwork>) => {
      loading.dismiss();
      this.zone.run( ()=>{
        console.log(JSON.stringify(networks));
        this.redes = networks;
      });
      
    });
  }
  openWifi(rede) {
    let prompt = this.alertCtrl.create({
      title: 'Conexão a Rede Sem Fio',
      message: "Digite a senha da rede",

      inputs: [
        {
          name: 'senha',
          placeholder: 'Senha da Rede',
          type: 'password'
        },
      ],
      buttons: [
        {
          text: 'Cancela',
          handler: data => {

          }
        },
        {
          text: 'Conectar',
          handler: data => {
            let loading = this.loadingCtrl.create({
              content: "Conectando...",
              spinner: 'dots'
            });
            loading.present();
            this.hotspot.connectToWifi(rede.SSID, data.senha).then((resp) => {
              loading.dismiss();
              console.log(resp);
              this.alertCtrl.create({
                title: 'Sucesso',
                message: 'Conectado com sucesso',
                buttons: [{
                  text: 'Ok'
                }]
              }).present();
            }, (err) => {
              console.log(err);
              loading.dismiss();
              this.alertCtrl.create({
                title: 'Erro',
                message: 'Falha na Conecxão',
                buttons: [{
                  text: 'Ok'
                }]
              }).present();
            });

          }
        }
      ]
    });
    prompt.present();

  }


}
