import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  GoogleMapsAnimation,
  CameraPosition,
  MarkerOptions,
  LatLng,
  Marker,
  HtmlInfoWindow
} from '@ionic-native/google-maps';
import { Component, NgZone } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import * as jQuery from "jquery"
import { GMapsServices } from '../../app/Services/GMapsServices';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  map: GoogleMap;
  mapReady: boolean = false;
  mapElement: HTMLElement;
  public elMarkers= [];
  public lat;
  public long;
  public currentLocation;
  public mrkrImg;
  //public elStations = [];
  public elStations: any[]= [];

  constructor(private googleMaps: GoogleMaps, public platform: Platform, public geolocation: Geolocation, public zone: NgZone, public gMapsServices: GMapsServices) {
    this.geolocation.getCurrentPosition().then((res) => {
      //this.lat = res.coords.latitude;
      //this.long = res.coords.longitude;
      this.lat = "59.81089";
      this.long = "10.78539";
      this.mapElement = document.getElementById('map_canvas');
      let elem = document.createElement("div")

      platform.ready().then(() => {
        Promise.all([this.getAllNearByEL(this.lat, this.long)]).then(data => {
          setTimeout(() => {
            this.loadMap();
          }, 500);
        });
      });
    });
  }

  loadMap() {
    let mapOptions: GoogleMapOptions = {
      controls: {
        compass: true,
        myLocationButton: true,
        indoorPicker: true,
        zoom: true
      },
      gestures: {
        scroll: true,
        tilt: false,
        rotate: true,
        zoom: true
      },
      camera: {
        target: {
          lat: this.lat,
          lng: this.long
        },
        //target: this.dummyData()[0].position,
        zoom: 12,
        tilt: 30
      }
    };

    this.map = this.googleMaps.create(this.mapElement, mapOptions);

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.mapReady = true;
      console.log(this.elStations);
      this.addMarkerCurrentPos();
      this.addMarkersEL(this.elStations);
    });
  }

  getAllNearByEL(lat, long) {
    this.gMapsServices.getAllChargingStations(this.lat, this.long).then((data) => {
      this.zone.run(() => {
        for (var i = 0; i < data.chargerstations.length; i++) {
          var place = data.chargerstations[i];
          var pos = place.csmd.Position;
          var arr = pos.replace(/[^\d,.]/g, "").split(",");
          var latMrk = parseFloat(arr[0]);
          var longMrk = parseFloat(arr[1]);

          var chargingMode = "";
          var cm = "";

          if (place.attr.st[24] !== null && place.attr.st[24] !== undefined) {
            var c24t = "";
            var csOpen24hrs = place.attr.st[24].trans;
            if (csOpen24hrs === 'Yes') {
              c24t = 'Ja';
            }
            if (csOpen24hrs === 'No') {
              c24t = 'Nei';
            }
          }
          if (place.attr.conn[1][20] !== null && place.attr.conn[1][20] !== undefined) {
            chargingMode = place.attr.conn[1][20].trans;
          }
          var markerIcon = "";
          var imgIcon = "";
          if (place.attr.conn[1][20] !== undefined && place.attr.conn[1][20] !== null) {
            if (chargingMode === 'Mode 1') {
              cm = 'Normal lading';
              markerIcon = 'Mode1.png';
              imgIcon = 'assets/img/stations/' + markerIcon;
            }
            if (chargingMode === 'Mode 2') {
              cm = 'Normal lading (adapter)';
              markerIcon = 'Mode2.png';
              imgIcon = 'assets/img/stations/' + markerIcon;
            }
            if (chargingMode === 'Mode 3') {
              cm = 'Hurtiglading';
              markerIcon = 'Mode3.png';
              imgIcon = 'assets/img/stations/' + markerIcon;
            }
            if (chargingMode === 'Mode 4') {
              cm = 'DC Hurtiglading (CHAdeMO)';
              markerIcon = 'Mode4.png';
              imgIcon = 'assets/img/stations/' + markerIcon;
            }
          }

          var elPos = {
            "lat": latMrk,
            "lng": longMrk
          }
          var mrkrData = {
            'animation': 'DROP',
            'position': {
              "lat":latMrk,
              "lng":longMrk
            },
            'icon': "assets/img/stations/Mode3.png",
            'title': place.csmd.Name,
            'vicinity': place.csmd.Street + " " + place.csmd.House_number + "\nÅpent 24t: " + c24t + ", Ladepunkter: " + place.csmd.Number_charging_points + "\n" + cm,
            'Iid': place.csmd.International_id,
            'mType': 'LD',
            'csType': chargingMode
          }
          this.elStations.push(mrkrData);
        }

        return Promise.resolve(this.elStations);
      });
    });
  }

  addMarkersEL(mrkrs) {
    if (mrkrs.length > 0) {
      this.map.addMarkerCluster({
        boundsDraw: false,
        maxZoomLevel: 12,
        markers: mrkrs,
        icons: [
          { min: 2, max: 100, url: "assets/img/green.png", anchor: { x: 16, y: 16 } }
        ]
      }).then((markerCluster) => {
        console.log(markerCluster)
        var htmlInfoWnd = new HtmlInfoWindow();
        markerCluster.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params) => {
          console.log(params);
          var html = [
            "<div style='width:250px;min-height:100px'>",
            "<strong>" + (params.get("title")) + "</strong>"
          ];
          //if (marker.get("address")) {
          //  html.push("<div style='font-size:0.8em;'>" + marker.get("vicinity") + "</div>");
          //}
          html.push("</div>");
          htmlInfoWnd.setContent(html.join(""));
          htmlInfoWnd.open(params);
        });
      });
    }
  }

  addMarkerCurrentPos() {
    this.map.addMarker({
      title: 'Din Posisjon',
      icon: 'assets/img/stations/currentPos.png',
      draggable: true,
      animation: 'DROP',
      position: {
        lat: this.lat,
        lng: this.long
      }
    }).then(marker => {
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
      });
    });
  }

  refresh() {
    location.reload();
  }
}
