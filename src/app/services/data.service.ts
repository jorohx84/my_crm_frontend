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

    branches: { code: string, name: string } [] = [
    { code: 'A', name: 'Landwirtschaft, Forstwirtschaft & Fischerei' },
    { code: 'B', name: 'Bergbau & Rohstoffgewinnung' },
    { code: 'C1', name: 'Produktion / Verarbeitendes Gewerbe' },
    { code: 'C2', name: 'Lebensmittel- & Getränkeherstellung' },
    { code: 'C3', name: 'Maschinenbau & Metallverarbeitung' },
    { code: 'C4', name: 'Chemie, Pharma & Kunststoff' },
    { code: 'D', name: 'Energieversorgung (Strom, Gas, Wärme)' },
    { code: 'E', name: 'Wasserversorgung & Abfallwirtschaft' },
    { code: 'F', name: 'Baugewerbe' },
    { code: 'G1', name: 'Einzelhandel' },
    { code: 'G2', name: 'Großhandel' },
    { code: 'G3', name: 'Kfz-Handel & Reparatur' },
    { code: 'H', name: 'Transport & Logistik' },
    { code: 'I1', name: 'Gastgewerbe / Hotellerie' },
    { code: 'I2', name: 'Gastronomie' },
    { code: 'J1', name: 'Informationstechnologie (IT, Software, SaaS)' },
    { code: 'J2', name: 'Telekommunikation' },
    { code: 'J3', name: 'Medien, Verlage & Agenturen' },
    { code: 'K1', name: 'Finanzdienstleistungen' },
    { code: 'K2', name: 'Versicherungen' },
    { code: 'L', name: 'Immobilienwirtschaft' },
    { code: 'M1', name: 'Rechts- & Steuerberatung' },
    { code: 'M2', name: 'Unternehmensberatung / Consulting' },
    { code: 'M3', name: 'Ingenieurwesen / Architektur' },
    { code: 'N', name: 'Gebäudemanagement & Sicherheitsdienste' },
    { code: 'O', name: 'Öffentliche Verwaltung' },
    { code: 'P', name: 'Bildung & Schulen' },
    { code: 'Q1', name: 'Gesundheitswesen' },
    { code: 'Q2', name: 'Pflege & Soziales' },
    { code: 'R', name: 'Kunst, Unterhaltung & Freizeit' },
    { code: 'S', name: 'Vereine, Handwerks- & Sonstige Dienstleistungen' }
];



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