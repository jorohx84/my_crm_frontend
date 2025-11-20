import { inject, Injectable } from "@angular/core";
import { Router, Route, ActivatedRoute } from "@angular/router";
import { DataService } from "./data.service";
import { APIService } from "./api.service";


@Injectable({
    providedIn: 'root'
})

export class GlobalService {
    router = inject(Router);
    dataservice = inject(DataService);
    apiservice = inject(APIService);
    number: number | null = null;
    memberListOpen: boolean = false;
    taskWrapperOpen: boolean = false;
    isSubtaskWrapper: boolean = false;
    sidebarOpen: boolean = false;
    customerWrapperOpen: boolean = false;
    messageWrapperOpen: boolean = false;
    isNewSystemMessage: boolean = false;
    searchWrapperOpen: boolean = false;
    contactWrapperOpen: boolean = false;
    activityWrapperOpen: boolean = false;
    // navigateToPath(path: string,) {
    //     this.router.navigate([path]);
    // }
    taskLogs: Record<string, string> = {
        title: 'Titel wurde geändert',
        description: 'Beschreibung wurde geändert',
        state: 'Status wurde geändert',
        priority: 'Priorität wurde geändert',
        due_date: 'Fälligkeit wurde geändert',
        subtask: 'neue Subtask wurde erstellt',
        assignee: 'Bearbeiter wurde geändert',
        checklist: 'Subtasks wurden bearbeitet',
        tododone: 'Aufgabe abgeschlossen',
        todoundone: 'Aufgabe auf unbearbeitet geändert',
        release: 'Aufgabe wurde freigegeben',
        close: 'Aufgabe wurde geschlossen',
        create: 'Aufgabe wurde erstellt'
    }


    interpretation: Record<string, Record<string, string>> = {
        priority: {
            low: 'Niedrig',
            mid: 'Mittel',
            high: 'Hoch',
        },
        state: {
            undone: 'offen',
            in_progress: 'in Bearbeitung',
            under_review: 'in Prüfung',
            done: 'Erledigt',
        }

    }


    constructor() {
        this.sidebarOpen = this.dataservice.getDataFromLocalStorage('sidebarOpen')
        console.log(this.sidebarOpen);

    }


    toggleSidebar(state: boolean) {
        this.sidebarOpen = state;
        console.log(state);

        this.dataservice.saveDataToLocalStorage('sidebarOpen', state);
    }

    navigateToPath(segments: any[], queryParam?: any) {
        this.router.navigate(segments, { queryParams: queryParam });
    }

    navigateToPathID(path: string, id: any) {
        this.router.navigate([path, id]);
    }



    isToday(dateString: string): boolean {
        const date = new Date(dateString);
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }


    saveLog(objKey: string, task: any, variableObj: any = null) {
        console.log(objKey);
        const logData = this.createLog(objKey, task, variableObj);
        console.log(logData);

        this.apiservice.postData('task/logs/', logData).subscribe({
            next: (response) => {
                console.log(response);

            }
        })
    }


    createLog(objKey: string, task: any, variableObj: any) {
        const logText = this.taskLogs[objKey]
        const newState = this.getnewState(objKey, task, variableObj);

        return {
            task: task.id,
            log: logText,
            // updated_by: this.user.id,
            new_state: newState
        }
    }

    getnewState(objKey: string, task: any, variableObj: any) {
        if (objKey === 'description' || objKey === 'due_date' || objKey === 'title') {
            return task[objKey]
        } else if (objKey === 'state' || objKey === 'priority') {
            return this.interpretation[objKey][task[objKey]]
        } else if (objKey === 'subtask') {
            return variableObj.title;
        } else if (objKey === 'assignee') {
            return variableObj.fullname
        } else if (objKey === 'checklist') {
            return 'Aufgabe hinzugefügt'
        } else if (objKey === 'tododone' || objKey === 'todoundone') {
            return variableObj
        } else if (objKey === 'release') {
            return 'Freigabe erteilt durch Prüfer'
        } else if (objKey === 'close') {
            return 'Aufgabe abgeschlossen durch Bearbeiter'
        } else if (objKey === 'create') {
            return 'Neue Aufgabe'
        }
    }


    countSubtasksDone(index: number, tasksList: any[], countKey: string) {
    const tasks = tasksList;
    
    const task = tasks[index]
    let count = 0;
    for (let index = 0; index < task.subtasks.length; index++) {
      const check = task.subtasks[index];
      if (check.is_checked) {
        count++;
      }
    }
    const percentage = (count / task.subtasks.length) * 100
    if (countKey === 'percentage') {
      return percentage
    } else {
      return count
    }


  }
}