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
import { FormsModule } from '@angular/forms';
import { subscribeOn } from 'rxjs';

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

    this.observservice.notificationSubject$.subscribe(() => {
      console.log('hallo');

      this.loadCount();
    })
  }

  loadUser() {
    this.userservice.getUser().subscribe((user) => {
      if (user) {
        this.user = user;
        console.log(user);
        // this.loadWebsocket(user.id);
        this.loadCount()
      }

    });
  }

// websocket: WebSocket | null = null;

// loadWebsocket(id: number) {
//   if (this.websocket && this.websocket.readyState !== WebSocket.CLOSED) {
//     console.log("WebSocket bereits geöffnet");
//     return;
//   }

//   this.websocket = new WebSocket(`ws://localhost:8000/ws/notifications/${id}/`);
  
//   this.websocket.onopen = () => console.log("✅ WebSocket geöffnet!");
//   this.websocket.onerror = e => console.error("❌ Fehler:", e);
//   this.websocket.onmessage = (event) => {
//     const notification = JSON.parse(event.data);
//     console.log("📩 Nachricht:", notification);

//     setTimeout(() => {
//          this.loadCount();
//     }, 2000);
 
//   };
// }


  globalSearch() {
    console.log(this.searchInput);
    this.apiservice.getData(`search/${this.searchInput}`).subscribe({
      next: (response) => {
        console.log(response);
        this.searchInput = '';
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
        console.log(response);

      }
    })
  }


  openSystemMessages() {
    // this.observservice.sendNotification(this.systemMessages);
    this.globalservice.messageWrapperOpen = !this.globalservice.messageWrapperOpen;
  }








  loadCount() {
    console.log('count wird geladen')
    
    this.apiservice.getData(`messages/count/`).subscribe({
      next: (response) => {
        console.log(response);
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