import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { createDealModel } from '../models/deal.model';
import { CdkScrollable } from "@angular/cdk/scrolling";
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-dealwrapper',
  imports: [CommonModule, FormsModule],
  templateUrl: './dealwrapper.component.html',
  styleUrl: './dealwrapper.component.scss'
})
export class DealwrapperComponent {
  global = inject(GlobalService);
  deal = createDealModel();




  ngOnInit() {
    console.log(this.deal);

  }

  createDeal(form:NgForm){
    console.log(this.deal);
    
  }

  formatAmount() {
    console.log(this.deal.total_amount);

    if (this.deal.total_amount) {
      this.deal.total_amount = parseFloat(this.deal.total_amount.toFixed(2));

    }
  }

  resetForm(form: NgForm) {
    this.deal = createDealModel();
    this.global.dealwrapperOpen = false;
    this.global.isoverlay = false;
    form.reset();
  }
}
