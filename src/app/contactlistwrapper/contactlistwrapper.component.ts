import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { APIService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ObservableService } from '../services/observable.service';

@Component({
  selector: 'app-contactlistwrapper',
  imports: [CommonModule],
  templateUrl: './contactlistwrapper.component.html',
  styleUrl: './contactlistwrapper.component.scss'
})
export class ContactlistwrapperComponent {
  apiservice = inject(APIService);
  observerservice = inject(ObservableService);
  route = inject(ActivatedRoute);

  @Input() contacts: any[] = [];
  @Output() selectedContact = new EventEmitter()
  customerID: string = '';
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // this.subscribeCustomer();

  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // loadCustomer() {
  //   this.route.parent?.paramMap.pipe(takeUntil(this.destroy$)).subscribe((param) => {
  //     if (param) {
  //       this.customerID = param.get('customer_id');
  //       console.log(this.customerID);
  //       this.loadContacts();
  //     }
  //   })
  // }

  // subscribeCustomer() {
  //   this.observerservice.customerSubject$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
  //     if (data) {
  //       this.customerID = data;
  //       this.loadContacts()
  //     }
  //   })
  // }

  setContact(index: number) {
    const contact = this.contacts[index]
    console.log(contact);
    // this.observerservice.sendContact(contact);
    this.selectedContact.emit(contact)
  }


  loadContacts() {
    this.apiservice.getData(`contacts-wrapper/${this.customerID}/`).subscribe({
      next: (response) => {
        this.contacts = response;
        console.log(response);

      }
    })
  }
}
