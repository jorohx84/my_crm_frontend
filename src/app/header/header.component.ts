import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { APIService } from '../services/api.service';
import { DataService } from '../services/data.service';
import { ObservableService } from '../services/observable.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { MessagewrapperComponent } from '../messagewrapper/messagewrapper.component';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, MessagewrapperComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  dataservice = inject(DataService);
  apiservice = inject(APIService);
  observservice = inject(ObservableService);
  userservice = inject(UserService);
  globalservice = inject(GlobalService);
  router = inject(Router);
  private destroy$ = new Subject<void>();
  user: any;
  component: string = '';
  intervalId: any;
  date: string = '';
  isNewMessage: boolean = false;
  systemMessages: any[] = [];
  currentTime: string = '';
  searchInput: string = '';

  constructor() {


  }
  ngOnInit() {
    this.loadUser()
    this.setTime();

    this.observservice.notificationSubject$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadCount();
    })
  }

    ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser() {
    this.userservice.getUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.user = user;
        this.loadCount()
      }

    });
  }


  globalSearch() {
    this.apiservice.getData(`search/${this.searchInput}`).subscribe({
      next: (response) => {
        this.searchInput = '';
        this.observservice.sendSearch(response);
        this.globalservice.searchWrapperOpen = true;
      }
    })
  }

  setTime(): void {
    this.intervalId = setInterval(() => {
      this.date = new Date().toISOString()
    }, 1000);
  }


  logoutUser() {
    this.setLogoutTimeStamp()
    this.apiservice.postData('logout/', {}, true).subscribe({
      next: (res) => {
        console.log('Logout successful');

        localStorage.clear()
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error('Logout error', err);
      }
    })
  }


  setLogoutTimeStamp() {
    const timestamp = {
      last_logout: new Date().toISOString(),
    }
    this.apiservice.patchData(`profile/${this.user.id}/`, timestamp).subscribe({
      next: (response) => {
      }
    })
  }


  openSystemMessages() {
    this.globalservice.messageWrapperOpen = !this.globalservice.messageWrapperOpen;
  }








  loadCount() {
    this.apiservice.getData(`messages/count/`).subscribe({
      next: (response) => {
        const count = response.count;
        this.setRedDot(count)
      }
    })
  }

  setRedDot(count: number) {
    if (count === 0) {
      this.globalservice.isNewSystemMessage = false;
    } else {
      this.globalservice.isNewSystemMessage = true;
    }
  }





}