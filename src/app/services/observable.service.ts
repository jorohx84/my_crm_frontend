import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ObservableService {
    private userSubject = new BehaviorSubject<any>(null);
    public userSubject$ = this.userSubject.asObservable();
    private memberSubject = new BehaviorSubject<any>(null);
    public memberSubject$ = this.memberSubject.asObservable();
    private taskSubject = new Subject<any>;
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
    private contactSubject = new BehaviorSubject<any>(null);
    public contactSubject$ = this.contactSubject.asObservable();
    private activitySubject = new BehaviorSubject<any>(null);
    public activitySubject$ = this.activitySubject.asObservable();
    private confirmSubject = new BehaviorSubject<any>(null);
    public confirmSubject$ = this.confirmSubject.asObservable();
    private listCountSubject = new BehaviorSubject<any>(null);
    public listCountSubject$ = this.listCountSubject.asObservable();
    private menulistSubject = new BehaviorSubject<any>(null);
    public menulistSubject$ = this.menulistSubject.asObservable();
    private memberlistSubject = new Subject<any[]>;
    public memberlistSubject$ = this.memberlistSubject.asObservable();
    private taskMembersSubject = new Subject<any[]>;
    public taskMembersSubject$ = this.taskMembersSubject.asObservable();

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

    sendContact(contact: any) {
        this.contactSubject.next(contact);
    }

    sendActivity(activity: any) {
        this.activitySubject.next(activity);
    }

    sendConfirmation(confirm: any) {
        this.confirmSubject.next(confirm);
    }

    sendListCount(count: number) {
        this.listCountSubject.next(count)
    }

    sendListData(data: any) {
        this.menulistSubject.next(data);
    }
    sendMemberList(list: any[]) {
        this.memberlistSubject.next(list);
    };

    sendTaskMembers(list: any[]) {
        this.taskMembersSubject.next(list);
    }


}