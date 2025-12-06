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
  contact: any | null = null;
  customer: any | null = null;
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
  searchValue: string = '';
  contacts: any[] = [];
  action: string = 'save';

  ngOnInit() {
    this.subscribeDiaolgSignal();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
        this.loadData('customer', id);
      }
    })
  }

  loadContactFromUrl() {
    this.route.firstChild?.firstChild?.paramMap.pipe(takeUntil(this.destroy$)).subscribe((param) => {
      const id = param.get('contact_id');
      if (id) {
        this.loadData('contact', id);
      }
    })
  }

  loadData(listkey: string, id: string) {
    this.apiservice.getData(`${listkey}/${id}`).subscribe({
      next: (res) => {
        console.log(listkey, 'geladen', res);
        if (listkey === 'customer') {
          this.customer = res;
        }
        if (listkey === 'contact') {
          this.contact = res
        }


      }
    })
  }


  setVariabelFromURL() {
    this.isSingleCustomer = this.glo.checkURL('singlecustomer');
    this.isSingleContact = this.glo.checkURL('singlecontact');
    this.noNavigate = this.glo.checkURL('activities');
  }

  changeActivityType(type: string) {
    this.activity.type = type;
  }

  checkValidation(form: NgForm) {
    console.log('Hallo');
    this.typeInvalid = !this.activity.type;
    if (this.typeInvalid || !form.valid) {
      form.control.markAllAsTouched();
      return;
    }
    this.createActivity(form);
  }


  createActivity(form: NgForm) {


    const requestData = this.createActivityData();
    this.saveActivity(requestData, form);
    console.log(this.action);




  }

  saveActivity(data: any, form: NgForm) {
    this.apiservice.postData('activities/', data).subscribe({
      next: (response) => {
        this.obs$.sendActivity(response);
        this.obs$.sendConfirmation('Aktivität wurde erfolgreich angelegt');
        // if (this.action === 'save_and_nav') {
        //   this.glo.navigateToPath(['main', 'singlecustomer', this.customer.id, 'singlecontact', this.contact.id, 'activities'],
        //     {
        //       actlist: 'contact',
        //       activity: response.id,
        //       openActivity: true,
        //     });
        // }
        this.resetForm(form);

      }
    })
  }


  createActivityData() {
    return {
      title: this.activity.title,
      contact: this.contact.id,
      customer: this.customer.id,
      type: this.activity.type,
      description: this.activity.description,
      date: this.activity.date,

    }
  }


  resetForm(form: NgForm) {
    form.reset();
    this.activity.type = '';
    this.typeInvalid = false;
    this.glo.activityWrapperOpen = false;
    this.glo.isoverlay = false;
    setTimeout(() => {
      this.contact = null;
      this.customer = null
      this.searchValue = '';
    }, 300);
  }

  resetContact() {
    this.contact = null;
    this.searchValue = '';
    if (!this.glo.checkURL('singlecustomer')) {
      this.customer = null;
    }
  }


  searchCustomer() {
    console.log(this.searchValue);
    const id = this.customer?.id || null;
    console.log(id);
    const url = this.getURL(id);
    console.log(url);

    this.apiservice.getData(url).subscribe({
      next: (res) => {
        console.log(res);
        this.contacts = res;
        this.isloaded = true;
      }
    })
  }

  getURL(id: string) {
    if (id) {
      return `search/contact/${id}/${this.searchValue}/`
    } else {
      return `search/contact/${this.searchValue}/`
    }
  }


  setContact(selectedContact: any) {
    this.contact = selectedContact;
    console.log(this.contact);
    this.searchValue = this.contact.name
    this.customer = this.contact.customer;
    this.contactListOpen = false;
    this.isloaded = false;
  }
}


