import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MemberlistComponent } from '../memberlist/memberlist.component';
import { GlobalService } from '../services/global.service';
import { ObservableService } from '../services/observable.service';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { APIService } from '../services/api.service';
import { response } from 'express';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { MessageService } from '../services/message.service';
@Component({
  selector: 'app-taskwrapper',
  imports: [CommonModule, FormsModule, MemberlistComponent],
  templateUrl: './taskwrapper.component.html',
  styleUrl: './taskwrapper.component.scss'
})
export class TaskwrapperComponent {
  apiservice = inject(APIService);
  globalservice = inject(GlobalService);
  observerservice = inject(ObservableService);
  userservice = inject(UserService);
  messageservice = inject(MessageService);
  route = inject(ActivatedRoute);
  member: any;
  noMember: boolean = false;
  customerID: number | string | null = null;
  user: any;
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
    log: [],
  };
  mainTaskId: string = '';

  ngOnInit() {
    this.loadUser()
    this.loadMember();
    this.loadTemplate();
    this.loadTask();
  }


  loadUser() {
    this.userservice.getUser().subscribe((user) => {
      if (user) {
        this.user = user;
      }
    })
  }
  loadMember() {
    this.observerservice.memberSubject$.subscribe((member) => {
      if (member) {
        this.member = member;
        this.task.assignee = member.id
        this.noMember = false
      }
    });
  }

  loadTemplate() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.customerID = id
    });
  }

  loadTask() {
    this.observerservice.taskSubject$.subscribe((taskObj) => {
      if (taskObj) {
        this.mainTaskId = taskObj.id;
      }
    })
  }


  createTask(form: NgForm) {
    this.noMember = this.checkMemberAdded();
    if (!form.valid || this.noMember) {
      form.control.markAllAsTouched();
      return;
    }
    this.task.customer = this.customerID;
    this.createLogElement()
    this.saveTask();
    this.globalservice.taskWrapperOpen = false;
    this.globalservice.isSubtaskWrapper = false;
    this.resetTask(form)
  }

  createLogElement() {
    this.task.log.push({
      logged_at: new Date().toISOString(),
      updated_by: {
        id: this.user.id,
        fullname: this.user.fullname,
      },
      log: 'Aufgabe wurde erstellt',
      newState: '',
    });
  }
  createTaskObject() {
    return {
      parent: this.mainTaskId || null,
      title: this.task.title,
      description: this.task.description,
      customer: this.task.customer,
      assignee: this.task.assignee,
      state: 'undone',
      priority: this.task.priority,
      due_date: this.task.due_date,
      log: this.task.log,
      type: this.globalservice.isSubtaskWrapper ? 'subtask' : 'task',
    }
  }

  saveTask() {
    const requestData = this.createTaskObject();
    this.apiservice.postData('tasks/', requestData).subscribe({
      next: (response) => {
        this.openNewTask(response);
        // this.sendSystemMessage(response)

      },
      error: (err) => console.log(err)
    })
  }

  sendSystemMessage(task: any) {
    console.log(task);
    
    const text = 'Neue Aufgabe wurde Ihrem Board hinzugefügt';
    const urlStr = ['main', 'singlecustomer', this.customerID, 'task', task.id]
    const param = { type: task.type }
    console.log(param);
    
    // this.messageservice.sendSystemMessage(this.user.id, this.task.assignee, urlStr, text, param);
  }

  openNewTask(task: any) {
    const taskID = task.id
    const param = { type: task.type };
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.customerID, 'task', taskID], param);
  }



  checkMemberAdded() {
    const isMember = this.member ? false : true;
    return isMember
  }

  resetTask(form: NgForm) {
    this.task.priority = 'low';
    this.member = {};
    this.noMember = false;
    this.globalservice.isSubtaskWrapper = false;
    form.resetForm();
    this.globalservice.taskWrapperOpen = false;
  }

  setPriority(prio: string) {
    this.task.priority = prio;
  }
}
