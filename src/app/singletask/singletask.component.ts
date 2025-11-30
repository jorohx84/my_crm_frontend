import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { ObservableService } from '../services/observable.service';
import { MessageService } from '../services/message.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { MemberlistComponent } from '../memberlist/memberlist.component';
import { query, response } from 'express';
import { SubtasksComponent } from '../subtasks/subtasks.component';
import { TaskinfobarComponent } from '../taskinfobar/taskinfobar.component';
import { TasksidebarComponent } from '../tasksidebar/tasksidebar.component';

@Component({
  selector: 'app-singletask',
  imports: [CommonModule, FormsModule, MemberlistComponent, SubtasksComponent, TaskinfobarComponent, TasksidebarComponent],
  templateUrl: './singletask.component.html',
  styleUrl: './singletask.component.scss'
})
export class SingletaskComponent {
  observerservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  apiservice = inject(APIService);
  route = inject(ActivatedRoute);
  userservice = inject(UserService);
  dataservice = inject(DataService);
  messageservice = inject(MessageService);
  private destroy$ = new Subject<void>();
  taskId: string | null = null;
  task = this.dataservice.task;
  user: any;
  sortedComments: any[] = [];
  memberListOpen: boolean = false;
  newDueDate: string = '';
  newReviewer: any;
  subtasks: any[] = [];
  subtaskText: string = '';
  searchValue: string = '';
  isloaded: boolean = false;

  constructor() {
    this.globalservice.setCustomerSidebarState();
  }

  ngOnInit() {
    this.loadTemplate();
    this.subscribeUser();
    // this.subscribeMember();
    this.subscribeMemberList();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTemplate() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('task_id');
      if (id) { this.taskId = id; this.loadtask(id); }
    });
  }

  subscribeUser() {
    this.userservice.getUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) { this.user = user; }
    })
  }


  // subscribeMember() {
  //   this.observerservice.memberSubject$.pipe(takeUntil(this.destroy$)).subscribe((memberData) => {
  //     if (memberData) { this.memberListOpen = false; this.newReviewer = memberData; }
  //   })
  // }

  subscribeMemberList() {
    this.observerservice.memberlistSubject$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response) { this.setMembers(response) }
    })
  }


  onTaskChanged(data:any){
    this.updateTask(data.data, data.key)
  }

  setMembers(res: any[]) {
    const data = { members: res }
    this.updateTask(data, 'members');
    this.memberListOpen = false;
  }

  loadtask(id: string | null) {
    if (id) {
      this.apiservice.getData(`task/${id}`).subscribe({
        next: (response) => { this.setTaskTemplate(response) },
      })
    }
  }

  setTaskTemplate(res: any) {
    this.task = res;
    // this.observerservice.sendTask(res);
    this.subtasks = res.subtasks
    this.isloaded = true;
  }


  backToCustomer() {
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.task.customer.id, 'tasklist'], null);
  }



  changeTitle(objKey: string) {
    const data = { title: this.task.title }
    this.updateTask(data, objKey);
  }


  updateTask(data: any, objKey: string) {
    this.apiservice.patchData(`task/${this.taskId}/`, data).subscribe({
      next: (response) => {
        console.log(response);
        this.loadtask(this.taskId);

        if (objKey === 'reviewer') {
          this.globalservice.saveLog(objKey, response, this.newReviewer);
        } else if (objKey === 'tododone' || objKey === 'todoundone') {
          this.globalservice.saveLog(objKey, response, this.subtaskText);
        }
        else if (objKey === 'subtask') {
          this.globalservice.saveLog(objKey, response, this.task.subtask);
        } else {
          this.globalservice.saveLog(objKey, response);
        }
      }
    })
  }

  releaseTask() {
    const data = {
      state: 'released'
    }
    this.updateTask(data, 'release');
    // this.sendSystemMessage();
  }
  closeTask() {
    const data = {
      state: 'closed',
    }
    this.updateTask(data, 'close');
  }

  openMemberlist() {
    const memberlist = this.transformMemberList();
    this.observerservice.sendTaskMembers(memberlist);
    this.memberListOpen = true;
  }


  transformMemberList() {
    const memberlist = this.task.members;
    const idList: any[] = [];
    memberlist.forEach((member: any) => {
      const uid = member.id
      idList.push(uid);
    });
    return idList;
  }

  saveTaskTemplate() {
    const subtasks = this.saveSubtasks();
    const template = {
      title: this.task.title,
      description: this.task.description,
      subtasks: subtasks,

    }

    this.apiservice.postData('task/template/', template).subscribe({
      next: (response) => {
        console.log(response);

      }
    })

  }

  saveSubtasks() {
    const savedList = this.task.subtasks;
    for (let index = 0; index < savedList.length; index++) {
      const obj = savedList[index];
      obj.is_saved = true;
      obj.is_checked = false;

    }
    console.log(savedList);
    return savedList
  }

}