import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { APIService } from '../services/api.service';
import { DataService } from '../services/data.service';
import { ObservableService } from '../services/observable.service';
import { UserService } from '../services/user.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-messagewrapper',
  imports: [CommonModule],
  templateUrl: './messagewrapper.component.html',
  styleUrl: './messagewrapper.component.scss'
})
export class MessagewrapperComponent {
  apiservice = inject(APIService);
  dataservice = inject(DataService);
  userservice = inject(UserService);
  observservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  private destroy$ = new Subject<void>();
  user: any;
  notifications: any[] = [];


  ngOnInit() {
    this.loadUser();
    this.subscribeNotifications();

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser() {
    this.userservice.getUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.user = user;
        this.loadNotifications(user.id)
      }
    });
  }

  subscribeNotifications() {
    this.observservice.notificationSubject$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.user) {
        this.loadNotifications(this.user.id)
      }
    });
  }




  loadNotifications(id: number) {
    this.apiservice.getData(`notifications/user/${id}`).subscribe({
      next: (response) => {
        this.notifications = response.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      }
    })
  }


  openMessage(message: any) {
    this.globalservice.navigateToPath(message.url);
    this.globalservice.messageWrapperOpen = false;
    this.updateMessageState(message.id);
  }

  updateMessageState(id: number) {
    const data = {
      is_read: true,
    }
    this.apiservice.patchData(`notifications/${id}/`, data).subscribe({
      next: (response) => {
        // this.loadSystemMessages
        this.observservice.sendNotification(this.notifications)
      }
    })
  }


}
