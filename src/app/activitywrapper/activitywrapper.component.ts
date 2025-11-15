import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { APIService } from '../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { ObservableService } from '../services/observable.service';


@Component({
  selector: 'app-activitywrapper',
  imports: [CommonModule, FormsModule],
  templateUrl: './activitywrapper.component.html',
  styleUrl: './activitywrapper.component.scss'
})
export class ActivitywrapperComponent {
  apiservice = inject(APIService);
  observerservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  route = inject(ActivatedRoute);
  contact: any;
  tabKey: string = 'infos';
  typeInvalid: boolean = false;
  activity: any = {
    title: '',
    description: '',
    type: '',
    contact: null,
    customer: null,
    date: '',
  }
  ngOnInit() {
    this.loadContact();
  }

  loadContact() {
    this.observerservice.contactSubject$.subscribe((contactData) => {
      if (contactData) {
        this.contact = contactData;
        console.log(contactData);

      }
    })
  }

  changeActivityType(type: string) {
    this.activity.type = type;
    console.log(this.activity);

  }

  createActivity(form: NgForm) {
    if (this.activity.type === '') {
      this.typeInvalid = true;
      form.control.markAllAsTouched();
      return
    } else {
      this.typeInvalid = false;
    }
    if (!form.valid) {
      form.control.markAllAsTouched();
      return
    }
    const requestData = this.createActivityData();
    console.log(requestData);
    this.saveActivity(requestData);
    this.resetForm(form);

  }


  saveActivity(data: any) {
    this.apiservice.postData('activities/', data).subscribe({
      next: (response) => {
        console.log(response);
        this.observerservice.sendActivity(response);
      }
    })
  }

  createActivityData() {
    return {
      contact: this.contact.id,
      customer: this.contact.customer,
      type: this.activity.type,
      description: this.activity.description,
      date: this.activity.date,

    }
  }

  resetForm(form: NgForm) {
    form.reset();
    this.activity.type = '';
    this.globalservice.activityWrapperOpen = false;

  }
}
