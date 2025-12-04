import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ObservableService } from '../services/observable.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalService } from '../services/global.service';
import { APIService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { PermissionService } from '../services/permissions.service';

@Component({
  selector: 'app-taskinfobar',
  imports: [CommonModule, FormsModule],
  templateUrl: './taskinfobar.component.html',
  styleUrl: './taskinfobar.component.scss'
})
export class TaskinfobarComponent implements OnChanges {
  api = inject(APIService);
  observer = inject(ObservableService);
  userservice = inject(UserService);
  globalservice = inject(GlobalService);
  permission=inject(PermissionService);
  @Input() task: any;
  @Output() infosChanged = new EventEmitter();
  user: any;
  subtasks: any[] = [];
  private destroy$ = new Subject<void>();
  reviewerChangeOpen: boolean = false;
  priochangeOpen: boolean = false;
  searchValue: string = '';
  foundMembers: any[] = [];
  duedateChangeOpen: boolean = false;
  newDueDate: string = '';
  newReviewer: any;
  prioLabels: any = {
    low: 'Niedrig',
    mid: 'Mittel',
    high: 'Hoch'

  }


  ngOnInit() {
    this.subscribeUser();
  }

  subscribeUser() {
    this.userservice.getUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) { this.user = user; }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task']) {
      this.subtasks = this.task.subtasks
    }
  }

  changePrio(prio: string, event: Event) {
    this.priochangeOpen = false;
    this.task.priority = prio;
    const data = { priority: prio };
    this.sendDataToTask(data, 'priority');
    event.stopPropagation();
  }
  updateDueDate(objKey: string, event: Event) {
    this.task.due_date = this.newDueDate
    const data = { due_date: this.newDueDate };
    this.sendDataToTask(data, objKey);
    this.duedateChangeOpen = false;
    event.stopPropagation();
  }


  setNewReviewer(index: number) {
    this.newReviewer = this.foundMembers[index];
    this.updateReviewer()
    this.foundMembers = []
    this.searchValue = '';
  }

  updateReviewer() {
    console.log(this.newReviewer);
    
    const id = this.newReviewer.id

    const fullname = this.newReviewer.fullname;
    const data = {
      reviewer: id
    }


    this.sendDataToTask(data, 'reviewer', fullname);
    this.reviewerChangeOpen = false;
  }

  searchMember() {
    this.api.getData(`users/search/${this.searchValue}`).subscribe({
      next: (response => {
        this.foundMembers = this.globalservice.sortListByName(response, 'fullname', 'up')
      })
    })
  }

  closeReviewerChanger() {
    this.reviewerChangeOpen = false;
    this.foundMembers = [];
    this.searchValue = '';
  }

  countCompletedSubtasks() {
    let count = 0;
    for (let index = 0; index < this.subtasks.length; index++) {
      const check = this.subtasks[index];
      if (check.is_checked === true) {
        count++
      }
    }
    return count
  }

  sendDataToTask(data: any, key: string, varObj: any = null) {
    const responseData = {
      data: data,
      key: key,
      obj: varObj,
    }
    this.infosChanged.emit(responseData);
  }
}
