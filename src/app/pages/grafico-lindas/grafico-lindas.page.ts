import { Component, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { LoadingController } from '@ionic/angular';
import { NotificationService } from 'src/app/servicios/notification.service';
import { General } from 'src/app/general';
import { CameraService } from 'src/app/servicios/camera.service';

@Component({
  selector: 'app-grafico-lindas',
  templateUrl: './grafico-lindas.page.html',
  styleUrls: ['./grafico-lindas.page.scss'],
})
export class GraficoLindasPage  {

  @ViewChild('chart', {static: false}) chart;

  bars: any;
  colors: Array<string>;  
  images: Array<object>;
  labels: Array<string>;
  data: Array<number>;
  imageObject: object;

  constructor(
    private cameraService:CameraService, 
    public loadingController: LoadingController,
    private general: General,
    private notificationService: NotificationService
  ) { }

  ionViewDidEnter() {
    this.getAllImages().then(() => {
      this.createChart();
    });
  }

  createChart() {
    this.bars = new Chart(this.chart.nativeElement, {
      type: "pie",
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor: this.colors,
          borderColor: this.colors
        }]
      }
    });
  }

  getAllImages(){
    this.notificationService.presentLoading(2000, "Cargando gráfico");
    this.initiateArrays();
    return new Promise((resolve) => {
      this.cameraService.getAllImages(this.general.type).then((images: firebase.storage.ListResult) => {
        images.items.forEach((image:firebase.storage.Reference) => {
          let imageName = image.name
          Promise.all([image.getDownloadURL(), 
            this.cameraService.getOnce("images", imageName), 
            this.cameraService.getOnce("votos", imageName) 
          ]).then(values => {
              let votos = values[2].get("votos") || 0;
              if(votos > 0){
                this.images.push({"url": values[0], "name": imageName, "date":values[1].get("date"), "usuario": values[1].get("user")});
                this.labels.push(imageName);
                this.data.push(values[2].get("votos"));
                this.colors.push('#'+Math.floor(Math.random()*16777215).toString(16));
                setTimeout(function() { resolve() }, 1000);
              }
            })
        })
      })
    })
  }

  initiateArrays(){
    this.images = []; 
    this.labels = [];
    this.data = [];
    this.colors = [];
  }

  showImage(event){
    let element = this.bars.getElementAtEvent(event)[0];
    if(element) {
      let elementName = this.labels[element._index];
      this.imageObject = this.images.filter((data:any) => data.name == elementName)[0];
    }
  }

}