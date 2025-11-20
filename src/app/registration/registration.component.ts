import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user.model';
import { APIService } from '../services/api.service';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-registration',
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  apiservice = inject(APIService);
  dataservice = inject(DataService);
  userservice=inject(UserService);
  router = inject(Router);
  user = new User();
  isSend: boolean = false;
  isValid: boolean = true;
  isPasswordVisibility: boolean = false;
  isrepPasswordVisibility: boolean = false;



  // ngOnInit(){
  //   this.userservice.getUser().subscribe((user)=>{
  //     if (user) {
  //       console.log(user);
  //       this.adminUser=user
  //     }
  //   })
  // }

  onSubmit(data: any) {
    this.isSend = true
    console.log(this.user.tenant);
    
    const registrationData = {
      first_name: this.user.firstname,
      last_name: this.user.lastname,
      email: this.user.email,
      password: this.user.password,
      repeated_password: this.user.repeated_password,
    }

    console.log(registrationData);
    this.apiservice.postData('registration/', registrationData).subscribe({
      next: (response) => {
        console.log('user registration was successful', response);
        // Object.entries({
        //   'auth-TOKEN': response.token,
        //   'auth-ID': response.user_id,
        //   'auth-NAME': response.username,
        // }).forEach(([key, value]) => {
        //   if (value) {
        //     this.dataservice.saveDataToLocalStorage(key, value)
        //   }
        // });
        // this.isValid = true
        // this.isSend = false;
        this.router.navigate(['main', 'dashboard']);
      },
      error: (err) => {
        console.error('Error:', err)
        this.isValid = false;
      }
    });
  }


  changeVisibility(id: string) {
    const input = document.getElementById(id) as HTMLInputElement;
    if (id === 'password') {
      this.isPasswordVisibility = !this.isPasswordVisibility
      input.type = this.isPasswordVisibility ? 'text' : 'password';
    }

    if (id === 'repeated_password') {
      this.isrepPasswordVisibility = !this.isrepPasswordVisibility
      input.type = this.isrepPasswordVisibility ? 'text' : 'password';
    }





  }
}
