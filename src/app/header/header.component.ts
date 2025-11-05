import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { APIService } from '../services/api.service';
import { DataService } from '../services/data.service';
import { ObservableService } from '../services/observable.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { TimeInterval } from 'rxjs/internal/operators/timeInterval';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  dataservice = inject(DataService);
  apiservice = inject(APIService);
  observservice = inject(ObservableService);
  userservice = inject(UserService);
  globalservice = inject(GlobalService);
  router = inject(Router);
  user: any;
  component: string = '';
  intervalId: any;
  date: string = '';
  ngOnInit() {
    this.userservice.getUser().subscribe((user) => {
      if (user) {
        this.user = user;
      }

    });
    this.setTime();
  }


  setTime(): void {
    this.intervalId = setInterval(() => {
      this.date = new Date().toISOString()
    }, 1000);
  }

  logoutUser() {
    this.apiservice.postData('logout/', {}, true).subscribe({
      next: (res) => {
        console.log('Logout successful');
        localStorage.clear();
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error('Logout error', err);
      }
    })
  }

}
