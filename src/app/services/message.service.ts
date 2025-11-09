import { inject, Injectable } from "@angular/core";
import { APIService } from "./api.service";
import { ObservableService } from "./observable.service";

Injectable

@Injectable({
    providedIn: 'root'
})

export class MessageService {
    apiservice = inject(APIService);
    observerservice = inject(ObservableService);

    sendSystemMessage(userID: number, assignee: number, url: any[], text: string, param: any) {
        console.log(param);
        
        const requestData = this.createSystemMessage(assignee, url, text, param)
        this.apiservice.postData('system-messages/', requestData).subscribe({
            next: (response) => {
                console.log(response);
                this.observerservice.sendSystemMessages([]);
            }
        })

    }

    createSystemMessage(assignee: number, url: any[], text: string, param: any = null) {
        const messageData = {
            recipient: assignee,
            text: text,
            url: url,
            param: param,
        }
        return messageData
    }

}