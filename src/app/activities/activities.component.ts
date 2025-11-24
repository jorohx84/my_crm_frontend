import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { DataService } from '../services/data.service';
import { GlobalService } from '../services/global.service';
import { APIService } from '../services/api.service';
import { ObservableService } from '../services/observable.service';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { response } from 'express';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-activities',
  imports: [CommonModule, FormsModule],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss'
})
export class ActivitiesComponent {
  @Input() isContactActivityList: boolean = false;
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

  ; activityFields = [  //hier werden die felder der Tabelle hinzugefügt!!!!!
    { fieldName: 'type', displayName: 'Typ' },
    { fieldName: 'date', displayName: 'Datum' },
    { fieldName: 'description', displayName: 'Beschreibung' },
    { fieldName: 'user', displayName: 'Mitarbeiter' },
    { fieldName: 'customer', displayName: 'Firma' },
    { fieldName: 'contact', displayName: 'Kontakt' },

  ];
  ngOnInit() {
    // this.loadCustomer();
    // this.loadContact();
    this.loadTemplate();
    this.subscribeActivities();
    console.log(this.isContactActivityList);

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTemplate() {
    this.isContactActivityList ? this.loadContact() : this.loadCustomer()
  }

  loadCustomer() {
    this.router.parent?.paramMap.pipe(takeUntil(this.destroy$)).subscribe((param) => {
      const id = param.get('customer_id');
      if (id && this.isContactActivityList === false) {
        this.customerID = id;
        this.loadActivities(id, 'customer');
      }
    })
  }

  loadContact() {
    this.router.paramMap.pipe(takeUntil(this.destroy$)).subscribe((param) => {
      const id = param.get('contact_id');
      if (id && this.isContactActivityList === true) {
        console.log(id);
        this.contactID = id
        this.loadActivities(id, 'contact');
      }
    })
  }

  loadActivities(id: string, key: string) {
    this.apiservice.getData(`activities/${key}/${id}/`).subscribe({
      next: (response) => {
        console.log(response);
        const list = this.sortList(response);
        this.activities = list;
        this.allActivities = list;
      }
    })

  }


  subscribeActivities() {
    this.observservice.activitySubject$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        const id = this.isContactActivityList ? this.contactID : this.customerID;
        const key = this.isContactActivityList ? 'contact' : 'customer'
        console.log(id);

        this.loadActivities(id, key);
      }
    })
  }





  // loadCustomerActivities(id: string) {
  //   console.log('Kunde');

  //   this.apiservice.getData(`activities/customer/${id}/`).subscribe({
  //     next: (response) => {
  //       console.log(response);
  //       const list = this.sortList(response);
  //       this.activities = list;
  //       this.allActivities = list;
  //     }
  //   })

  // }

  sortList(list: any[]) {
    return list.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // loadContactActivities(id: string) {
  //   console.log('Kontakt');

  //   this.apiservice.getData(`activities/contact/${id}/`).subscribe({
  //     next: (response) => {
  //       console.log(response);
  //       const list = this.sortList(response);
  //       this.activities = list;
  //       this.allActivities = list;
  //     }
  //   })

  // }


  searchInActivities() {
    if (this.searchValue.length > 0) {
      console.log(this.searchValue);
      const value = this.searchValue.toLowerCase();
      const foundActivities: any[] = [];

      for (let index = 0; index < this.allActivities.length; index++) {
        const activity = this.allActivities[index];
        if (activity.description.toLowerCase().includes(value)
          || activity.contact.name.toLowerCase().includes(value)
          || activity.user.profile.fullname.toLowerCase().includes(value)
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
}

