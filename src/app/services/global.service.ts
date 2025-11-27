import { inject, Injectable } from "@angular/core";
import { Router, Route, ActivatedRoute } from "@angular/router";
import { DataService } from "./data.service";
import { APIService } from "./api.service";
import { Subject, takeUntil } from "rxjs";
import { response } from "express";
import { ObservableService } from "./observable.service";



@Injectable({
    providedIn: 'root'
})

export class GlobalService {
    router = inject(Router);
    route = inject(ActivatedRoute);
    dataservice = inject(DataService);
    apiservice = inject(APIService);
    observer = inject(ObservableService);
    number: number | null = null;
    memberListOpen: boolean = false;
    taskWrapperOpen: boolean = false;
    isSubtaskWrapper: boolean = false;
    sidebarOpen: boolean = true;
    customerWrapperOpen: boolean = false;
    messageWrapperOpen: boolean = false;
    isNewSystemMessage: boolean = false;
    searchWrapperOpen: boolean = false;
    contactWrapperOpen: boolean = false;
    activityWrapperOpen: boolean = false;
    wrongTime: boolean = false;
    // navigateToPath(path: string,) {
    //     this.router.navigate([path]);
    // }
    private destroy$ = new Subject<void>();
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


    constructor() { }

    setCustomerSidebarState() {
        if (this.checkURL('singlecontact')) {
            this.sidebarOpen = false;
        } else {
            this.sidebarOpen = true;
        }
    }


    toggleSidebar(state: boolean) {
        this.sidebarOpen = state;
        // this.dataservice.saveDataToLocalStorage('sidebarOpen', state);
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
        const logData = this.createLog(objKey, task, variableObj);
        this.apiservice.postData('task/logs/', logData).subscribe({
            next: (response) => {
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


    checkURL(key: string) {
        return this.router.url.includes(key);
    }


    filterToDate(list: any[], startTime: string, endTime: string) {
        const start = startTime ? new Date(startTime).getTime() : null;
        const end = endTime ? new Date(endTime).getTime() : null;
        if (start && end && start > end) {
            this.wrongTime = true
            return
        }
        this.wrongTime = false
        const foundActivities = list.filter(a => {
            const activityDate = new Date(a.date).getTime();

            if (start && end) {
                return activityDate >= start && activityDate <= end;
            } else if (start) {
                return activityDate >= start;
            } else if (end) {
                return activityDate <= end;
            } else {
                return true; // keine Filterung
            }

        });

        return foundActivities;
    }

    sortListbyTime(list: any[], key: string, direction: 'up' | 'down' = 'down'): any[] {
        return list.sort((a, b) => {
            const timeA = new Date(a[key]).getTime();
            const timeB = new Date(b[key]).getTime();

            return direction === 'up' ? timeA - timeB : timeB - timeA;
        });
    }

    sortListByName(list: any[], key: string, direction: 'up' | 'down' = 'up'): any[] {
        return list.sort((a, b) => {
            const nameA = (this.getNestedValue(a, key) || '').toString().toLowerCase();
            const nameB = (this.getNestedValue(b, key) || '').toString().toLowerCase();

            if (nameA < nameB) return direction === 'up' ? -1 : 1;
            if (nameA > nameB) return direction === 'up' ? 1 : -1;
            return 0;
        });
    }
    getNestedValue(obj: any, key: string): any {
        return key.split('.').reduce((value, key) => {
            return value ? value[key] : null;
        }, obj);
    }


    getTotalListCount(list: string) {
        console.log(list);

        this.apiservice.getData(`list-count/${list}/`).subscribe({
            next: (response) => {
                console.log(response);
                this.observer.sendListCount(response);
            }
        })


    }

    calcPages(totalCount: number, pageSize: number) {
        if (totalCount) {
            return Math.ceil(totalCount / pageSize);
        } else {
            return 1
        }
    }
}