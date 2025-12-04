import { inject, Injectable } from "@angular/core";
import { UserService } from "./user.service";
import { Subject, takeUntil } from "rxjs";


@Injectable({
    providedIn: 'root'
})

export class PermissionService {
    userservice = inject(UserService);
    user: any
    private destroy$ = new Subject<void>();
    constructor() {
        this.subscribeUser()
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    subscribeUser() {
        this.userservice.getUser().pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                this.user = res;
                console.log(this.user);

            }
        });
    }


    isReviewer(reviewer: any) {

        return this.user.id === reviewer.id;
    }

    isMember(memberlist: any[]) {
        return memberlist.some(member => member.id === this.user.id);
    }

    isStaff() {
        return this.user.is_staff
    }
}