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
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-singletask',
  imports: [CommonModule, FormsModule],
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
  subtasks: any[] = [];
  subtaskText: string = '';
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
    this.globalservice.setCustomerSidebarState();
  }

  ngOnInit() {
    this.loadTemplate();
    this.subscribeUser();
    // this.subscribeSubtasks();
    this.subscribeMember();

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTemplate() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.queryType = params['type'];
    });
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('task_id');
      if (id) {
        this.taskId = id
        this.loadtask(id);
        // this.loadSubtasks(id);
      }
    });
  }


  subscribeUser() {
    this.userservice.getUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.user = user;
      }
    })
  }

  // subscribeSubtasks() {
  //   this.observerservice.taskTriggerSubject$.pipe(takeUntil(this.destroy$)).subscribe((subtaskData) => {
  //     if (subtaskData) {
  //       if (subtaskData.type === 'task') {
  //         return
  //       }
  //       this.updateTask({ log: [] }, 'subtask');
  //       this.sidebarKey = 'comments';
  //       this.taskWrapperOpen = false;
  //     }
  //   })
  // }

  subscribeMember() {
    this.observerservice.memberSubject$.pipe(takeUntil(this.destroy$)).subscribe((memberData) => {
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
          // this.getProgressState();
          this.sortComments();

          this.subtasks = response.subtasks
        },
      })

    }

  }
  loadLog(task: any) {
    this.apiservice.getData(`task/logs/${task.id}`).subscribe({
      next: (response) => {
        console.log(response);
        
        // this.logBook = response.sort((a: any, b: any) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
        this.logBook=this.globalservice.sortListbyTime(response, 'logged_at', 'down')
      }
    })
  }

  backToCustomer() {
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.task.customer.id, 'tasklist'], null);
  }

  sortComments() {
    if (this.task.comments.length > 0) {
      const comments = this.task.comments
      this.sortedComments = this.globalservice.sortListbyTime(comments, 'created_at', 'down');
    }

  }


  // getProgressState() {
  //   if (this.task.state === 'undone') {
  //     this.linewidth = 0;
  //   }
  //   else if (this.task.state === 'in_progress') {
  //     this.linewidth = 20;
  //   }
  //   else if (this.task.state === 'under_review') {
  //     this.linewidth = 40;
  //   }
  //   else if (this.task.state === 'done') {
  //     this.linewidth = 60;
  //   }
  //   else if (this.task.state === 'released') {
  //     this.linewidth = 80;
  //   }
  //   else
  //     this.linewidth = 100;

  // }


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
        // this.getProgressState();
        if (objKey === 'assignee') {
          this.globalservice.saveLog(objKey, response, this.newAssignee);
        } else if (objKey === 'tododone' || objKey === 'todoundone') {
          this.globalservice.saveLog(objKey, response, this.subtaskText);
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


  // addSubtask() {
  //   this.globalservice.isSubtaskWrapper = true;
  //   this.globalservice.taskWrapperOpen = true;
  //   this.observerservice.sendTask(this.task);

  // }


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



  navigateToMainTask() {
    const queryParam = {
      type: 'task',
    }
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.task.customer.id, 'task', this.task.parent.id], queryParam);
  }

  addSubtask() {
    const listObj = {
      text: '',
      is_checked: false,
      is_saved: false,
    }
    this.subtasks.push(listObj)
  }

  saveSubtask(index: number) {
    const currentTask = this.subtasks[index];
    currentTask.is_saved = true;
    this.removeEmptySubtasks();
    const data = {
      subtasks: this.subtasks,
    }
    this.updateTask(data, 'checklist');
  }


  removeEmptySubtasks() {
    const subtasks = this.subtasks
    console.log(subtasks);

    for (let index = 0; index < subtasks.length; index++) {
      const subtask = subtasks[index];
      if (subtask.text === '') {
        subtasks.splice(index, 1);
      }
    }
  }

  changeIsChecked(index: number) {
    const checkbox = this.subtasks[index]
    checkbox.is_checked = !checkbox.is_checked

    const data = {
      subtasks: this.subtasks,
    }

    console.log(checkbox.text);
    this.subtaskText = checkbox.text
    const log = checkbox.is_checked ? 'tododone' : 'todoundone';
    console.log(log);


    this.updateTask(data, log)
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

    this.apiservice.getData(`users/search/${this.searchValue}`).subscribe({
      next: (response => {
        console.log(response);

        this.foundMembers = this.globalservice.sortListByName(response, 'fullname', 'up')

      })
    })
  }

  setNewAsssigne(index: number) {
    this.newAssignee = this.foundMembers[index];
    console.log(this.newAssignee);

    this.updateAssignee()
    this.foundMembers = []
    this.searchValue = '';
  }

  updateAssignee() {

    const id = this.newAssignee.id
    const data = {
      assignee: id
    }


    this.updateTask(data, 'assignee');
    this.assigneeChangeOpen = false;
  }

  closeAssigneeChanger() {
    this.assigneeChangeOpen = false;
    this.foundMembers = [];
    this.searchValue = '';
  }

  saveTaskTemplate() {
    const subtasks = this.saveSubtasks();
    console.log(subtasks);

    const template = {
      title: this.task.title,
      description: this.task.description,
      subtasks: subtasks,
    }

    console.log(template);

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
