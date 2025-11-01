import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';
import { response } from 'express';
import { DataService } from '../services/data.service';
import { identity } from 'rxjs';
import { TaskwrapperComponent } from '../taskwrapper/taskwrapper.component';
import { ObservableService } from '../services/observable.service';

@Component({
  selector: 'app-singletask',
  imports: [CommonModule, FormsModule, TaskwrapperComponent],
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
  sidebarKey: string = 'logs';
  task: any = {
    title: '',
    description: '',
    customer: null,
    assignee: null,
    state: 'todo',
    comment: '',
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
  newDueDate: string = '';
  subtasks: any[] = [];
  subtaskTitle: string = '';
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.taskId = id
        this.loadtask(id);
        this.loadSubtasks();
      }
    });

    this.userservice.getUser().subscribe((user) => {
      if (user) {
        this.user = user;
        console.log(user);
      }
    })

    this.observerservice.taskTriggerSubject$.subscribe((taskData) => {
      this.loadSubtasks();

      if (taskData) {
        this.subtaskTitle = taskData.title;
        console.log(this.subtaskTitle);
      }
      this.updateTask('subtask');
    })

  }

  loadtask(id: string | null) {
    if (id) {
      this.apiservice.getData(`task/${id}`).subscribe({
        next: (response) => {
          console.log(response);
          this.task = response;
          // this.getProgressState();
          this.sortComments();
        },
        error: (err) => console.log(err)

      })
    }
  }


  loadSubtasks() {
    this.apiservice.getData('subtasks/').subscribe({
      next: (response) => {
        console.log(response);
        this.subtasks = response;
      }
    })
  }

  backToCustomer() {
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.task.customer.id, 'tasklist'])

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
      this.linewidth = 33.3;
    }
    else if (this.task.state === 'under_review') {
      this.linewidth = 66.6;
    }
    else
      this.linewidth = 100;

    console.log(this.linewidth);

  }


  changeSidebarContent(key: string) {
    this.sidebarKey = key;
  }

  changePrio(prio: string, event: Event) {
    this.priochangeOpen = false;
    this.task.priority = prio;
    this.updateTask('priority');
    event.stopPropagation()
  }

  updateTaskState(newState: string, objKey: string) {
    this.task.state = newState
    this.updateTask(objKey);
  }

  updateDueDate(objKey: string, event: Event) {
    this.task.due_date = this.newDueDate
    this.updateTask(objKey);
    this.duedateChangeOpen = false;
    event.stopPropagation()
  }

  updateTask(objKey: string) {
    const logData = this.createLog(objKey);

    console.log(logData);

    // if (this.user.id !== this.task.reviewer.id) {
    //   return

    // }
    this.task.log.push(logData);

    this.apiservice.patchData(`task/${this.taskId}/`, this.task).subscribe({
      next: (response) => {
        console.log(response);
        this.getProgressState();

      }
    })
  }



  createLog(objKey: string) {
    console.log(objKey);
    const logText = this.dataservice.taskLogs[objKey]
    console.log(logText);
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
    if (objKey === 'description' || objKey === 'due_date') {
      const newState = this.task[objKey]
      return newState
    } else if (objKey === 'state' || objKey === 'priority') {
      const newState = this.dataservice.interpretation[objKey][this.task[objKey]]
      return newState
    } else if (objKey === 'subtask') {
      const newState = this.subtaskTitle;
      return newState
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

      }
    })
  }



  updateComment(index: number) {
    const comments = this.task.comments;
    const currentComment = comments[index];
    const id = currentComment.id
    console.log(currentComment);

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

}
