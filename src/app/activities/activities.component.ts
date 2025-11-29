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
    { fieldName: 'created_by', displayName: 'Mitarbeiter' },
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
  currentSearchFilter: any;
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
      this.setTemplateData(query, params);
    });

    this.subscribeActivities();
    this.subscribeContact();
    this.subscribeListMenuData();
  }

  setTemplateData(query: any, params: any) {
    const listType = query.get('actlist');
    const paramID = this.getParamID(listType);
    const id = params.get(paramID);
    if (!id) { return }
    this.setListData(listType, id, paramID);
  }


  setListData(type: string, id: string, paramID: string) {
    this.listID = id;
    type === 'contact' ? this.contactID = id : this.customerID = id;
    const apiKey = paramID.replace('_id', '');
    this.apiKey = apiKey;
    this.loadActivities(id, apiKey, 1);
  }

  getParamID(type: string) {
    return type === 'contact' ? 'contact_id' : 'customer_id';
  }



  loadActivities(id: string, key: string, page: number = 1) {
    this.currentPage = page;
    this.apiservice.getData(`activities/${key}/${id}/?page=${page}&size=${this.pageSize}`).subscribe({
      next: (response) => {
        this.buildActivityList(response);
        this.observservice.sendListCount(response.count);
      }
    });
  }

  buildActivityList(data: any) {
    this.next = data.next;
    this.previous = data.previous
    this.activities = data.results
    this.allActivities = data.results;
  }


  subscribeListMenuData() {
    this.observservice.menulistSubject$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response) {
        this.setList(response);
        if (response.startTime || response.endTime) {
          this.filterActivitiesToDate(response.startTime, response.endTime);
        } else {
          this.loadActivities(this.listID, this.apiKey, response.page);
        }
      }
    })
  }

  setList(data: any) {
    this.pageSize = data.size;
    this.searchValue = data.value;
    this.currentSearchFilter = data.filter;

  }

  subscribeActivities() {
    this.observservice.activitySubject$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        if (this.totalCount) {
          this.totalCount++;
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

  filterActivitiesToDate(starttime: string, endtime: string) {
    const params: any = {};
    if (starttime) params.start = starttime;
    if (endtime) params.end = endtime;
    this.apiservice.getData(`activities/search/${this.apiKey}/${this.listID}/`, params).subscribe({
      next: (response) => {
        this.activities = response.result;
        console.log(response);

      }
    })

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

  searchInActivities() {
    if (this.searchValue.length > 0) {
      const field = this.currentSearchFilter.fieldName;
      const value = this.searchValue;
      this.apiservice.getData(`activities/search/${field}/${value}/${this.apiKey}/${this.listID}/`).subscribe({
        next: (response) => {
          console.log(response);
          this.activities = response.results;
        }
      })
    }
  }
}

