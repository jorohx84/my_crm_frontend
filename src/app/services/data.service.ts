import { inject, Injectable } from "@angular/core";
import { APIService } from "./api.service";


@Injectable({
    providedIn: 'root'
})

export class DataService {
    customerList: any[] = [];



    getDataFromLocalStorage(data: any) {
        const storedData = localStorage.getItem(data);
        if (storedData) {
            try {
                return JSON.parse(storedData);
            } catch (e) {
                return storedData;
            }
        }
    }

    saveDataToLocalStorage(local: string, data: any) {

        if (typeof data === 'string') {

            localStorage.setItem(local, data);
        } else {

            localStorage.setItem(local, JSON.stringify(data));
        }
    }


}