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
  route = inject(ActivatedRoute);
  member: any;
  noMember: boolean = false;
  customerID: number | string | null = null;
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


  ngOnInit() {
    this.observerservice.memberSubject$.subscribe((member) => {
      if (member) {
        console.log(member);
        this.member = member;
        this.task.assignee = member.id
        console.log(this.task.assignee);
        this.noMember = false
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.customerID = id
      console.log(this.customerID);


    });
  }

  createTask(form: NgForm) {
    this.noMember = this.checkMemberAdded();
    if (!form.valid || this.noMember) {
      form.control.markAllAsTouched(); // markiert alle Felder als "touched"
      return;
    }
    this.task.customer = this.customerID;
    const requestData = this.createTaskObject();
    this.apiservice.postData('tasks/', requestData).subscribe({
      next: (response) => {
        console.log(response);
        this.observerservice.triggerloadTask()
      },
      error: (err) => console.log(err)

    })
    this.globalservice.taskWrapperOpen = false;


    this.resetTask(form)


  }
  createTaskObject() {
    return {
      title: this.task.title,
      description: this.task.description,
      customer: this.task.customer,
      assignee: this.task.assignee,
      state: 'undone',
      priority: this.task.priority,
      due_date: this.task.due_date,
    }
  }

  checkMemberAdded() {
    const isMember = this.member ? false : true;
    return isMember
  }

  resetTask(form: NgForm) {
    this.task.priority = 'low';
    this.member = {};
    this.noMember = false;
    form.resetForm();
    this.globalservice.taskWrapperOpen = false;
  }

  setPriority(prio: string) {
    console.log(prio);
    this.task.priority = prio;
  }
}
