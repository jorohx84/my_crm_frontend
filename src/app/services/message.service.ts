import { inject, Injectable } from "@angular/core";
import { APIService } from "./api.service";
import { ObservableService } from "./observable.service";
import { UserService } from "./user.service";

Injectable

@Injectable({
    providedIn: 'root'
})

export class MessageService {
    apiservice = inject(APIService);
    userservice = inject(UserService);
    observerservice = inject(ObservableService);
    websocket: WebSocket | null = null;


    constructor() {
        this.loadUser();
    }

    loadUser() {
        this.userservice.getUser().subscribe((user) => {
            if (user) {
                this.loadWebsocket(user.id);
            }
        })
    }

    loadWebsocket(id: number) {
        if (this.websocket && this.websocket.readyState !== WebSocket.CLOSED) {
            console.log("WebSocket bereits geöffnet");
            return;
        }

        this.websocket = new WebSocket(`ws://localhost:8000/ws/notifications/${id}/`);

        this.websocket.onopen = () => console.log("✅ WebSocket geöffnet!");
        this.websocket.onerror = e => console.error("❌ Fehler:", e);
        this.websocket.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            console.log("📩 Nachricht:", notification);

            this.observerservice.sendNotification(notification);

        };
    }









    // sendSystemMessage(userID: number, assignee: number, url: any[], text: string, param: any) {
    //     console.log(param);

    //     const requestData = this.createSystemMessage(assignee, url, text, param)
    //     this.apiservice.postData('system-messages/', requestData).subscribe({
    //         next: (response) => {
    //             console.log(response);
    //             this.observerservice.sendSystemMessages([]);
    //         }
    //     })

    // }

    // createSystemMessage(assignee: number, url: any[], text: string, param: any = null) {
    //     const messageData = {
    //         recipient: assignee,
    //         text: text,
    //         url: url,
    //         param: param,
    //     }
    //     return messageData
    // }

}