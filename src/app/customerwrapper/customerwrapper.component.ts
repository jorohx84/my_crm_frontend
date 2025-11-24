import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Customer } from '../models/customer.models';
import { UserService } from '../services/user.service';
import { APIService } from '../services/api.service';
import { DataService } from '../services/data.service';
import { GlobalService } from '../services/global.service';
import { ObservableService } from '../services/observable.service';

@Component({
  selector: 'app-customerwrapper',
  imports: [CommonModule, FormsModule],
  templateUrl: './customerwrapper.component.html',
  styleUrl: './customerwrapper.component.scss'
})
export class CustomerwrapperComponent {
  globalservice = inject(GlobalService);
  userservice = inject(UserService);
  dataservice = inject(DataService);
  apiservice = inject(APIService);
  observerservice = inject(ObservableService);
  customer = this.dataservice.emptyCustomer;
  isValid: boolean = false;
  isSend: boolean = false;


  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.isSend = true
      this.isValid = false;
      return
    }

    const customerData = this.createCustomerObject();
    console.log(customerData);
    this.apiservice.postData('customers/', customerData).subscribe({
      next: (response) => {
        this.observerservice.triggerloadCustomer(response);
        this.globalservice.customerWrapperOpen = false;
        this.isSend = true
        this.isValid = true
        setTimeout(() => {
          this.resetFormData(form)
        }, 1000);

      },
      error: (err) => {
        console.error("Daten konnten nicht geladen werden", err);
        this.isSend = false
        this.isValid = true
      }
    })

  }
  createCustomerObject() {
    return {
      companyname: this.customer.companyName,
      street: this.customer.street,
      areacode: this.customer.areacode,
      city: this.customer.city,
      country: this.customer.country,
      email: this.customer.email,
      phone: this.customer.phone,
      website: this.customer.website,
      branch: this.customer.branch,

    }
  }

  resetFormData(form: NgForm) {
    this.globalservice.customerWrapperOpen = false
    setTimeout(() => {
      form.resetForm();
      this.customer = new Customer();
      this.isSend = false;
    }, 1000);

    


  }
}
