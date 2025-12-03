import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { GlobalService } from '../services/global.service';
import { ObservableService } from '../services/observable.service';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { MessageService } from '../services/message.service';
import { Subject, takeUntil } from 'rxjs';
import { LogBookService } from '../services/log.service';

@Component({
  selector: 'app-taskwrapper',
  imports: [CommonModule, FormsModule],
  templateUrl: './taskwrapper.component.html',
  styleUrl: './taskwrapper.component.scss'
})
export class TaskwrapperComponent {
  apiservice = inject(APIService);
  logbook=inject(LogBookService);
  globalservice = inject(GlobalService);
  observerservice = inject(ObservableService);
  userservice = inject(UserService);
  messageservice = inject(MessageService);
  route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  // member: any;
  templatesOpen: boolean = false;
  singleTemplateOpen: boolean = false;
  priocontOpen: boolean = false;
  // noMember: boolean = false;
  customerID: number | string | null = null;
  subtaskText: string = '';
  user: any;
  task: any = {
    title: '',
    description: '',
    customer: null,
    state: 'todo',
    comment: '',
    priority: 'low',
    created_at: '',
    updated_at: '',
    due_date: '',
    reviewer: '',
    completed_at: '',
    log: [],
    subtasks: [],
  };
  mainTask: any | null = null;
  taskTemplates: any[] = [];
  taskTemplate: any = {
    title: '',
    description: '',
    subtasks: [],
  };
  ngOnInit() {
    this.loadUser()
    // this.loadMember();
    this.loadTemplate();
    this.loadTask();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser() {
    this.userservice.getUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.user = user;
      }
    })
  }
  // loadMember() {
  //   this.observerservice.memberSubject$.pipe(takeUntil(this.destroy$)).subscribe((member) => {
  //     if (member) {
  //       this.member = member;

  //       this.task.assignee = member.id
  //       console.log(member.id);


  //       this.noMember = false
  //     }
  //   });
  // }

  loadTemplate() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('customer_id');
      this.customerID = id
    });
  }

  loadTask() {
    this.observerservice.taskSubject$.pipe(takeUntil(this.destroy$)).subscribe((taskObj) => {
      if (taskObj) {

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
    // this.noMember = this.checkMemberAdded();
    if (!form.valid) {
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


  saveTask() {
    const requestData = this.createTaskObject();
    this.apiservice.postData('tasks/', requestData).subscribe({
      next: (response) => {
        this.openNewTask(response);
        const newTask = response;
        this.logbook.saveTaskLog('create', newTask);
        this.globalservice.navigateToPath(['main', 'singlecustomer', this.customerID, 'singletask', newTask.id])
        this.observerservice.sendConfirmation('Aufgabe wurde erstellt');
      },
      error: (err) => console.log(err)
    })
  }

    createTaskObject() {

    return {
      title: this.task.title,
      description: this.task.description,
      customer: this.task.customer,
      state: 'undone',
      priority: this.task.priority,
      due_date: this.task.due_date,
      log: [],
      subtasks: this.task.subtasks,
    }
  }

  openNewTask(task: any) {
    const taskID = task.id
    const param = { type: task.type };
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.customerID, 'task', taskID], param);
  }


  resetTask(form: NgForm) {
    this.task.priority = 'low';
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
    this.task.title = currentTemplate.title;
    this.task.description = currentTemplate.description;
    this.task.subtasks = currentTemplate.subtasks;
    this.templatesOpen = false;

  }

  openSingleTemplate(index: number, event: Event) {
    this.taskTemplate = this.taskTemplates[index];
    this.singleTemplateOpen = true;
    event.stopPropagation();
  }

  deleteSubtask(index: number) {
    const subtasks = this.taskTemplate.subtasks
    subtasks.splice(index, 1)

  }

  addSubtask() {
    const task = {
      text: '',
      is_checked: false,
      is_saved: true,
    }
    this.taskTemplate.subtasks.push(task);
    this.subtaskText = '';
  }


  saveTaskTemplateChanges() {
    const id = this.taskTemplate.id;
    const data = {
      title: this.taskTemplate.title,
      description: this.taskTemplate.description,
      subtasks: this.taskTemplate.subtasks,
    }

    this.apiservice.patchData(`task/template/${id}/`, data).subscribe({
      next: (response) => {
        this.closeTemplate();
      }
    })
  }

  closeTemplate() {
    this.singleTemplateOpen = false
  }
}
