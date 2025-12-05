import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { APIService } from '../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { ObservableService } from '../services/observable.service';
import { response } from 'express';
import { flatMap, single, Subject, takeUntil } from 'rxjs';
import { ContactlistwrapperComponent } from '../contactlistwrapper/contactlistwrapper.component';
import { createActivityModel } from '../models/activity.model';


@Component({
  selector: 'app-activitywrapper',
  imports: [CommonModule, FormsModule, ContactlistwrapperComponent],
  templateUrl: './activitywrapper.component.html',
  styleUrl: './activitywrapper.component.scss'
})
export class ActivitywrapperComponent {
  apiservice = inject(APIService);
  obs$ = inject(ObservableService);
  glo = inject(GlobalService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  activity = createActivityModel();
  contact: any;
  contactID: string = '';
  isloaded: boolean = false;
  customerID: string = '';
  tabKey: string = 'infos';
  typeInvalid: boolean = false;
  contactListOpen: boolean = false;
  noContact: boolean = false;
  isSingleContact: boolean = false;
  isSingleCustomer: boolean = false;
  noNavigate: boolean = false;
  private destroy$ = new Subject<void>();
  noCustomer: boolean = false;
  searchValue: string = '';
  contacts: any[] = [];
  ngOnInit() {
    // this.subscribeCustomer();
    this.subscribeContact();
    this.subscribeDiaolgSignal();
    this.loadCustomer();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  subscribeContact() {
    this.obs$.contactSubject$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      console.log('Contact ist angekommen', res);
      if (res) {
        console.log(res);
        
        this.setContactData(res);
 

      }
      // this.setVariabelFromURL();
    })
  }

  subscribeCustomer() {
    this.obs$.customerSubject$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      console.log('Customer ist angekommen', res);

      this.customerID = res
      this.noCustomer = this.customerID ? false : true;
      this.setVariabelFromURL();
    })

  }

  subscribeDiaolgSignal() {


    this.obs$.dialogSubject$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      console.log('Signal ausgelöst');
      if (this.glo.checkURL('singlecustomer')) {
        this.loadCustomerFromUrl();
      }
      if (this.glo.checkURL('singlecontact')) {
        this.loadContactFromUrl();
      }
    })

  }

  loadCustomerFromUrl() {
    this.route.firstChild?.paramMap.pipe(takeUntil(this.destroy$)).subscribe((param) => {
      const id = param.get('customer_id');
      if (id) {
        this.customerID = id
      }
    })
  }

  loadContactFromUrl() {
    this.route.firstChild?.firstChild?.paramMap.pipe(takeUntil(this.destroy$)).subscribe((param) => {
      const id = param.get('contact_id');
      if (id) {
        this.contactID = id
      }
    })
  }




  setContactData(data: any) {
    if (typeof data === 'string') {
      this.contactID = data;
    } else {
      this.contact = data;
      this.contactID = data.id;
    }
  }

  setVariabelFromURL() {
    this.isSingleCustomer = this.glo.checkURL('singlecustomer');
    this.isSingleContact = this.glo.checkURL('singlecontact');
    console.log(this.isSingleContact);
    console.log(this.isSingleCustomer);

    this.noNavigate = this.glo.checkURL('activities');
  }


  loadCustomer() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((param) => {
      const id = param.get('customer_id');
      if (id) {
        this.customerID = id;
      }
    })
  }

  changeActivityType(type: string) {
    this.activity.type = type;
  }

  checkValidation(form: NgForm) {
    this.typeInvalid = !this.activity.type;
    this.noContact = !this.contactID;
    if (this.typeInvalid || this.noContact || !form.valid) {
      form.control.markAllAsTouched();
      return;
    }
    this.createActivity(form);
  }


  createActivity(form: NgForm) {
    const requestData = this.createActivityData();
    this.saveActivity(requestData);
    if (!this.noNavigate && !this.isSingleContact) {
      this.glo.navigateToPath(['main', 'singlecustomer', this.customerID, 'activities'], { actlist: 'customer' });
    }
    this.resetForm(form);

  }

  saveActivity(data: any) {
    this.apiservice.postData('activities/', data).subscribe({
      next: (response) => {
        this.obs$.sendActivity(response);
        this.obs$.sendConfirmation('Aktivität wurde erfolgreich angelegt');
      }
    })
  }


  createActivityData() {
    return {
      title: this.activity.title,
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

    this.typeInvalid = false;
    this.glo.activityWrapperOpen = false;
    this.glo.isoverlay = false;
    setTimeout(() => {
      this.contactID = '';
      this.customerID = '';
      this.searchValue = '';
    }, 300);
  }

  // openContactList() {
  //   this.contactListOpen = true;
  //   // this.apiservice.getData(`contacts/${this.customerID}/`).subscribe({
  //   //   next: (response) => {
  //   //     this.contacts = response;
  //   //   }
  //   // })
  //   this.obs$.sendCustomer(this.customerID)
  // }


  // setContact(index: number) {
  //   this.contact = this.contacts[index]
  //   this.contactID = this.contact.id
  //   this.contactListOpen = false;
  //   this.noContact = false;
  // }

  searchCustomer() {
    console.log(this.searchValue);
    this.apiservice.getData(`search/contact/${this.searchValue}/`).subscribe({
      next: (res) => {
        console.log(res);
        this.contacts = res;
        this.isloaded = true;
      }
    })
  }

  setContact(selectedContact: any) {
    this.contact = selectedContact;
    console.log(this.contact);
    this.searchValue = this.contact.name
    this.customerID = this.contact.customer.id;
    this.contactID = this.contact.id;
    this.contactListOpen = false;
    this.isloaded = false;
  }
}


