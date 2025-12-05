import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { response } from 'express';
import { ObservableService } from '../services/observable.service';
import { GlobalService } from '../services/global.service';
import { Subject, takeUntil } from 'rxjs';
import { createContactModel } from '../models/contact.model';

@Component({
  selector: 'app-contactwrapper',
  imports: [CommonModule, FormsModule],
  templateUrl: './contactwrapper.component.html',
  styleUrl: './contactwrapper.component.scss'
})
export class ContactwrapperComponent {
  apiservice = inject(APIService);
  observerservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  route = inject(ActivatedRoute);
  customerID: string | null = null;
  private destroy$ = new Subject<void>();
  contact = createContactModel();
  noCustomer: boolean = true;
  ngOnInit() {
    this.subscribeCustomer();
    // this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((param) => {
    //   const id = param.get('customer_id');
    //   if (id) {
    //     this.customerId = id;
    //   }
    //   console.log(this.customerId);

    // })
  }

  subscribeCustomer() {
    this.observerservice.customerSubject$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.customerID = res
     

    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  createContact(form: NgForm) {
    if (!form.valid) {
      form.control.markAllAsTouched();
      return
    }

    const requestData = this.createRequestData();
    this.saveContact(requestData, form);
  }

  saveContact(data: any, form: NgForm) {
    this.apiservice.postData('contacts/', data).subscribe({
      next: (response) => {
        console.log(response);
        const contactId = response.id
        this.observerservice.sendContact(response);
        this.observerservice.sendConfirmation('Kontakt wurde erfolgreich angelegt');
        this.resetFrom(form)
        this.globalservice.navigateToPath(['main', 'singlecustomer', this.customerID, 'singlecontact', contactId, 'activities'], { actlist: 'contact' })
      }
    })

  }

  createRequestData() {
    return {
      customer: this.customerID,
      name: this.contact.name,
      position: this.contact.position,
      function: this.contact.function,
      department: this.contact.department,
      phone: this.contact.phone,
      email: this.contact.email,
    }
  }

  resetFrom(form: NgForm) {
    form.reset()
    this.globalservice.contactWrapperOpen = false;
    this.globalservice.isoverlay = false;
  }

}
