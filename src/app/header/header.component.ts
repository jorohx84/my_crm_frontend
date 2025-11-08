import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { APIService } from '../services/api.service';
import { DataService } from '../services/data.service';
import { ObservableService } from '../services/observable.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { TimeInterval } from 'rxjs/internal/operators/timeInterval';
import { MessagewrapperComponent } from '../messagewrapper/messagewrapper.component';
import { response } from 'express';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MessagewrapperComponent],
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
  user: any;
  component: string = '';
  intervalId: any;
  date: string = '';
  isNewMessage: boolean = false;
  systemMessages: any[] = [];
  currentTime: string = '';

  constructor() {


  }
  ngOnInit() {
    this.loadUser()
    this.setTime();
  }

  loadUser() {
    this.userservice.getUser().subscribe((user) => {
      if (user) {
        this.user = user;
        console.log(user);
        this.checkNewMessages(user)
      }

    });
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
        console.log(response);

      }
    })
  }


  openSystemMessages() {
    this.observservice.sendSystemMessages(this.systemMessages);
    this.globalservice.messageWrapperOpen = !this.globalservice.messageWrapperOpen;

    this.updateProfile()
  }

  updateProfile() {
    const data = {
      last_inbox_check: new Date().toISOString()
    }
    this.apiservice.patchData(`profile/${this.user.id}/`, data).subscribe({
      next: (response) => {
        // this.loadUser()

        this.currentTime = response.last_inbox_check;
      }
    })
  }




  checkNewMessages(user: any) {
    // // Zeit aus dem LocalStorage holen (kann null sein)
    // const storedTime = this.dataservice.getDataFromLocalStorage('time');
    // const lastInboxCheck = this.user.last_inbox_check;

    // // In Date-Objekte umwandeln (sicherer Vergleich)
    // const storedDate = storedTime ? new Date(storedTime) : null;
    // const logoutDate = new Date(lastInboxCheck);

    // // Entscheidung, welche Zeit gilt
    // if (!storedDate || storedDate < logoutDate) {
    //   this.currentTime = lastInboxCheck;
    // } else {
    //   this.currentTime = storedTime;
    // }

    // console.log('Aktuelle Vergleichszeit:', this.currentTime);
    this.currentTime = user.last_inbox_check || new Date().toISOString();
    this.loadCount(this.currentTime);
    this.setNewMessageObserver(this.currentTime);
  }

  loadCount(time: string) {
    this.apiservice.getData(`messages/count/${time}`).subscribe({
      next: (response) => {
        // console.log(response);
        const count = response.count;
        this.setRedDot(count)
      }
    })
  }

  setRedDot(count: number) {
    if (count > 0) {
      this.globalservice.isNewSystemMessage = true;
    } else {
      this.globalservice.isNewSystemMessage = false;
    }
  }


  setNewMessageObserver(time: string) {
    // this.currentTime = new Date().toISOString();
    setInterval(() => {

      this.loadCount(this.currentTime);
    }, 1000);
  }

}