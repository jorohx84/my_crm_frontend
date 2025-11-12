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
    private customerTriggersubject = new BehaviorSubject<any>(null);
    public customerTriggersubject$ = this.customerTriggersubject.asObservable();
    private taskTriggerSubject = new BehaviorSubject<any>(null);
    public taskTriggerSubject$ = this.taskTriggerSubject.asObservable();
    private notificationSubject = new BehaviorSubject<any>(null);
    public notificationSubject$ = this.notificationSubject.asObservable();
    // private systemMessagesTriggerSubject = new BehaviorSubject<any>(null);
    // public systemMessagesTriggerSubject$ = this.systemMessagesTriggerSubject.asObservable();
    private globalsearchSubject = new BehaviorSubject<any>(null);
    public globalsearchSubject$ = this.globalsearchSubject.asObservable();
    observeUser(user: any) {
        this.userSubject.next(user)
    }

    sendMember(member: any) {
        this.memberSubject.next(member);
    }

    sendTask(task: any) {
        this.taskSubject.next(task);
    }

    triggerloadCustomer(customer: any) {
        this.customerTriggersubject.next(customer);
    }

    triggerloadTask(task: any) {
        this.taskTriggerSubject.next(task);
    }

    sendNotification(notification: any[]) {
        this.notificationSubject.next(notification);
    }

    sendSearch(data: any) {
        this.globalsearchSubject.next(data);
    }
}