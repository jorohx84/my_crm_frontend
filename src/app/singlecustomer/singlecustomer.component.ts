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

@Component({
  selector: 'app-singlecustomer',
  imports: [CommonModule, FormsModule, TaskwrapperComponent],
  templateUrl: './singlecustomer.component.html',
  styleUrl: './singlecustomer.component.scss'
})
export class SinglecustomerComponent {
  globalservice = inject(GlobalService);
  apiservice = inject(APIService);
  userservice = inject(UserService);
  observerservice = inject(ObservableService);
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
  tasks: any[] = [];


  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.customerID = id
      if (id) {
        this.loadCustomer(id)
        this.loadTasks()
      }

    });
   
    this.observerservice.taskSubject$.subscribe((data) => {
      this.loadTasks();
    })

  }

  loadTasks() {
    this.apiservice.getData(`tasks/${this.customerID}`).subscribe({
      next: (response) => {
        console.log(response);
        this.tasks = response;
      }
    })
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
        console.log(response);

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
        this.globalservice.navigateToPath('main/customers');
        this.isOpen = false;
        this.isDelete = false

      }

    }, 2000);

  }



  // findAssignee(input: any) {
  //   console.log(input.value);
  //   const email = input.value;
  //   this.apiservice.getData(`email-check/${email}`).subscribe({
  //     next: (response) => {
  //       console.log(response);
  //       this.task.assignee = response[0];
  //       this.notfound = response.length === 0 ? true : false;

  //     },
  //     error: (err) => {
  //       this.notfound = true;
  //     }
  //   })



  // }


}

