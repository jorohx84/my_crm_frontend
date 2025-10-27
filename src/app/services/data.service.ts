import { inject, Injectable } from "@angular/core";
import { APIService } from "./api.service";


@Injectable({
    providedIn: 'root'
})

export class DataService {
    customerList: any[] = [];
    getDataFromLocalStorage(data: any) {
        const storedData = localStorage.getItem(data);
        console.log('Rohwert aus localStorage:', storedData, 'Typ:', typeof storedData);
        if (storedData) {
            try {
                return JSON.parse(storedData);
            } catch (e) {
                console.log(e);

                return storedData;
            }
        } else {
            console.log('Keine Daten im localStorage gefunden');
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