import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { response } from 'express';
import { ObservableService } from '../services/observable.service';
@Component({
  selector: 'app-contactwrapper',
  imports: [CommonModule, FormsModule],
  templateUrl: './contactwrapper.component.html',
  styleUrl: './contactwrapper.component.scss'
})
export class ContactwrapperComponent {
  apiservice = inject(APIService);
  observerservice = inject(ObservableService);
  route = inject(ActivatedRoute);
  customerId: string | null = null;
  contact: any = {
    name: '',
    position: '',
    function: '',
    department: '',
    phone: '',
    email: '',
    is_active: '',
    newsletter_opt_in: '',
    notes: '',
    last_contact: '',
    last_contact_by: '',
    created_at: '',
    created_by: '',
    updated_at: '',
    updated_by: '',
  }

  ngOnInit() {
    this.route.paramMap.subscribe((param) => {
      const id = param.get('id');
      this.customerId = id;
    })
  }


  createContact(form: NgForm) {
    if (!form.valid) {
      form.control.markAllAsTouched();
      return
    }

    const requestData = this.createRequestData();
    this.saveContact(requestData);
  }

  saveContact(data: any) {
    this.apiservice.postData('contacts/', data).subscribe({
      next: (response) => {
        console.log(response);
        this.observerservice.sendContact(response);
      }
    })

  }

  createRequestData() {
    return {
      customer: this.customerId,
      name: this.contact.name,
      position: this.contact.position,
      function: this.contact.function,
      department: this.contact.department,
      phone: this.contact.phone,
      email: this.contact.email,
    }
  }

}
