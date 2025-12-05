import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ObservableService {
    private userSubject = new BehaviorSubject<any>(null);
    public userSubject$ = this.userSubject.asObservable();
    private memberSubject = new Subject<any>();
    public memberSubject$ = this.memberSubject.asObservable();
    private taskSubject = new Subject<any>();
    public taskSubject$ = this.taskSubject.asObservable();

    private customerSubject = new Subject<any>();
    public customerSubject$ = this.customerSubject.asObservable();

    private taskTriggerSubject = new Subject<any>();
    public taskTriggerSubject$ = this.taskTriggerSubject.asObservable();
    private notificationSubject = new BehaviorSubject<any>(null);
    public notificationSubject$ = this.notificationSubject.asObservable();

    private globalsearchSubject = new Subject<any>();
    public globalsearchSubject$ = this.globalsearchSubject.asObservable();
    private contactSubject = new Subject<any>();
    public contactSubject$ = this.contactSubject.asObservable();
    private activitySubject = new Subject<any>();
    public activitySubject$ = this.activitySubject.asObservable();
    private confirmSubject = new Subject<any>();
    public confirmSubject$ = this.confirmSubject.asObservable();
    private listCountSubject = new Subject<any>();
    public listCountSubject$ = this.listCountSubject.asObservable();
    private memberlistSubject = new Subject<any[]>;
    public memberlistSubject$ = this.memberlistSubject.asObservable();
    private taskMembersSubject = new Subject<any[]>;
    public taskMembersSubject$ = this.taskMembersSubject.asObservable();

    private dialogSubject = new Subject<any[]>;
    public dialogSubject$ = this.dialogSubject.asObservable();

    observeUser(user: any) {
        this.userSubject.next(user)
    }

    sendMember(member: any) {
        this.memberSubject.next(member);
    }

    sendTask(task: any) {
        this.taskSubject.next(task);
    }

    sendCustomer(customer: any) {
        this.customerSubject.next(customer);
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

    // sendListData(data: any) {
    //     this.menulistSubject.next(data);
    // }
    sendMemberList(list: any[]) {
        this.memberlistSubject.next(list);
    };

    sendTaskMembers(list: any[]) {
        this.taskMembersSubject.next(list);
    }

    sendSignalToDialog(data: any) {
        this.dialogSubject.next(data);
    }

}