import { Component, inject, output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DataService } from '../services/data.service';
import { subscribeOn } from 'rxjs';
import { ObservableService } from '../services/observable.service';
import { response } from 'express';
import { ActivitywrapperComponent } from '../activitywrapper/activitywrapper.component';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-singlecontact',
  imports: [CommonModule, FormsModule, ActivitywrapperComponent],
  templateUrl: './singlecontact.component.html',
  styleUrl: './singlecontact.component.scss'
})
export class SinglecontactComponent {
  route = inject(ActivatedRoute);
  apiservice = inject(APIService);
  dataservice = inject(DataService);
  observerservice = inject(ObservableService);
  globalservice = inject(GlobalService);
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



  contactID: string = '';
  tabKey: string = 'infos';



  types: { [key: string]: { path: string; label: string; } } = {
    call: {
      path: './icons/phone.svg',
      label: 'Anruf'
    },
    invite: {
      path: './icons/invite.svg',
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

  activityFields = [  //hier werden die felder der Tabelle hinzugefügt!!!!!
    { fieldName: 'type', displayName: 'Typ' },
    { fieldName: 'date', displayName: 'Datum' },
    { fieldName: 'description', displayName: 'Beschreibung' },
    { fieldName: 'user', displayName: 'Mitarbeiter' },

  ];

  ngOnInit() {
    this.loadTemplate()
    this.subscribeActivity();
    this.dataservice.saveDataToLocalStorage('sidebarOpen', false);
  }

  subscribeActivity() {
    this.observerservice.activtySubject$.subscribe((activityData) => {
      if (activityData) {
        this.loadActivities(this.contact.id)
      }

    })
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
        this.contact = response;
        this.loadActivities(response.id)
      }
    })
  }

  loadActivities(id: string) {
    this.apiservice.getData(`activities/${id}`).subscribe({
      next: (response) => {
        this.activities = response.sort((a:any, b:any)=> new Date(b.date).getTime() - new Date(a.date).getTime());
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
        this.observerservice.sendContact(response); // entfernen falls die Kontaktliste separierte wird
      }
    });
  }

  changeTab(tab: string) {
    this.tabKey = tab;
    this.dataservice.saveDataToLocalStorage('contactTab', tab);
  }



  openActivityForm() {
    this.observerservice.sendContact(this.contact);
    this.globalservice.activityWrapperOpen = true
  }

  backToContactList() {
    const customerID = this.contact.customer;
    this.globalservice.navigateToPath(['main', 'singlecustomer', customerID, 'contacts']);
  }
}
