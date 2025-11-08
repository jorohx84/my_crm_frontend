import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';
import { response, text } from 'express';
import { DataService } from '../services/data.service';
import { identity, retry } from 'rxjs';
import { TaskwrapperComponent } from '../taskwrapper/taskwrapper.component';
import { ObservableService } from '../services/observable.service';
import { MemberlistComponent } from '../memberlist/memberlist.component';

@Component({
  selector: 'app-singletask',
  imports: [CommonModule, FormsModule, TaskwrapperComponent, MemberlistComponent],
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
  taskId: string | null = null;
  sidebarKey: string = 'subtasks';
  task: any = {
    title: '',
    description: '',
    customer: null,
    assignee: null,
    state: 'todo',
    comments: '',
    priority: 'low',
    created_at: '',
    updated_at: '',
    due_date: '',
    reviewer: '',
    completed_at: '',
  };
  user: any;
  customer: number | null = null;
  linewidth: number = 100;
  comment: any = {
    task: '',
    creator: {},
    text: '',
    created_at: '',
  }
  sortedComments: any[] = [];
  priochangeOpen: boolean = false;
  duedateChangeOpen: boolean = false;
  commentSlide: boolean = false;
  memberListOpen: boolean = false;
  assigneeChangeOpen: boolean = false;
  taskWrapperOpen: boolean = false;
  newDueDate: string = '';
  subtasks: any[] = [];
  subtask: any;
  newAssignee: any;
  queryType: string | null = null;
  checkList: any[] = [];
  todotext: string = '';
  taskCompleted: boolean = false;

  constructor() {
    this.globalservice.toggleSidebar(false);

  }
  ngOnInit() {
    this.loadTemplate();
    this.subscribeUser();
    this.subscribeSubtasks();
    this.subscribeMember();

  }


  loadTemplate() {
    this.route.queryParams.subscribe(params => {
      this.queryType = params['type'];

    });
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.taskId = id
        this.loadtask(id);
        this.loadSubtasks(id);
      }
    });
  }

  subscribeUser() {
    this.userservice.getUser().subscribe((user) => {
      if (user) {
        this.user = user;

      }
    })
  }

  subscribeSubtasks() {
    this.observerservice.taskTriggerSubject$.subscribe((subtaskData) => {
      if (subtaskData) {
        this.subtask = subtaskData;
        this.loadSubtasks(this.taskId);
        this.updateTask({ log: [] }, 'subtask');
        this.sidebarKey = 'subtasks';
        this.taskWrapperOpen = false;
      }
    })
  }

  subscribeMember() {
    this.observerservice.memberSubject$.subscribe((memberData) => {
      if (memberData) {
        this.memberListOpen = false;
        this.newAssignee = memberData;
      }
    })
  }


  checkPermissions(permission: string): boolean {
    if (permission === 'reviewer') {
      return this.task.reviewer?.id === this.user?.id;
    } else if (permission === 'assignee') {
      return this.task.assignee === this.user?.id || this.task.reviewer?.id === this.user?.id;
    } else
      return false

  }

  updateAssignee() {
    const data = {
      assignee: this.newAssignee.id
    }
    this.updateTask(data, 'assignee');
    this.assigneeChangeOpen = false;
  }


  loadtask(id: string | null) {
    if (id) {
      this.apiservice.getData(`task/${id}`).subscribe({
        next: (response) => {
          this.task = response;
          console.log(response);

          this.getProgressState();
          this.sortComments();
          this.checkList = response.checklist
        },
      })

    }

  }


  loadSubtasks(id: string | null) {
    this.apiservice.getData(`subtasks/${id}`).subscribe({
      next: (response) => {
        this.subtasks = response;
        console.log(response);

      }
    })
  }

  backToCustomer() {
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.task.customer.id, 'tasklist'], null);
  }

  sortComments() {
    if (this.task.comments.length > 0) {
      const comments = this.task.comments
      this.sortedComments = comments.sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
    }

  }


  getProgressState() {
    if (this.task.state === 'undone') {
      this.linewidth = 0;
    }
    else if (this.task.state === 'in_progress') {
      this.linewidth = 20;
    }
    else if (this.task.state === 'under_review') {
      this.linewidth = 40;
    }
    else if (this.task.state === 'done') {
      this.linewidth = 60;
    }
    else if (this.task.state === 'released') {
      this.linewidth = 80;
    }
    else
      this.linewidth = 100;

  }


  changeSidebarContent(key: string) {
    this.sidebarKey = key;
  }
  changeTitle(objKey: string) {
    const data = {
      title: this.task.title,
    }
    this.updateTask(data, objKey);

  }


  changePrio(prio: string, event: Event) {
    const permission = this.checkPermissions('reviewer');
    if (!permission) {
      return
    }
    this.priochangeOpen = false;
    this.task.priority = prio;
    const data = {
      priority: prio,
    }
    this.updateTask(data, 'priority');
    event.stopPropagation()
  }

  updateTaskState(newState: string, objKey: string) {
    this.task.state = newState
    const data = {
      state: newState,
    }
    this.updateTask(data, objKey);
  }

  updateDueDate(objKey: string, event: Event) {
    this.task.due_date = this.newDueDate
    const data = {
      due_date: this.newDueDate,
    }
    this.updateTask(data, objKey);
    this.duedateChangeOpen = false;
    event.stopPropagation()
  }



  updateTask(data: any, objKey: string) {
    const logData = this.createLog(objKey);
    this.task.log.push(logData);
    const requestData = data;
    requestData.log = this.task.log;
    this.apiservice.patchData(`task/${this.taskId}/`, requestData).subscribe({
      next: (response) => {
        this.getProgressState();
        this.loadtask(this.taskId);
      }
    })
  }


  createLog(objKey: string) {
    const logText = this.dataservice.taskLogs[objKey]
    const newState = this.getnewState(objKey);

    return {
      log: logText,
      logged_at: new Date().toISOString(),
      updated_by: {
        id: this.user.id,
        fullname: this.user.fullname,
      },
      newState: newState
    }
  }

  getnewState(objKey: string) {
    if (objKey === 'description' || objKey === 'due_date' || objKey === 'title') {
      return this.task[objKey]
    } else if (objKey === 'state' || objKey === 'priority') {
      return this.dataservice.interpretation[objKey][this.task[objKey]]
    } else if (objKey === 'subtask') {
      return this.subtask.title;
    } else if (objKey === 'assignee') {
      return this.newAssignee.fullname
    } else if (objKey === 'checklist') {
      return 'Aufgabe hinzugefügt'
    } else if (objKey === 'tododone' || objKey === 'todoundone') {
      return this.todotext
    } else if (objKey === 'release') {
      return 'Freigabe erteilt durch Prüfer'
    } else if (objKey === 'close') {
      return 'Aufgabe abgeschlossen durch Bearbeiter'
    }
  }

  addSubtask() {
    this.globalservice.isSubtaskWrapper = true;
    this.globalservice.taskWrapperOpen = true;
    this.observerservice.sendTask(this.task);

  }


  createComment() {
    const commentData = {
      task: this.task.id,
      text: this.comment.text,
    }
    this.apiservice.postData('comments/', commentData).subscribe({
      next: (response) => {
        const id = this.task.id
        this.loadtask(id)
        this.sidebarKey = 'comments';
        this.commentSlide = false;
        this.comment.text = '';
      }
    })

  }



  updateComment(index: number) {
    const comments = this.task.comments;
    const currentComment = comments[index];
    const id = currentComment.id
    this.apiservice.patchData(`comments/${id}/`, currentComment).subscribe({
      next: (response) => {
        const id = this.task.id
        this.loadtask(id)
        console.log('Kommentar bearbeitet!', response);
      }
    })

  }

  deleteComment(index: number) {
    const comments = this.task.comments;
    const currentComment = comments[index];
    const id = currentComment.id
    this.apiservice.deleteData(`comments/${id}/`, currentComment).subscribe({
      next: (response) => {
        const id = this.task.id
        this.loadtask(id)
        console.log('Kommentar bearbeitet!', response);

      }
    })
  }

  countCompletesSubtasks(state: string) {
    let count = 0;
    for (let index = 0; index < this.subtasks.length; index++) {
      const subtask = this.subtasks[index];
      if (subtask.state === state) {
        count++
      }
    }
    return count
  }


  openSubtask(index: number) {

    const currentSubtask = this.subtasks[index];
    console.log(currentSubtask);
    const id = currentSubtask.id
    const customerId = currentSubtask.customer;
    const queryParam = {
      type: currentSubtask.type,
    }
    this.globalservice.navigateToPath(['main', 'singlecustomer', customerId, 'task', id], queryParam);
  }

  navigateToMainTask() {
    const queryParam = {
      type: 'task',
    }
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.task.customer.id, 'task', this.task.parent.id], queryParam);
  }

  addTodo() {
    const listObj = {
      text: '',
      isChecked: false,
    }
    this.checkList.push(listObj)
    console.log(this.checkList);

  }

  saveTodo(index: number) {
    console.log(index);
    console.log(this.checkList);
    const data = {
      checklist: this.checkList,
    }
    this.updateTask(data, 'checklist');
  }

  changeIsChecked(index: number) {
    const checkbox = this.checkList[index]
    checkbox.isChecked = !checkbox.isChecked

    const data = {
      checklist: this.checkList,
    }

    console.log(checkbox.text);
    this.todotext = checkbox.text
    const log = checkbox.isChecked ? 'tododone' : 'todoundone';
    console.log(log);


    this.updateTask(data, log)
  }

  countCompletedTodos() {
    let count = 0;
    for (let index = 0; index < this.checkList.length; index++) {
      const check = this.checkList[index];
      if (check.isChecked === true) {
        count++
      }
    }
    return count
  }

  checkCompletion() {
    let completion = true;
    for (let index = 0; index < this.subtasks.length; index++) {
      const subtasks = this.subtasks[index];
      if (subtasks.state !== 'done') {
        completion = false;
      }
    }
    console.log(completion);
    this.taskCompleted = completion;
  }

  releaseTask() {
    console.log(this.task);

    const data = {
      state: 'released'
    }
    this.updateTask(data, 'release');
    const urlStr = ['main', 'singlecustomer', this.task.customer.id, 'task', this.task.id];
    const text = 'Aufgabe wurde freigegeben'
    const messagedata = this.createSystemMessage(this.task.assignee.id, urlStr, text);
    this.sendSystemMessage(this.user.id, messagedata);
  }

  createSystemMessage(assignee: number, url: any[], text: string) {
    const messageData = {
      recipient: assignee,
      text: text,
      url: url
    }
    return messageData

  }

  sendSystemMessage(userID: number, data: any) {
    console.log(userID);
    console.log(data);
    this.apiservice.postData('system-messages/', data).subscribe({
      next: (response) => {
        console.log(response);

      }
    })

  }

  closeTask() {
    const data = {
      state: 'closed',
    }
    this.updateTask(data, 'close');
  }
}
