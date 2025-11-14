import { Component, inject, output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DataService } from '../services/data.service';
import { subscribeOn } from 'rxjs';
import { ObservableService } from '../services/observable.service';
import { response } from 'express';

@Component({
  selector: 'app-singlecontact',
  imports: [CommonModule, FormsModule],
  templateUrl: './singlecontact.component.html',
  styleUrl: './singlecontact.component.scss'
})
export class SinglecontactComponent {
  route = inject(ActivatedRoute);
  apiservice = inject(APIService);
  dataservice = inject(DataService);
  observerservice = inject(ObservableService);
  activities: any[] = [];
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
  };

  activity: any = {
    title: '',
    description: '',
    type: '',
    contact: null,
    customer: null,
    date: '',
  }

  contactID: string = '';
  tabKey: string = 'infos';
  typeInvalid: boolean = false;



  types: { [key: string]: { path: string; label: string; } } = {
    call: {
      path: './icons/phone.svg',
      label: 'Anruf'
    },
    invite: {
      path: './icons/phone.svg',
      label: 'Besuch'
    },
    video: {
      path: './icons/phone.svg',
      label: 'Video Call'
    },
    email: {
      path: './icons/mail.svg',
      label: 'E-Mail'
    },
  };

  ngOnInit() {
    this.loadTemplate()
  }


  loadTemplate() {
    this.loadIDFromURL();
    this.tabKey = this.dataservice.getDataFromLocalStorage('contactTab');
  }


  loadIDFromURL() {
    this.route.paramMap.subscribe((param) => {
      const id = param.get('contact_id')
      if (id) {
        this.contactID = id
        this.loadContact(id);
        // this.tabKey = 'infos';
      }

    })
  }

  loadContact(id: string) {
    this.apiservice.getData(`contact/${id}`).subscribe({
      next: (response) => {
        console.log(response);
        this.contact = response;
        this.loadActivities(response.id)
      }
    })
  }

  loadActivities(id: string) {
    this.apiservice.getData(`activities/${id}`).subscribe({
      next: (response) => {
        console.log(response);
        this.activities = response;
      }
    })
  }

  updateContact(changeKey: string) {
    if (changeKey === 'newsletter_opt_in') {
      this.contact.newsletter_opt_in = !this.contact.newsletter_opt_in
    }
    const data = {
      [changeKey]: this.contact[changeKey],

    }
    this.apiservice.patchData(`contact/${this.contactID}/`, data).subscribe({
      next: (response) => {
        console.log(response);
        this.observerservice.sendContact(response); // entfernen falls die Kontaktliste separierte wird
      }
    });
  }

  changeTab(tab: string) {
    this.tabKey = tab;
    this.dataservice.saveDataToLocalStorage('contactTab', tab);
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
    console.log(requestData);
    this.saveActivity(requestData);
    this.resetForm(form);

  }


  saveActivity(data: any) {
    this.apiservice.postData('activities/', data).subscribe({
      next: (response) => {
        console.log(response);
        this.loadActivities(response.contact)
      }
    })
  }

  createActivityData() {
    return {
      contact: this.contact.id,
      customer: this.contact.customer,
      type: this.activity.type,
      description: this.activity.description,
      date: this.activity.date,

    }
  }

  changeActivityType(type: string) {
    this.activity.type = type;
    console.log(this.activity);

  }

  resetForm(form: NgForm) {
    form.reset();
    this.tabKey = 'activities';
    this.activity = null
  }

  openActivity(index:number){
    this.activity=this.activities[index];
    console.log(this.activity);
    
  this.changeTab('new');
  }
}
