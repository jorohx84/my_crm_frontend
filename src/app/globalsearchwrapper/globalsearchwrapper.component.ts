import { Component, inject } from '@angular/core';
import { ObservableService } from '../services/observable.service';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../services/global.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-globalsearchwrapper',
  imports: [CommonModule],
  templateUrl: './globalsearchwrapper.component.html',
  styleUrl: './globalsearchwrapper.component.scss'
})
export class GlobalsearchwrapperComponent {
  observerservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  private destroy$ = new Subject<void>();
  members: any;
  tasks: any;
  customers: any;
  contacts: any;
  
  ngOnInit() {
    this.observerservice.globalsearchSubject$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        // this.members = data.members;
        this.members=this.globalservice.sortListByName(data.members, 'profile.fullname', 'up');
        this.tasks = data.tasks;
        this.customers = data.customers
        this.contacts = data.contacts
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  openCard(path: any[], param: any = null) {
    this.globalservice.searchWrapperOpen = false
    console.log(path);

    this.globalservice.navigateToPath(path, param)

  }
}
