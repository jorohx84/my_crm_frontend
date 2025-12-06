import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { ObservableService } from '../services/observable.service';
import { GlobalService } from '../services/global.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-listmenu',
  imports: [CommonModule, FormsModule],
  templateUrl: './listmenu.component.html',
  styleUrl: './listmenu.component.scss'
})
export class ListmenuComponent {
  dataservice = inject(DataService);
  observer = inject(ObservableService);
  global = inject(GlobalService);
  totalPages: number | null = null;
  @Input() next: string | null = null;
  @Input() list: string = '';
  @Input() fields: any[] = [];
  @Input() timeFilter: boolean = false;
  @Input() searchField: boolean = false;
  @Input() totalCount: number | null = null;
  @Output() searchChanges = new EventEmitter();
  isfiltered: boolean = false;
  startTime: string = '';
  endTime: string = '';

  searchFilterOpen: boolean = false;
  dropdownOpen: boolean = false;
  pageSize: number = 25;
  currentPage: number = 1;
  private destroy$ = new Subject<void>()
  previous: string | null = null;
  searchValue: string = '';
  // customerFields = [ 
  //   { fieldName: 'companyname', displayName: 'Name' },
  //   { fieldName: 'street', displayName: 'Straße' },
  //   { fieldName: 'areacode', displayName: 'Postleitzahl' },
  //   { fieldName: 'city', displayName: 'Stadt' },
  //   { fieldName: 'country', displayName: 'Land' },
  //   { fieldName: 'branch', displayName: 'Branche' },

  // ];

  headlines: Record<string, string> = {
    activities: 'Aktivitäten',
    customers: 'Kundenliste',
    contacts: 'Kontakte'
  };



  currentSearchFilter: any;
  responseData: any;
  isSearch: boolean = false;




  ngOnInit() {
    this.currentSearchFilter = this.fields[0];
    // this.subscribeListCount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalCount']) {
      if (this.totalCount) {
        this.totalPages = this.global.calcPages(this.totalCount, this.pageSize);
        console.log(this.totalCount);
        
      }

    }
  }

  // subscribeListCount() {
  //   this.observer.listCountSubject$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
  //     if (data) {
  //       console.log(data);

  //       this.totalCount = data;
  //       console.log(data);

  //       if (this.totalCount) {
  //         this.totalPages = this.global.calcPages(this.totalCount, this.pageSize);
  //       }

  //     }
  //   })
  // }

  changeSearchFilter(index: number) {
    this.currentSearchFilter = this.fields[index];
  }
  searchInList() {
    this.sendDataToList();
    console.log(this.responseData);
  }

  setCurrentPage(page: number) {
    this.currentPage = page;
    this.sendDataToList();
    if (this.totalCount) {
      this.totalPages = this.global.calcPages(this.totalCount, this.pageSize);
    }

  }

  buildResponse() {
    return {
      page: this.currentPage,
      size: this.pageSize,
      filter: this.currentSearchFilter,
      value: this.searchValue,
      startTime: this.startTime,
      endTime: this.endTime,
    }

  }
  setDate() {
    if (this.validateDate()) { return }
    this.isfiltered = true;
    this.sendDataToList();
  }

  validateDate() {
    const start = this.startTime ? new Date(this.startTime).getTime() : null;
    const end = this.endTime ? new Date(this.endTime).getTime() : null;
    if (start && end && start > end) {
      this.global.wrongTime = true
      return true
    } else {
      this.global.wrongTime = false;
      return false
    }

  }

  resetTimeFilter() {
    this.isfiltered = false;
    this.endTime = '';
    this.startTime = '';
    this.sendDataToList();
  }

  sendDataToList() {
    this.responseData = this.buildResponse();
    // this.observer.sendListData(this.responseData);
    this.searchChanges.emit(this.responseData)
  }
}
