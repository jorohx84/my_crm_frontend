import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { APIService } from '../services/api.service';
import { ObservableService } from '../services/observable.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
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
  allContacts: any[] = [];
  searchValue: string = '';
  private destroy$ = new Subject<void>();
  contactFields = [
    { field: 'name', label: 'Name' },
    { field: 'position', label: 'Position' },
    { field: 'function', label: 'Funktion' },
    { field: 'department', label: 'Abteilung' },
    { field: 'email', label: 'E-Mail' },
    { field: 'phone', label: 'Telefon' },
  ];

  constructor() {
    this.globalservice.toggleSidebar(false)
  }

  ngOnInit() {
    this.loadDataUrl();
    this.subscribeContact();
    this.searchValue = '';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDataUrl() {
    this.route.parent?.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('customer_id');
      this.customerID = id;
      if (id) {
        console.log(id);
        this.loadContacts(id);
      }
    });

  }

  subscribeContact() {
    this.observerservice.contactSubject$.pipe(takeUntil(this.destroy$)).subscribe((contact) => {
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
        this.contacts = response.sort((a: any, b: any) => a.name.localeCompare(b.name));
        this.allContacts = response.sort((a: any, b: any) => a.name.localeCompare(b.name));
        this.searchValue = '';
      }
    })
  }

  openContact(index: number) {
    console.log(index);
    const currentContact = this.contacts[index];
    console.log();

    this.globalservice.navigateToPath(['main', 'singlecustomer', this.customerID, 'singlecontact', currentContact.id]);
  }
  searchContact() {

    if (this.searchValue.length > 0) {
      console.log(this.searchValue);
      const searchedContacts: any[] = [];

      for (let index = 0; index < this.allContacts.length; index++) {
        const contact = this.allContacts[index];
        if (contact.name.toLowerCase().includes(this.searchValue.toLowerCase()) || contact.email.toLowerCase().includes(this.searchValue.toLowerCase()) || contact.department.toLowerCase().includes(this.searchValue.toLowerCase())) {
          searchedContacts.push(contact)
        }

      }
      this.contacts = searchedContacts
    }
    else {
      this.contacts = this.allContacts
    }
  }
  // searchContact() {
  //   if (this.searchValue.length > 0) {
  //     this.isSearch = true;
  //     const key: keyof Customer = this.currentSearchFilter.fieldName as keyof Customer;
  //     const searchedCustomers: any[] = [];
  //     for (let index = 0; index < this.allCustomers.length; index++) {
  //       const customer = this.allCustomers[index];
  //       if (customer[key].toLowerCase().includes(this.searchValue.toLowerCase())) {
  //         searchedCustomers.push(customer);
  //         console.log(searchedCustomers);

  //       }
  //     }
  //     this.isFound = searchedCustomers.length > 0 ? true : false;
  //     this.customers = searchedCustomers;
  //   } else {
  //     this.customers = this.allCustomers;
  //     this.isSearch = false;
  //   }
  // }
}
