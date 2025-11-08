import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { APIService } from '../services/api.service';
import { DataService } from '../services/data.service';
import { ObservableService } from '../services/observable.service';
import { UserService } from '../services/user.service';
import { subscribeOn } from 'rxjs';
import { response } from 'express';


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
  user: any;
  systemMessages: any[] = [];
  ngOnInit() {
    this.userservice.getUser().subscribe((user) => {
      if (user) {
        this.user = user;
        this.loadSystemMessages(user.id)
      }

    });

    this.observservice.systemMessagesSubject$.subscribe(() => {
      this.loadSystemMessages(this.user.id)
    })
  }

  loadSystemMessages(id: number) {
    this.apiservice.getData(`system-messages/user/${id}`).subscribe({
      next: (response) => {
        console.log(response);
        this.systemMessages = response;
      }
    })
  }


  openMessage(message: any) {
    // this.globalservice.navigateToPath(message.url);
    // this.globalservice.messageWrapperOpen = false;
    this.updateMessageState(message.id);
  }

  updateMessageState(id: number) {
    const data = {
      is_read: true,
    }
    this.apiservice.patchData(`system-messages/${id}/`, data).subscribe({
      next: (response) => {
        console.log(response.is_read);

        this.loadSystemMessages
        this.observservice.sendSystemMessages(this.systemMessages)
      }
    })
  }


}
