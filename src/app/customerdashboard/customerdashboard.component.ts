import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GlobalService } from '../services/global.service';
import { DataService } from '../services/data.service';
import { APIService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { ObservableService } from '../services/observable.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { createCustomerModel } from '../models/customer.models';

@Component({
  selector: 'app-customerdashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './customerdashboard.component.html',
  styleUrl: './customerdashboard.component.scss'
})
export class CustomerdashboardComponent {
  globalservice = inject(GlobalService);
  apiservice = inject(APIService);
  userservice = inject(UserService);
  observerservice = inject(ObservableService);
  dataservice = inject(DataService);
  route = inject(ActivatedRoute);
  customer = createCustomerModel();
  customerID: string = '';
  private destroy$ = new Subject<void>();

  constructor() {
    this.globalservice.setCustomerProfileState();
  }

  ngOnInit() {

    this.loadTemaplate();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadTemaplate() {
    this.route.parent?.paramMap.pipe(takeUntil(this.destroy$)).subscribe((param) => {
      const id = param.get('customer_id');
      if (id) {
        this.loadCustomer(id);
        this.customerID = id
      }
    })
  }


  loadCustomer(id: string) {
    this.apiservice.getData(`customers/${id}`).subscribe({
      next: (response) => {
        console.log(response);
        this.customer = response
      }
    })
  }

  updateCustomer() {
    this.apiservice.patchData(`customers/${this.customerID}/`, this.customer).subscribe({
      next: (response) => {
        this.customer = response;
        console.log(response);

      },
      error: (err) => {
        console.log(err);

      }

    })
  }

}
