import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { DataService } from '../services/data.service';
import { GlobalService } from '../services/global.service';
import { APIService } from '../services/api.service';
import { ObservableService } from '../services/observable.service';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { response } from 'express';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ContactlistwrapperComponent } from '../contactlistwrapper/contactlistwrapper.component';
import { ListmenuComponent } from '../listmenu/listmenu.component';


@Component({
  selector: 'app-activities',
  imports: [CommonModule, FormsModule, ContactlistwrapperComponent, ListmenuComponent],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss'
})
export class ActivitiesComponent {
  activityListType: string | null = '';
  dataservice = inject(DataService);
  apiservice = inject(APIService);
  observservice = inject(ObservableService);
  userservice = inject(UserService);
  globalservice = inject(GlobalService);
  router = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  activities: any[] = [];
  allActivities: any[] = [];
  searchValue: string = '';
  customerID: string = '';
  contactID: string = '';
  startTime: string = '';
  endTime: string = '';
  isfiltered: boolean = false;
  activityOpen: boolean = false;
  editInvalid: boolean = false;
  editDateOpen: boolean = false;
  contactListOpen: boolean = false;
  editTypeOpen: boolean = false;
  currentActivity: any = {
    title: '',
    description: '',
    type: '',
    contact: null,
    customer: null,
    date: '',
  }

  activityFields = [  //hier werden die felder der Tabelle hinzugefügt!!!!!
    { fieldName: 'type', displayName: 'Typ' },
    { fieldName: 'date', displayName: 'Datum' },
    { fieldName: 'description', displayName: 'Beschreibung' },
    { fieldName: 'user', displayName: 'Mitarbeiter' },
    { fieldName: 'customer', displayName: 'Firma' },
    { fieldName: 'contact', displayName: 'Kontakt' },

  ];

  pageSize: number = 25;
  currentPage: number = 1;
  // totalPages: number | null = null;
  next: string | null = null;
  previous: string | null = null;
  listID: string = '';
  apiKey: string = '';
  totalCount: number | null = null;
  constructor() {
    this.globalservice.setCustomerSidebarState();
  }

  ngOnInit() {
    this.loadTemplate();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTemplate() {
    combineLatest([this.router.queryParamMap, this.router.parent!.paramMap]).pipe(takeUntil(this.destroy$)).subscribe(([query, params]) => {
      const listType = query.get('actlist');
      const paramID = listType === 'contact' ? 'contact_id' : 'customer_id';
      const id = params.get(paramID);
      if (!id) return;
      this.listID = id;
      listType === 'contact' ? this.contactID = id : this.customerID = id;
      const apiKey = paramID.replace('_id', '');
      this.apiKey = apiKey;
      this.loadActivities(id, apiKey, 1);
    });

    this.subscribeActivities();
    this.subscribeContact();
    this.subscribeListMenuData();
  }


  loadActivities(id: string, key: string, page: number = 1) {
    this.currentPage = page;
    console.log(this.pageSize);

    this.apiservice.getData(`activities/${key}/${id}/?page=${page}&size=${this.pageSize}`).subscribe({
      next: (response) => {
        console.log(response);
        this.next = response.next;
        this.previous = response.previous
        this.activities = response.results
        this.allActivities = response.results;
        this.totalCount = response.count;
        this.observservice.sendListCount(response.count);
        // const sortedList = this.globalservice.sortListbyTime(response, 'date');
        // this.activities = sortedList;
        // this.allActivities = sortedList;
      }
    })

  }
  subscribeListMenuData() {
    this.observservice.menulistSubject$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response) {
        console.log(response);
        this.pageSize = response.size;
        this.searchValue = response.value;
        // this.currentSearchFilter = response.filter
        this.loadActivities(this.listID, this.apiKey, response.page);
      }
    })
  }

  subscribeActivities() {
    this.observservice.activitySubject$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        if (this.totalCount) {
          this.totalCount ++;
          this.observservice.sendListCount(this.totalCount)
        }
      }
    })
  }

  subscribeContact() {
    this.observservice.contactSubject$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        this.currentActivity.contact = data;
        this.contactListOpen = false;
        this.editActivity('contact');
      }
    })
  }


  searchInActivities() {
    if (this.searchValue.length > 0) {
      console.log(this.searchValue);
      const value = this.searchValue.toLowerCase();
      const foundActivities: any[] = [];

      for (let index = 0; index < this.allActivities.length; index++) {
        const activity = this.allActivities[index];
        if (activity.title.toLowerCase().includes(value)
          || activity.contact.name.toLowerCase().includes(value)
          || activity.created_by.profile.fullname.toLowerCase().includes(value)
          || this.dataservice.activityTypes[activity.type].label.toLowerCase().includes(value)) {
          foundActivities.push(activity);
        }
      }
      this.activities = foundActivities;

    } else {
      this.activities = this.allActivities
    }
  }

  filterActivitiesToDate() {
    const foundActivities = this.globalservice.filterToDate(this.allActivities, this.startTime, this.endTime);
    if (foundActivities) {
      this.activities = foundActivities;
      this.isfiltered = true
    } else {
      this.isfiltered = false;
    }
  }


  resetTimeFilter() {
    this.isfiltered = false;
    this.activities = this.allActivities;
    this.endTime = '';
    this.startTime = '';
  }

  openActivity(index: number) {
    this.currentActivity = this.activities[index];
    console.log(this.currentActivity);
    this.activityOpen = true
  }

  editActivity(key: string) {
    const aid = this.currentActivity.id
    const data: any = this.getData(key);
    this.editInvalid = this.validateData(data[key]) ? true : false;
    if (this.editInvalid) { return }
    this.saveEdit(aid, data);
  }


  saveEdit(aid: string, data: any) {
    this.apiservice.patchData(`activity/${aid}/`, data).subscribe({
      next: (response) => {
        // this.observservice.sendActivity(response);
        const updatedActivity = this.currentActivity
        this.activities = this.activities.map(a =>
          a.id === updatedActivity.id ? updatedActivity : a
        );
        this.allActivities = this.activities;

      }
    })
  }

  getData(key: string) {
    if (key === 'contact') {
      return { contact: this.currentActivity.contact.id }
    } else {
      return { [key]: this.currentActivity[key] }
    }
  }


  validateData(value: any) {
    return value === '' || value === null || value === undefined
  }


  openContactList() {
    const cid = this.currentActivity.customer.id
    this.observservice.triggerloadCustomer(cid);
    this.contactListOpen = true

  }

  closeActivity() {
    if (this.editInvalid) {
      return
    }
    this.activityOpen = false;
    this.editInvalid = false;
  }

  editType(type: string) {
    console.log(type);
    this.currentActivity.type = type;
    this.editActivity('type');
    this.editTypeOpen = false
  }
}

