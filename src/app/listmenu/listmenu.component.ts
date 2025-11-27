import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
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
 
  //  @Input() totalCount: number | null = null;
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


  currentSearchFilter: any;
  responseData: any;
  isSearch: boolean = false;
  totalCount: number | null = null;


  ngOnInit() {
    console.log(this.list);
    console.log(this.totalCount);
    
    this.currentSearchFilter = this.fields[0];
    // this.global.getTotalListCount(this.list);
    this.subscribeListCount();
  }


  subscribeListCount() {
    this.observer.listCountSubject$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        console.log(data);
        
        this.totalCount = data;
        console.log(data);
        
        if (this.totalCount) {
          this.totalPages = this.global.calcPages(this.totalCount, this.pageSize);
        }

      }
    })
  }

  changeSearchFilter(index: number) {
    this.currentSearchFilter = this.fields[index];
  }
  searchInList() {
    this.responseData = this.buildResponse();
    this.observer.sendListData(this.responseData);
    console.log(this.responseData);


  }

  setCurrentPage(page: number) {

    this.currentPage = page;
    this.responseData = this.buildResponse();
    console.log(this.responseData);
    this.observer.sendListData(this.responseData);
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
    }

  }



}
