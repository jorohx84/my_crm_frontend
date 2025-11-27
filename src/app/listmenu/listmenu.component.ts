import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { ObservableService } from '../services/observable.service';

@Component({
  selector: 'app-listmenu',
  imports: [CommonModule, FormsModule],
  templateUrl: './listmenu.component.html',
  styleUrl: './listmenu.component.scss'
})
export class ListmenuComponent {
  dataservice = inject(DataService);
  observer = inject(ObservableService)
  @Input() totalPages: number | null = null;
  @Input() next: string | null = null;
  @Input() listKey: string = '';
  @Input() fields: any[] = [];
  searchFilterOpen: boolean = false;
  dropdownOpen: boolean = false;
  pageSize: number = 25;
  currentPage: number = 1;

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
    console.log(this.listKey);
    this.currentSearchFilter = this.fields[0];
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
