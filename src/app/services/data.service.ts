import { inject, Injectable } from "@angular/core";
import { APIService } from "./api.service";


@Injectable({
    providedIn: 'root'
})

export class DataService {
    customerList: any[] = [];

    taskLogs: Record<string, string> = {
        title: 'Titel wurde geändert',
        description: 'Beschreibung wurde geändert',
        state: 'Status wurde geändert',
        priority: 'Priorität wurde geändert',
        due_date: 'Fälligkeit wurde geändert',
        subtask:'neue Subtask wurde erstellt',
        assignee:'Bearbeiter wurde geändert',
        checklist:'Checkliste wurde bearbeitet',
        tododone:'Checkliste: Todo abgeschlossen',
        todoundone:'Checkliste: Todo auf unbearbeitet geändert',
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