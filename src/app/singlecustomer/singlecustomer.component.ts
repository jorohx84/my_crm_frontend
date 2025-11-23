import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { Customer } from '../models/customer.models';
import { UserService } from '../services/user.service';
import { response } from 'express';
import { ObservableService } from '../services/observable.service';
import { MemberlistComponent } from '../memberlist/memberlist.component';
import { TaskwrapperComponent } from '../taskwrapper/taskwrapper.component';
import { DataService } from '../services/data.service';
import { TasklistComponent } from '../tasklist/tasklist.component';
import { RouterOutlet } from '@angular/router';
import { ContactwrapperComponent } from '../contactwrapper/contactwrapper.component';
import { ActivitywrapperComponent } from '../activitywrapper/activitywrapper.component';
@Component({
  selector: 'app-singlecustomer',
  imports: [CommonModule, FormsModule, TaskwrapperComponent, ContactwrapperComponent, ActivitywrapperComponent, RouterOutlet],
  templateUrl: './singlecustomer.component.html',
  styleUrl: './singlecustomer.component.scss'
})
export class SinglecustomerComponent {
  globalservice = inject(GlobalService);
  apiservice = inject(APIService);
  userservice = inject(UserService);
  observerservice = inject(ObservableService);
  dataservice = inject(DataService);
  route = inject(ActivatedRoute);
  customerID: number | string | null = null;
  customer = this.dataservice.emptyCustomer; //das leere objekt falls daten zu spät geladen werde und ngModel darauf zugreifen möchte
  isOpen: boolean = false;
  isEdit: boolean = false;
  isDelete: boolean = false;
  notfound: boolean = false;
  priority: string = '';
  user: any;
  member: any;
  noMember: boolean = false;

  folder: string = '';

  ngOnInit() {
    this.globalservice.toggleSidebar(true);

    this.route.paramMap.subscribe(params => {
      const id = params.get('customer_id');
      this.customerID = id
      if (id) {
        this.loadCustomer(id)
      
      }

    });

  }

  toggleEditMode() {
    this.isEdit = !this.isEdit
    if (this.isEdit === true) {

    }
    if (this.isEdit === false) {
      this.loadCustomer(this.customerID)
    }
  }

  loadCustomer(id: string | number | null = null) {
    this.apiservice.getData(`customers/${id}/`).subscribe({
      next: (response) => {
        this.customer = response;
      }
    })
  }


  updateCustomer() {
    this.apiservice.patchData(`customers/${this.customerID}/`, this.customer).subscribe({
      next: (response) => {
        this.customer = response;
        this.isEdit = false
        this.isDelete = true;
      },
      error: (err) => {
        this.isDelete = false;
        this.loadCustomer(this.customerID)
      }

    })
  }


  deleteCustomer() {
    this.customer.is_activ = false;
    this.updateCustomer();



    setTimeout(() => {
      if (this.isDelete === true) {
        // this.globalservice.navigateToPath('main/customers');
        this.globalservice.navigateToPath(['main', 'customers']);
        this.isOpen = false;
        this.isDelete = false

      }

    }, 2000);

  }


  // changeFolder(folderKey: string) {
  //   this.folder = folderKey
  //   this.dataservice.saveDataToLocalStorage('folder', folderKey);

  // }


  openActivityForm() {
    this.globalservice.checkURL();
    if (this.globalservice.isSingleContact) {
      this.getContactId();
    }
    this.globalservice.activityWrapperOpen = !this.globalservice.activityWrapperOpen
  }

  getContactId() {
    this.route.firstChild?.paramMap.subscribe((param) => {
      const id = param.get('contact_id');
      this.observerservice.sendContact(id);
    })
  }


}

