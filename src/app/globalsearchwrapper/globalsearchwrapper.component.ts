import { Component, inject } from '@angular/core';
import { ObservableService } from '../services/observable.service';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-globalsearchwrapper',
  imports: [CommonModule],
  templateUrl: './globalsearchwrapper.component.html',
  styleUrl: './globalsearchwrapper.component.scss'
})
export class GlobalsearchwrapperComponent {
  observerservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  members: any;
  tasks: any;
  customers: any;
  contacts:any;
  ngOnInit() {
    this.observerservice.globalsearchSubject$.subscribe((data) => {
      if (data) {
        this.members = data.members;
        this.tasks = data.tasks;
        this.customers = data.customers
        this.contacts=data.contacts
      }
    })
  }


  openCard(path: any[], param: any = null) {
    this.globalservice.searchWrapperOpen = false
    console.log(path);
    
    this.globalservice.navigateToPath(path, param)

  }
}
