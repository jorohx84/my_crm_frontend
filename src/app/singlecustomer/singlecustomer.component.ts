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
@Component({
  selector: 'app-singlecustomer',
  imports: [CommonModule, FormsModule, TaskwrapperComponent, RouterOutlet],
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
  customer = this.userservice.emptyCustomer; //das leere objekt falls daten zu spät geladen werde und ngModel darauf zugreifen möchte
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
      const id = params.get('id');
      this.customerID = id
      if (id) {
        this.loadCustomer(id)
        // this.loadTasks(id)
      }

    });

    // this.observerservice.taskSubject$.subscribe((data) => {
    //   this.loadTasks(this.customerID);
    // })

  }

  // loadTasks(id: string | number | null = null) {
  //   this.apiservice.getData(`tasks/${id}`).subscribe({
  //     next: (response) => {
  //       console.log(response);
  //       this.tasks = response;
  //     }
  //   })
  // }


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
        console.log(response);
        this.isEdit = false
        this.isDelete = true;
      },
      error: (err) => {
        console.log(err);
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


  changeFolder(folderKey: string) {
    this.folder = folderKey
    console.log(this.folder);
    this.dataservice.saveDataToLocalStorage('folder', folderKey);

  }



}

