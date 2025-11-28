import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { GlobalService } from "./global.service";
import { DataService } from "./data.service";

@Injectable({
    providedIn: 'root'
})


export class APIService {
    BASE_URL = 'http://127.0.0.1:8000/api/'
    dataservice = inject(DataService);

    constructor(private http: HttpClient) { }


    getAuthHeaders(): HttpHeaders {
        // const tokenString = localStorage.getItem('auth-TOKEN');
        // const token = tokenString ? JSON.parse(tokenString) : null;
        // console.log(token);
        const token = this.dataservice.getDataFromLocalStorage('auth-TOKEN');
        const headersConfig: { [key: string]: string } = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headersConfig['Authorization'] = `Token ${token}`;
        }

        return new HttpHeaders(headersConfig);
    }



    postData(endpoint: string, data: any, useAuth: boolean = true): Observable<any> {
        const url = this.BASE_URL + endpoint;
        const options = useAuth ? { headers: this.getAuthHeaders() } : {};
        return this.http.post(url, data, options);
    }

    patchData(endpoint: string, data: any, useAuth: boolean = true): Observable<any> {
        const url = this.BASE_URL + endpoint;
        const options = useAuth ? { headers: this.getAuthHeaders() } : {};
        return this.http.patch(url, data, options);
    }

    deleteData(endpoint: string, useAuth: boolean = true): Observable<any> {
        const url = this.BASE_URL + endpoint;
        const options = useAuth ? { headers: this.getAuthHeaders() } : {};
        return this.http.delete(url, options);
    }

    getData(endpoint: string, params?: any, useAuth: boolean = true): Observable<any> {
        const url = this.BASE_URL + endpoint;
        const options: { headers?: HttpHeaders; params?: any } = {};
        if (useAuth) { options.headers = this.getAuthHeaders(); }
        if (params) { options.params = params; }
        return this.http.get(url, options);
    }
}
