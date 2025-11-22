import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RegistrationComponent } from '../registration/registration.component';
import { FormsModule } from '@angular/forms';
import { APIService } from '../services/api.service';
import { response } from 'express';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-adminpanel',
  imports: [CommonModule, FormsModule, RegistrationComponent],
  templateUrl: './adminpanel.component.html',
  styleUrl: './adminpanel.component.scss'
})
export class AdminpanelComponent {
  apiservice = inject(APIService);
  globelservice = inject(GlobalService);
  email: string = '';
  foundMembers: any[] = [];
  currentMember: any;
  isfound: boolean = false;
  findeMember() {
    console.log(this.email);
    this.apiservice.getData(`users/email-check/${this.email}`).subscribe({
      next: (response) => {
        console.log(response);
        this.foundMembers = response;
        this.isfound = true;
      }
    })
  }

  setCurrentMember(index: number) {
    const member = this.foundMembers[index];
    this.currentMember = member;
console.log(this.currentMember);



    this.isfound = false;
  }

  sendResetEmail() {
    const uid = this.currentMember.id
    const requestData = {
      user_id: uid
    }
    this.apiservice.postData('admin-reset-password/', requestData).subscribe({
      next:(response)=>{
        console.log(response);
        
      }
    })
  }
}
