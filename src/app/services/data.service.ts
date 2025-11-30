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

    task: any = {
        title: '',
        description: '',
        customer: null,
        state: 'todo',
        comments: '',
        priority: 'low',
        created_at: '',
        updated_at: '',
        due_date: '',
        reviewer: '',
        completed_at: '',
    };

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

    branches: { code: string, name: string }[] = [
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


    colors = [
        "#1F77B4", "#FF7F0E", "#2CA02C", "#D62728", "#9467BD",
        "#8C564B", "#E377C2", "#7F7F7F", "#BCBD22", "#17BECF",
        "#393B79", "#637939", "#8C6D31", "#843C39", "#7B4173",
        "#3182BD", "#31A354", "#756BB1", "#E6550D", "#636363",
        "#9C9EDE", "#F7B6D2", "#CEDB9C", "#FF9896", "#C5B0D5",
        "#C49C94", "#F7B174", "#A1D99B", "#A6CEE3", "#FDBF6F",
        "#B2DF8A", "#FB9A99", "#CAB2D6", "#6A3D9A", "#FF7F00",
        "#B15928", "#8DD3C7", "#FFFFB3", "#BEBADA", "#FB8072",
        "#80B1D3", "#FDB462", "#B3DE69", "#FCCDE5", "#D9D9D9"
    ]

    paginations = [25, 50, 75, 100];

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