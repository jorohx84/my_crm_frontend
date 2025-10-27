import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';


import { Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';
import { ObservableService } from '../services/observable.service';


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
  router = inject(Router);
  user: any;

  ngOnInit() {
    this.userservice.getUser().subscribe((user) => {
      if (user) {
        this.user = user;
        console.log(user);
      }
    })

  }


}
