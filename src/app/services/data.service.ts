import { inject, Injectable } from "@angular/core";
import { APIService } from "./api.service";


@Injectable({
    providedIn: 'root'
})

export class DataService {
    customerList: any[] = [];

    taskLogs: Record<string, string> = {
        titel: 'Titel wurde geändert',
        description: 'Beschreibung wurde geändert',
        state: 'Status wurde geändert',
        priority: 'Priorität wurde geändert',
        due_date: 'Fälligkeit wurde geändert',
        subtask:'neue Subtask wurde erstellt',
    }


  interpretation: Record<string, Record<string, string>> = {
    priority: {
      low: 'Niedrig',
      mid: 'Mittel',
      high: 'Hoch',
    },
    state: {
      undone: 'unbearbeitet',
      in_progress: 'in Bearbeitung',
      under_review: 'in Prüfung',
      done: 'Erledigt',
    }

  }



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