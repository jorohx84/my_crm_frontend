import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { APIService } from '../services/api.service';
import { ObservableService } from '../services/observable.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ListmenuComponent } from '../listmenu/listmenu.component';
import { response } from 'express';
@Component({
  selector: 'app-contacts',
  imports: [CommonModule, FormsModule, ListmenuComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {
  apiservice = inject(APIService);
  observerservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  route = inject(ActivatedRoute);
  customerID: string = '';
  contacts: any[] = [];
  allContacts: any[] = [];
  searchValue: string = '';
  private destroy$ = new Subject<void>();
  pageSize: number = 25;
  currentPage: number = 1;
  currentSearchFilter: any;
  totalCount: number | null = null;
  next: string | null = null;
  isLoaded: boolean = false;
  contactTypes = [
    { fieldName: 'name', displayName: 'Name' },
    { fieldName: 'email', displayName: 'E-Mail' },
    { fieldName: 'department', displayName: 'Abteilung' },
  ]


  contactFields = [
    { field: 'name', label: 'Name' },
    { field: 'position', label: 'Position' },
    { field: 'function', label: 'Funktion' },
    { field: 'department', label: 'Abteilung' },
    { field: 'email', label: 'E-Mail' },
    { field: 'phone', label: 'Telefon' },
  ];

  constructor() {
    this.globalservice.setCustomerSidebarState();
  }

  ngOnInit() {
    this.loadDataUrl();
    this.searchValue = '';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDataUrl() {
    this.route.parent?.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('customer_id');
      if (id) {
        this.customerID = id;
        console.log(id);
        this.loadContacts(id, 1);
      }
    });
  }

  changeList(response:any){
    if (response) {
        this.setList(response);
        if (this.searchValue) {
          this.searchContact();
        } else {
          this.loadContacts(this.customerID, 1);
        }
      }
  }

  setList(data: any) {
    this.pageSize = data.size;
    this.searchValue = data.value;
    this.currentSearchFilter = data.filter;

  }


  loadContacts(id: string, page: number = 1) {
    this.currentPage = page;
    this.apiservice.getData(`contacts/${id}/?page=${page}&size=${this.pageSize}`).subscribe({
      next: (response) => {
        this.buildContactList(response);
        this.totalCount = response.count;
        this.isLoaded = true;

      }
    })
  }

  buildContactList(data: any) {
    this.next = data.next;
    this.contacts = data.results;
    this.allContacts = data.results;
  }

  openContact(index: number) {
    const currentContact = this.contacts[index];
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.customerID, 'singlecontact', currentContact.id, 'activities'], { actlist: 'contact' });
  }



  searchContact() {
    if (this.searchValue.length > 0) {
      const field = this.currentSearchFilter.fieldName;
      const value = this.searchValue;
      this.apiservice.getData(`contact/search/${field}/${value}/${this.customerID}`).subscribe({
        next: (response) => {
          this.contacts = response.results;
        }
      })
    }
  }

}
