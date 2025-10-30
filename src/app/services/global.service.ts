import { inject, Injectable } from "@angular/core";
import { Router, Route, ActivatedRoute } from "@angular/router";


@Injectable({
    providedIn: 'root'
})

export class GlobalService {
    router = inject(Router);
    number: number | null = null;
    memberListOpen: boolean = false;
    taskWrapperOpen: boolean = false;

    // navigateToPath(path: string,) {
    //     this.router.navigate([path]);
    // }

    navigateToPath(segments: any[]) {
  this.router.navigate(segments);
}

    navigateToPathID(path: string, id: any) {
        this.router.navigate([path, id]);
    }

}

