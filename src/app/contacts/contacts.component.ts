import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { APIService } from '../services/api.service';
import { ObservableService } from '../services/observable.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacts',
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {
  apiservice = inject(APIService);
  observerservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  route = inject(ActivatedRoute);
  customerID: string | null = '';
  contacts: any[] = [];
  currentContact: any={
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
  constructor() {
    this.globalservice.toggleSidebar(false)
  }

  ngOnInit() {
    this.loadDataUrl();
    this.subscribeContact();
  }

  loadDataUrl() {
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      this.customerID = id;
      if (id) {
        console.log(id);
        this.loadContacts(id);
      }
    });
  }

  subscribeContact() {
    this.observerservice.contactSubject$.subscribe((contact) => {
      if (contact) {
        console.log(contact.customer);
        const customerId = contact.customer
        this.loadContacts(customerId);
      }

    })
  }

  loadContacts(id: string) {
    this.apiservice.getData(`contacts/${id}/`).subscribe({
      next: (response) => {
        console.log(response);
        this.contacts = response;
        this.currentContact=response[0];
      }
    })
  }

  openContact(index:number){
    console.log(index);
    this.currentContact=this.contacts[index];
    console.log(this.currentContact);
    
  }
}
