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
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-singletask',
  imports: [CommonModule, FormsModule, MemberlistComponent],
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
  taskId: string | null = null;
  sidebarKey: string = 'comments';
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
  // subtasks: any[] = [];
  // subtask: any;
  newAssignee: any;
  queryType: string | null = null;
  checkList: any[] = [];
  todotext: string = '';
  taskCompleted: boolean = false;
  logBook: any[] = [];
  searchValue: string = '';

  prioLabels: any = {
    low: 'Niedrig',
    mid: 'Mittel',
    high: 'Hoch'

  }
  foundMembers: any[] = [];

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
      const id = params.get('task_id');
      if (id) {
        this.taskId = id
        this.loadtask(id);
        // this.loadSubtasks(id);
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
        if (subtaskData.type === 'task') {
          return
        }
        // this.subtask = subtaskData;
        // this.loadSubtasks(this.taskId);
        this.updateTask({ log: [] }, 'subtask');
        this.sidebarKey = 'comments';
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




  loadtask(id: string | null) {
    if (id) {
      this.apiservice.getData(`task/${id}`).subscribe({
        next: (response) => {
          this.task = response;
          console.log(response);
          this.loadLog(response)
          this.getProgressState();
          this.sortComments();

          this.checkList = response.checklist
        },
      })

    }

  }
  loadLog(task: any) {
    // console.log(task);
    // this.logBook = task.log.sort((a: any, b: any) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
    this.apiservice.getData(`task/logs/${task.id}`).subscribe({
      next: (response) => {
        this.logBook = response.sort((a: any, b: any) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
      }
    })
  }

  // loadSubtasks(id: string | null) {
  //   this.apiservice.getData(`subtasks/${id}`).subscribe({
  //     next: (response) => {
  //       this.subtasks = response;
  //       console.log(response);

  //     }
  //   })
  // }

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

  // updateTaskState(newState: string, objKey: string) {
  //   this.task.state = newState
  //   const data = {
  //     state: newState,
  //   }
  //   this.updateTask(data, objKey);
  // }

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

    // this.task.log.push(logData);
    const requestData = data;
    // requestData.log = this.task.log;

    this.apiservice.patchData(`task/${this.taskId}/`, requestData).subscribe({
      next: (response) => {
        this.getProgressState();
        if (objKey === 'assignee') {
          this.globalservice.saveLog(objKey, response, this.newAssignee);
        } else if (objKey === 'tododone' || objKey === 'todoundone') {
          this.globalservice.saveLog(objKey, response, this.todotext);
          // } 
          // else if (objKey === 'subtask') {
          //   this.globalservice.saveLog(objKey, response, this.subtask);
        } else {
          this.globalservice.saveLog(objKey, response);
        }

        this.loadtask(this.taskId);

      }
    })
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

  // countCompletesSubtasks(state: string) {
  //   let count = 0;
  //   for (let index = 0; index < this.subtasks.length; index++) {
  //     const subtask = this.subtasks[index];
  //     if (subtask.state === state) {
  //       count++
  //     }
  //   }
  //   return count
  // }


  // openSubtask(index: number) {
  //   const currentSubtask = this.subtasks[index];
  //   const id = currentSubtask.id
  //   const customerId = currentSubtask.customer;
  //   const queryParam = {
  //     type: currentSubtask.type,
  //   }
  //   this.globalservice.navigateToPath(['main', 'singlecustomer', customerId, 'task', id], queryParam);
  // }

  navigateToMainTask() {
    const queryParam = {
      type: 'task',
    }
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.task.customer.id, 'task', this.task.parent.id], queryParam);
  }

  addTodo() {
    const listObj = {
      text: '',
      is_checked: false,
      is_saved: false,
    }
    this.checkList.push(listObj)
  }

  saveTodo(index: number) {
    const currentTask = this.checkList[index];
    currentTask.is_saved = true;
    const data = {
      checklist: this.checkList,
    }
    this.updateTask(data, 'checklist');
  }

  changeIsChecked(index: number) {
    const checkbox = this.checkList[index]
    checkbox.is_checked = !checkbox.is_checked

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
      if (check.is_checked === true) {
        count++
      }
    }
    return count
  }

  // checkCompletion() {
  //   let completion = true;
  //   for (let index = 0; index < this.subtasks.length; index++) {
  //     const subtasks = this.subtasks[index];
  //     if (subtasks.state !== 'done') {
  //       completion = false;
  //     }
  //   }
  //   this.taskCompleted = completion;
  // }

  releaseTask() {
    const data = {
      state: 'released'
    }
    this.updateTask(data, 'release');
    // this.sendSystemMessage();
  }

  sendSystemMessage() {
    const urlStr = ['main', 'singlecustomer', this.task.customer.id, 'task', this.task.id];
    const text = 'Aufgabe wurde freigegeben'
    const param = { type: this.task.type }
    // this.messageservice.sendSystemMessage(this.user.id, this.task.assignee.id, urlStr, text, param);
  }

  closeTask() {
    const data = {
      state: 'closed',
    }
    this.updateTask(data, 'close');
  }

  searchMember() {

    this.apiservice.getData(`profile/search/${this.searchValue}`).subscribe({
      next: (response => {
        console.log(response);

        this.foundMembers = response.sort((a: any, b: any) => a.fullname.localeCompare(b.fullname))

      })
    })
  }

  setNewAsssigne(index: number) {
    this.newAssignee = this.foundMembers[index];
    this.updateAssignee()
    this.foundMembers = []
    this.searchValue = '';
  }

  updateAssignee() {
    const data = {
      assignee: this.newAssignee.id
    }
    console.log(data);

    this.updateTask(data, 'assignee');
    this.assigneeChangeOpen = false;
  }

  closeAssigneeChanger() {
    this.assigneeChangeOpen = false;
    this.foundMembers = [];
    this.searchValue = '';
  }

  saveTaskTemplate() {
    const checklist = this.saveChecklist();
    console.log(checklist);
    
    const template = {
      title: this.task.title,
      description: this.task.description,
      checklist: checklist,
    }

    console.log(template);

    this.apiservice.postData('task/template/', template).subscribe({
      next: (response) => {
        console.log(response);

      }
    })

  }

  saveChecklist() {
    const savedList = this.task.checklist;
    for (let index = 0; index < savedList.length; index++) {
      const obj = savedList[index];
      obj.is_saved = true;
      obj.is_checked = false;

    }
    console.log(savedList);
    return savedList
  }
}
