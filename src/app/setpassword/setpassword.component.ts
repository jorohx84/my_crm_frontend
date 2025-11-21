import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-setpassword',
  imports: [CommonModule, FormsModule],
  templateUrl: './setpassword.component.html',
  styleUrl: './setpassword.component.scss'
})
export class SetpasswordComponent {
  apiservice = inject(APIService);
  globalservice =inject(GlobalService);
  route = inject(ActivatedRoute);
  uidb64: string = '';
  token: string = '';
  user: any = {
    password: '',
    repeated_password: '',
  }
  isSend: boolean = false;
  isValid: boolean = true;
  isPasswordVisibility: boolean = false;
  isrepPasswordVisibility: boolean = false;
  ngOnInit() {
    this.getData();
  }

  getData() {
    this.uidb64 = this.route.snapshot.paramMap.get('uidb64')!;
    this.token = this.route.snapshot.paramMap.get('token')!;
    console.log(this.uidb64);
    console.log(this.token);
  }
  setPassword(form: NgForm) {
    if (form.invalid) {
      return
    }
    this.isSend = true
    if (this.user.password !== this.user.repeated_password) {
      this.isValid = false;
      return
    } else {
      this.isValid = true
    }
    const requestData = {
      uid: this.uidb64,
      token: this.token,
      password: this.user.password,
    }

    this.apiservice.postData('reset-password/', requestData, false).subscribe({
      next: (response) => {
        console.log(response);
        this.isSend = false;
        this.isValid = true;
        this.globalservice.navigateToPath([''])
      }
    })

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
