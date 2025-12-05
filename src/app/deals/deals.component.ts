import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { createDealModel } from '../models/deal.model';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-deals',
  imports: [CommonModule],
  templateUrl: './deals.component.html',
  styleUrl: './deals.component.scss'
})
export class DealsComponent {
  global = inject(GlobalService);
  deal = createDealModel();

  openDealFormDialog() {
    this.global.dealwrapperOpen = true;
    this.global.isoverlay = true;
  }
}
