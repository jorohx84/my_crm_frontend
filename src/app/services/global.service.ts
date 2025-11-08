import { inject, Injectable } from "@angular/core";
import { Router, Route, ActivatedRoute } from "@angular/router";
import { DataService } from "./data.service";


@Injectable({
    providedIn: 'root'
})

export class GlobalService {
    router = inject(Router);
    dataservice = inject(DataService);
    number: number | null = null;
    memberListOpen: boolean = false;
    taskWrapperOpen: boolean = false;
    isSubtaskWrapper: boolean = false;
    sidebarOpen: boolean = false;
    customerWrapperOpen: boolean = false;
    messageWrapperOpen: boolean = false;
    isNewSystemMessage: boolean = false;
    // navigateToPath(path: string,) {
    //     this.router.navigate([path]);
    // }


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

}