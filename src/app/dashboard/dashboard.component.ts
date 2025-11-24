import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';
import { ObservableService } from '../services/observable.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  apiservice = inject(APIService);
  dataservice = inject(DataService);
  userservice = inject(UserService);
  observservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  private destroy$ = new Subject<void>();
  router = inject(Router);
  user: any;
  systemMessages: any[] = [];
  ngOnInit() {
    this.userservice.getUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.user = user;
        console.log(user);
        this.loadDasboard(user.id)
      }
    })

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDasboard(id: number) {
    console.log(id);
    // this.loadSystemMessages(id)
  }

  loadSystemMessages(id: number) {
    this.apiservice.getData(`system-messages/${id}`).subscribe({
      next: (response) => {
        console.log(response);
        this.systemMessages = response;
      }
    })
  }



}
