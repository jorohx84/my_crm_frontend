import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MemberlistComponent } from '../memberlist/memberlist.component';
import { GlobalService } from '../services/global.service';
import { ObservableService } from '../services/observable.service';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { MessageService } from '../services/message.service';
import { CdkVirtualScrollableElement } from "@angular/cdk/scrolling";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-taskwrapper',
  imports: [CommonModule, FormsModule, MemberlistComponent, CdkVirtualScrollableElement],
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
  private destroy$ = new Subject<void>();
  member: any;
  templatesOpen: boolean = false;
  singleTemplateOpen: boolean = false;
  priocontOpen: boolean = false;
  noMember: boolean = false;
  customerID: number | string | null = null;
  subtaskText: string = '';
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
    this.loadMember();
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
  loadMember() {
    this.observerservice.memberSubject$.pipe(takeUntil(this.destroy$)).subscribe((member) => {
      if (member) {
        this.member = member;

        this.task.assignee = member.id
        console.log(member.id);


        this.noMember = false
      }
    });
  }

  loadTemplate() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('customer_id');
      this.customerID = id
    });
  }

  loadTask() {
    this.observerservice.taskSubject$.pipe(takeUntil(this.destroy$)).subscribe((taskObj) => {
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
      subtasks: this.task.subtasks,
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
    this.task.subtasks = currentTemplate.subtasks;
    this.templatesOpen = false;

  }

  openSingleTemplate(index: number, event: Event) {
    this.taskTemplate = this.taskTemplates[index];
    this.singleTemplateOpen = true;
    event.stopPropagation();
  }

  deleteSubtask(index: number) {
    console.log(index);

    const subtasks = this.taskTemplate.subtasks
    console.log(subtasks);

    subtasks.splice(index, 1)
    console.log(subtasks);
    console.log(this.taskTemplate);

  }

  addSubtask() {
    const task = {
      text: '',
      is_checked: false,
      is_saved: true,
    }
    this.taskTemplate.subtasks.push(task);
    console.log(this.taskTemplate.subtasks);
    this.subtaskText = '';
  }


  saveTaskTemplateChanges() {
    const id = this.taskTemplate.id;
    console.log(this.taskTemplate.subtasks);

    const data = {
      title: this.taskTemplate.title,
      description: this.taskTemplate.description,
      subtasks: this.taskTemplate.subtasks,
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
