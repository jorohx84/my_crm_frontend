import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MemberlistComponent } from '../memberlist/memberlist.component';
import { GlobalService } from '../services/global.service';
import { ObservableService } from '../services/observable.service';
import { ActivatedRoute } from '@angular/router';
import { flatMap, take } from 'rxjs';
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
  templatesOpen: boolean = false;
  singleTemplateOpen: boolean = false;
  priocontOpen: boolean = false;
  noMember: boolean = false;
  customerID: number | string | null = null;
  checklistTaskText: string = '';
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
    checklist: [],
  };
  mainTask: any | null = null;
  taskTemplates: any[] = [];
  taskTemplate: any = {
    title: '',
    description: '',
    checkliste: [],
  };
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
      const id = params.get('customer_id');
      this.customerID = id
    });
  }

  loadTask() {
    this.observerservice.taskSubject$.subscribe((taskObj) => {
      if (taskObj) {
        console.log(taskObj);

        this.mainTask = taskObj;
      }
    })
  }

  loadTemplates() {
    this.apiservice.getData('task/template/').subscribe({
      next: (response) => {
        this.taskTemplates = response;
        this.templatesOpen = true
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
    this.saveTask();
    this.globalservice.taskWrapperOpen = false;

    this.resetTask(form)
  }

  createLogElement(task: any) {
    return {
      task: task.id,
      log: 'Aufgabe wurde erstellt',
      new_state: 'Neue Aufgabe',
    }
  }
  createTaskObject() {

    return {
      parent: null,
      title: this.task.title,
      description: this.task.description,
      customer: this.task.customer,
      assignee: this.task.assignee,
      state: 'undone',
      priority: this.task.priority,
      due_date: this.task.due_date,
      log: [],

      checklist: this.task.checklist,
    }
  }

  saveTask() {
    const requestData = this.createTaskObject();
    this.apiservice.postData('tasks/', requestData).subscribe({
      next: (response) => {
        this.openNewTask(response);
        const newTask = response;
        this.globalservice.saveLog('create', newTask);
        this.globalservice.navigateToPath(['main', 'singlecustomer', this.customerID, 'task', newTask.id])

      },
      error: (err) => console.log(err)
    })
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
    this.member = null;
    this.noMember = false;
    this.globalservice.isSubtaskWrapper = false;
    form.resetForm();
    this.globalservice.taskWrapperOpen = false;
  }

  setPriority(prio: string) {
    this.task.priority = prio;
    this.priocontOpen = false;
  }

  getTemplate(index: number) {
    const currentTemplate = this.taskTemplates[index];

    console.log(currentTemplate);
    this.task.title = currentTemplate.title;
    this.task.description = currentTemplate.description;
    this.task.checklist = currentTemplate.checklist;
    this.templatesOpen = false;

  }

  openSingleTemplate(index: number, event: Event) {
    this.taskTemplate = this.taskTemplates[index];
    this.singleTemplateOpen = true;
    event.stopPropagation();
  }

  deleteChecklistTask(index: number) {
    console.log(index);

    const checklist = this.taskTemplate.checklist
    console.log(checklist);

    checklist.splice(index, 1)
    console.log(checklist);
    console.log(this.taskTemplate);

  }

  addChecklistTask() {
    const task = {
      text: '',
      is_checked: false,
      is_saved: true,
    }
    this.taskTemplate.checklist.push(task);
    console.log(this.taskTemplate.checklist);
    this.checklistTaskText = '';
  }


  saveTaskTemplateChanges() {
    const id = this.taskTemplate.id;
    console.log(this.taskTemplate.checklist);

    const data = {
      title: this.taskTemplate.title,
      description: this.taskTemplate.description,
      checklist: this.taskTemplate.checklist,
    }
    console.log(data);

    this.apiservice.patchData(`task/template/${id}/`, data).subscribe({
      next: (response) => {
        console.log(response);
        this.closeTemplate();
      }
    })
  }

  closeTemplate() {
    this.singleTemplateOpen = false
  }
}
