import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { APIService } from '../services/api.service';
import { Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { DataService } from '../services/data.service';
@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  apiservice = inject(APIService);
  router = inject(Router);
  globalservice = inject(GlobalService);
  dataservice = inject(DataService);
  isVisibility: boolean = false;
  isValid: boolean = false;
  isSend: boolean = false;
  loginData: any = {
    username: '',
    password: '',
  };



  onSubmit(data: any) {
    this.apiservice.postData('login/', this.loginData, false).subscribe({
      next: (response) => {
        console.log('user login was successful', response)
        Object.entries({
          'auth-TOKEN': response.token,
          'auth-ID': response.user_id,
          'auth-NAME': response.username,
        }).forEach(([key, value]) => {
          if (value) {
            this.dataservice.saveDataToLocalStorage(key, value)
          }
        })
        this.isSend = true
        this.isValid = true
        this.resetLogin()

        this.router.navigate(['main/dashboard']);


      },
      error: (err) => {
        console.error('Error:', err)
        this.isValid = false;
        this.isSend = true

      }
    });
  }


  changeVisibility(id: string) {
    this.isVisibility = !this.isVisibility

    const input = document.getElementById(id) as HTMLInputElement;
    input.type = this.isVisibility ? 'text' : 'password';



  }

  resetLogin() {
    setTimeout(() => {
      this.isValid = false;
      this.isSend = false;
      console.log(this.isSend, this.isValid);

    }, 2000);

  }

}

