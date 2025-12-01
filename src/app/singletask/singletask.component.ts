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
import { LogBookService } from '../services/log.service';

@Component({
  selector: 'app-singletask',
  imports: [CommonModule, FormsModule, MemberlistComponent, SubtasksComponent, TaskinfobarComponent, TasksidebarComponent],
  templateUrl: './singletask.component.html',
  styleUrl: './singletask.component.scss'
})
export class SingletaskComponent {
  observerservice = inject(ObservableService);
  logbook = inject(LogBookService);
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
  oldIdList: any[] = [];
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

  subscribeMemberList() {
    this.observerservice.memberlistSubject$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response) { this.findChangesInIdList(response); }
    })
  }

  findChangesInIdList(res: any) {
    const newList = res.added;
    const oldList = this.oldIdList;
    const allMembers = res.all;
    const oldSet = new Set(oldList);
    const newSet = new Set(newList);
    const added = newList.filter((id: string) => !oldSet.has(id));
    const deleted = oldList.filter((id: string) => !newSet.has(id));
    const addedMembers = this.resolveNames(added, allMembers);
    const deletedMembers = this.resolveNames(deleted, allMembers);
    this.initializeUpdateMembers(newList, addedMembers, deletedMembers);
  }

  resolveNames(memberIds: string[], allMembers: any[]) {
    const result: string[] = [];
    for (const id of memberIds) {
      const member = allMembers.find(m => m.id === id);
      if (member) {
        result.push(member.profile.fullname);
      }
    }
    return result;
  }

  initializeUpdateMembers(newList: any[], addedMembers: any[], deletedMembers: any[]) {
    if (addedMembers.length > 0) {
      this.setMembers(newList, addedMembers, 'members_added');
    }
    if (deletedMembers.length > 0) {
      this.setMembers(newList, deletedMembers, 'members_deleted');
    }
  }


  setMembers(res: any[], foundMembers: any[], logKey: string) {
    const data = { members: res }
    this.updateTask(data, logKey, foundMembers);
    this.globalservice.memberListOpen = false;
  }

  onTaskChanged(data: any) {
    this.updateTask(data.data, data.key, data.obj)
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


  updateTask(data: any, objKey: string, varObj: any = null) {
    this.apiservice.patchData(`task/${this.taskId}/`, data).subscribe({
      next: (response) => {
        const task = response;
        this.loadtask(this.taskId);
        this.sendLog(varObj, objKey, task);
      }
    })
  }

  sendLog(varObj: any, objKey: string, task: any) {
    if (Array.isArray(varObj)) {
      this.sendArrayLogs(varObj, objKey, task)
    } else {
      this.logbook.saveTaskLog(objKey, task, varObj);
    }
  }

  sendArrayLogs(varObj: any[], objKey: any, task: any) {
    varObj.forEach(obj => {
      this.logbook.saveTaskLog(objKey, task, obj);
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
    console.log(memberlist);

    this.observerservice.sendTaskMembers(memberlist);
    this.globalservice.memberListOpen = true;
  }


  transformMemberList() {
    const memberlist = this.task.members;
    const idList: any[] = [];
    memberlist.forEach((member: any) => {
      const uid = member.id
      idList.push(uid);
    });
    this.oldIdList = [...idList];
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
    return savedList
  }

}