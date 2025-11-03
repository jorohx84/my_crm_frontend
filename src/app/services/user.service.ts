import { inject, Injectable } from "@angular/core";
import { APIService } from "./api.service";
import { DataService } from "./data.service";
import { ObservableService } from "./observable.service";
import { Router } from "@angular/router";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class UserService {
    apiservice = inject(APIService);
    dataservice = inject(DataService);
    observservice = inject(ObservableService);
    router = inject(Router);
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
 

    /**
     *  Observer der sicherstellt dass die daten aus dem localStorage verfügbar sind und dann die das eigentliche, observersubejt zurück gibt, solbald die daten verfügbar sind" 
     * @returns das userSubject$ aus dem userObserver der in loadUserData gestartet wird
     */
    getUser(): Observable<any> {
        const userID = this.dataservice.getDataFromLocalStorage('auth-ID');
        if (userID) {
            this.loadUserData(userID)
        } else {
            this.router.navigate(['']);

        }
        return this.observservice.userSubject$
    }

    loadUserData(ID: number) {
       

        this.apiservice.getData(`profile/${ID}/`, false).subscribe({
            next: (response) => {
                const user = response;
                this.observservice.observeUser(user);
            }
        })
    }

}