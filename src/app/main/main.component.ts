import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { GlobalsearchwrapperComponent } from '../globalsearchwrapper/globalsearchwrapper.component';
import { GlobalService } from '../services/global.service';
import { ObservableService } from '../services/observable.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-main',
  imports: [CommonModule, RouterOutlet, HeaderComponent, GlobalsearchwrapperComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  globalservice = inject(GlobalService);
  observerservice = inject(ObservableService);
  confirmation: any;
  showConfrim: boolean = false;
  private destroy$ = new Subject<void>();
  ngOnInit() {
    this.subscribeConfirmation();
  }

  subscribeConfirmation() {
    this.observerservice.confirmSubject$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        this.confirmation = data;
        console.log(data);

        this.showConfirmation();
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  showConfirmation() {
    setTimeout(() => {
      this.showConfrim = true;
    }, 500);

    setTimeout(() => {
      this.showConfrim = false;
    }, 6000);
  }

}
