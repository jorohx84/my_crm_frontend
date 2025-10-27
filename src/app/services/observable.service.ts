import { inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ObservableService {
    private userSubject = new BehaviorSubject<any>(null);
    public userSubject$ = this.userSubject.asObservable();
    private memberSubject = new BehaviorSubject<any>(null);
    public memberSubject$ = this.memberSubject.asObservable();
    private taskSubject = new BehaviorSubject<any>(null);
    public taskSubject$ = this.taskSubject.asObservable();
    observeUser(user: any) {
        this.userSubject.next(user)
    }

    sendMember(member: any) {
        this.memberSubject.next(member);
    }

    triggerloadTask(){
        this.taskSubject.next(null);
    }

}