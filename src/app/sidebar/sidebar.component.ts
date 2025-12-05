import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { CommonModule } from '@angular/common';
import { ObservableService } from '../services/observable.service';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Subject, takeUntil } from 'rxjs';

combineLatest
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  globalservice = inject(GlobalService);
  obs$ = inject(ObservableService);
  route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();





  openDealWrapper() {
    this.globalservice.isoverlay = true;
    this.globalservice.dealwrapperOpen = true;
  }

  openTaskWrapper() {
    this.globalservice.isoverlay = true;
    this.globalservice.taskWrapperOpen = true;
  }
  openActivityWrapper() {
    this.globalservice.isoverlay = true;
    this.globalservice.activityWrapperOpen = true;
    this.obs$.sendSignalToDialog(null);
  }
  openContactWrapper() {
    this.globalservice.isoverlay = true;
    this.globalservice.contactWrapperOpen = true;
  }
}
