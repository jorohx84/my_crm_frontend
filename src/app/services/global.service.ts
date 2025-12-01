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


    // getTotalListCount(list: string) {
    //     console.log(list);

    //     this.apiservice.getData(`list-count/${list}/`).subscribe({
    //         next: (response) => {
    //             console.log(response);
    //             this.observer.sendListCount(response);
    //         }
    //     })


    // }

    calcPages(totalCount: number, pageSize: number) {
        if (totalCount) {
            return Math.ceil(totalCount / pageSize);
        } else {
            return 1
        }
    }


    checkPermissions(user: any, obj: any, permission: string): boolean {
        if (!user || !obj || !permission) {
            return false
        }
        if (permission === 'reviewer') {
            return obj.reviewer?.id === user?.id;
        } else
            return false

    }
}