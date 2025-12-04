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
import { combineLatest, of, Subject, takeUntil } from 'rxjs';
import { MemberlistComponent } from '../memberlist/memberlist.component';
import { query, response } from 'express';
import { SubtasksComponent } from '../subtasks/subtasks.component';
import { TaskinfobarComponent } from '../taskinfobar/taskinfobar.component';
import { TasksidebarComponent } from '../tasksidebar/tasksidebar.component';
import { LogBookService } from '../services/log.service';
import { PermissionService } from '../services/permissions.service';

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
  permission = inject(PermissionService);
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
  memberlist: any[] = [];
  taskTemplateOpen: boolean = false;
  currentTaskTemplate: any;
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

  loadtask(id: string | null) {
    if (id) {
      this.apiservice.getData(`task/${id}`).subscribe({
        next: (response) => { this.setTaskTemplate(response) },
      })
    }
  }

  subscribeUser() {
    this.userservice.getUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) { this.user = user; }
    })
  }

  subscribeMemberList() {
    this.observerservice.memberlistSubject$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response) {
        this.memberlist = response;
        console.log(response);

        const foundMemberData = this.logbook.findChangesInIdList(response, this.oldIdList);

        this.initializeUpdateMembers(foundMemberData)
      }
    })
  }


  initializeUpdateMembers(foundMemberData: any) {
    const newList = foundMemberData.newList
    const foundMembers = {
      added: foundMemberData.addedMembers,
      deleted: foundMemberData.deletedMembers,
    }
    this.setMembers(newList, foundMembers, 'members');
  }


  setMembers(res: any[], foundMembers: any, logKey: string) {
    const data = { members: res }
    this.updateTask(data, logKey, foundMembers);
    this.globalservice.memberListOpen = false;
  }

  onTaskChanged(data: any) {
    this.updateTask(data.data, data.key, data.obj)
  }

  updateTask(data: any, objKey: string, varObj: any = null) {
    this.apiservice.patchData(`task/${this.taskId}/`, data).subscribe({
      next: (response) => {
        const task = response;
        this.loadtask(this.taskId);
        this.logbook.sendLog(varObj, objKey, task);
      }
    })
  }


  setTaskTemplate(res: any) {
    this.task = res;
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

  openTaskTemplate() {
    const subtasks = this.saveSubtasks();
    this.currentTaskTemplate = structuredClone({
      title: this.task.title,
      description: this.task.description,
      subtasks: subtasks,

    });
    this.taskTemplateOpen = true;
    this.globalservice.isoverlay = true;


  }

  saveTaskTemplate() {

    this.apiservice.postData('task/template/', this.currentTaskTemplate).subscribe({
      next: (response) => {
        console.log(response);
        this.closeTemplateDialog();
        this.observerservice.sendConfirmation('Aufgabe als Vorlage gespeichert');
      }
    })
  }

  closeTemplateDialog() {
    this.taskTemplateOpen = false;
    this.currentTaskTemplate = null;
    this.globalservice.isoverlay = false;
  }

  saveSubtasks() {
    const savedList = this.task.subtasks;
    for (const sub of savedList) {
      sub.is_saved = true;
      sub.is_checked = false;
      sub.assignee = null;
      sub.ordering = null;
    }
    return savedList
  }

  addSubtask() {
    const task = {
      text: '',
      is_checked: false,
      is_saved: true,
      ordering: null,
    }
    this.currentTaskTemplate.subtasks.push(task);
    this.subtaskText = '';
  }
  deleteSubtask(index: number) {
    const subtasks = this.currentTaskTemplate.subtasks
    subtasks.splice(index, 1)

  }

}