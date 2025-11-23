import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { APIService } from '../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { ObservableService } from '../services/observable.service';
import { response } from 'express';


@Component({
  selector: 'app-activitywrapper',
  imports: [CommonModule, FormsModule],
  templateUrl: './activitywrapper.component.html',
  styleUrl: './activitywrapper.component.scss'
})
export class ActivitywrapperComponent {
  apiservice = inject(APIService);
  observerservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  contact: any;
  contactID: string = '';
  contacts: any[] = [];
  customerID: string = '';
  tabKey: string = 'infos';
  typeInvalid: boolean = false;
  contactListOpen: boolean = false;
  activity: any = {
    title: '',
    description: '',
    type: '',
    contact: null,
    customer: null,
    date: '',
  }
  ngOnInit() {
    this.loadContact();
    this.loadCustomer();
  }

  loadContact() {
    this.observerservice.contactSubject$.subscribe((contactId) => {
      if (contactId) {
        this.contactID = contactId;
      }
    })
  }

  loadCustomer() {
    this.route.paramMap.subscribe((param) => {
      const id = param.get('customer_id');
      if (id) {
        this.customerID = id;
      }
    })
  }

  changeActivityType(type: string) {
    this.activity.type = type;
  }

  createActivity(form: NgForm) {
    if (this.activity.type === '') {
      this.typeInvalid = true;
      form.control.markAllAsTouched();
      return
    } else {
      this.typeInvalid = false;
    }
    if (!form.valid) {
      form.control.markAllAsTouched();
      return
    }
    const requestData = this.createActivityData();
    this.saveActivity(requestData);
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.customerID, 'singlecontact', this.contactID]);
    this.resetForm(form);
  }


  saveActivity(data: any) {
    this.apiservice.postData('activities/', data).subscribe({
      next: (response) => {
        this.observerservice.sendActivity(response);

      }
    })
  }

  createActivityData() {
    return {
      contact: this.contactID,
      customer: this.customerID,
      type: this.activity.type,
      description: this.activity.description,
      date: this.activity.date,

    }
  }

  resetForm(form: NgForm) {
    form.reset();
    this.activity.type = '';
    this.contact = undefined;
    this.contactID = '';
    this.globalservice.activityWrapperOpen = false;

  }

  openContactList() {
    this.contactListOpen = true;
    this.apiservice.getData(`contacts/${this.customerID}/`).subscribe({
      next: (response) => {
        this.contacts = response;
      }
    })
  }

  setContact(index: number) {
    this.contact = this.contacts[index]
    this.contactID = this.contact.id
    this.contactListOpen = false;
  }
}
