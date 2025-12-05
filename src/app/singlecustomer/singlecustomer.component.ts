import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { ObservableService } from '../services/observable.service';
import { TaskwrapperComponent } from '../taskwrapper/taskwrapper.component';
import { DataService } from '../services/data.service';
import { RouterOutlet } from '@angular/router';
import { ContactwrapperComponent } from '../contactwrapper/contactwrapper.component';
import { ActivitywrapperComponent } from '../activitywrapper/activitywrapper.component';
import { Subject, takeUntil } from 'rxjs';
import { createCustomerModel } from '../models/customer.models';

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
  obs$ = inject(ObservableService);
  dataservice = inject(DataService);
  route = inject(ActivatedRoute);
  customerID: number | string | null = null;
  customer = createCustomerModel()
  isOpen: boolean = false;
  isEdit: boolean = false;
  isDelete: boolean = false;
  notfound: boolean = false;
  priority: string = '';
  user: any;
  member: any;
  noMember: boolean = false;
  private destroy$ = new Subject<void>();
  folder: string = '';


  constructor() {
    this.globalservice.setCustomerProfileState();
  }
  ngOnInit() {
    console.log(this.customer);

    // this.globalservice.toggleSidebar(true);
    this.loadCustomerFromURL();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCustomerFromURL() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('customer_id');
      this.customerID = id
      if (id) {
        this.loadCustomer(id)
        // this.obs$.sendCustomer(id);
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



  // getContactId() {
  //   this.route.firstChild?.paramMap.pipe(takeUntil(this.destroy$)).subscribe((param) => {
  //     const id = param.get('contact_id');
  //     this.obs$.sendContact(id);
  //   })
  // }


  openContactWrapper() {
    this.globalservice.contactWrapperOpen = true;
    this.globalservice.isoverlay = true;
    this.obs$.sendCustomer(this.customer.id);
  }

  openActivityWrapper() {
    this.globalservice.activityWrapperOpen = true;
    this.globalservice.isoverlay = true;
    this.obs$.sendSignalToDialog(null);
  }
}

