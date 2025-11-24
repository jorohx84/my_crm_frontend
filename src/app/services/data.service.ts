import { inject, Injectable } from "@angular/core";
import { APIService } from "./api.service";


@Injectable({
    providedIn: 'root'
})

export class DataService {
    customerList: any[] = [];
    emptyCustomer: any = {
        companyname: '',
        street: '',
        areacode: '',
        city: '',
        country: '',
        email: '',
        phone: '',
        website: '',
        branch: '',
        isActiv: false,
        created_at: '',
        lastContact: '',
        assignedTo: 0,
        notes: '',
        revenue: 0,
        paymentTerms: '',
        insideSales: null,
        outsideSales: null,
        created_by: null,
        updated_at: ''
    }

    activityTypes: { [key: string]: { path: string; label: string; } } = {
        call: {
            path: './icons/phone.svg',
            label: 'Anruf'
        },
        invite: {
            path: './icons/invite.svg',
            label: 'Besuch'
        },
        video: {
            path: './icons/phone.svg',
            label: 'Video Call'
        },
        email: {
            path: './icons/mail.svg',
            label: 'E-Mail'
        },
    };




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