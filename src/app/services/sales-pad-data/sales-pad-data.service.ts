import { Injectable,OnInit } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/timeout";

@Injectable()
export class SalesPadDataService {
  constructor(private http: HttpClient) {}
  getOrgs(url, httpParams?) {
    let token = window['Authorization'];
    let httpHeaders = new HttpHeaders().append('Authorization', token);
    return this.http.get(url, { params: httpParams ,headers: httpHeaders})
  }
  getDetailsByOrgId(url, httpParams) {
        let token = window['Authorization'];
        let httpHeaders = new HttpHeaders().append('Authorization', token);
    return this.http
      .get(url, { params: httpParams, headers: httpHeaders })
      .timeout(120000);
  }
  updateUserData(url, body) {
        let token = window['Authorization'];
        let httpHeaders = new HttpHeaders().append('Authorization', token);
    return this.http.post(url, body,{headers:httpHeaders}).timeout(120000);
  }
  getUsers(url, httpParams) {
        let token = window['Authorization'];
        let httpHeaders = new HttpHeaders().append('Authorization', token);
    return this.http.get(url, { params: httpParams,headers:httpHeaders }).timeout(120000);
  }
  getUsersBySearch(url, httpParams) {
    let token = window['Authorization'];
    let httpHeaders = new HttpHeaders().append('Authorization', token);
    return this.http.get(url, { params: httpParams, headers: httpHeaders }).timeout(120000);
  }
  getAcctOrgs(url, httpParams) {
    let token = window['Authorization'];
    let httpHeaders = new HttpHeaders().append('Authorization', token);
    return this.http.get(url, { params: httpParams, headers: httpHeaders }).timeout(120000);
  }
  getRecordsByUser(url, httpParams) {
        let token = window['Authorization'];
        let httpHeaders = new HttpHeaders().append('Authorization', token);
    return this.http
      .get(url, { params: httpParams, headers: httpHeaders })
      .timeout(120000);
  }
  updateAttributeValue(url, httpParams) {
        let token = window['Authorization'];
    let httpHeaders = new HttpHeaders().append('Authorization', token);
    return this.http.post(url, httpParams,{headers:httpHeaders}).timeout(120000);
  }
  getPoPrefix(url,httpParams){
    let token = window['Authorization'];
    let httpHeaders = new HttpHeaders().append('Authorization', token);
    return this.http
      .get(url, { params: httpParams, headers: httpHeaders })
      .timeout(120000); 
  }
}
