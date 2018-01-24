import { Injectable } from "@angular/core";
import { Http, Headers } from '@angular/http';
import * as jQuery from "jQuery"

@Injectable()
export class GMapsServices {
  public elStations: any[] = [];
  private nobilApiKey = '501abed701f4b59dc45364900bd6a53a';

  constructor(public http: Http) {
  }

  getAllChargingStations(lat,long) {
    return jQuery.ajax({
      type: 'POST',
      url: 'http://nobil.no/api/server/search.php',
      data: {
        'apikey': this.nobilApiKey,
        'apiversion': '3',
        'action': "search",
        'type': 'near',
        'lat': lat,
        'long': long,
        'distance': '10000',
        'limit': '10'
      },
      success: printJsonResponse,
      error: error,
      dataType: 'json'
    });
    function printJsonResponse(data) {
      return data;
    }
    function error(error) {
      return error;
    }
  }
}
