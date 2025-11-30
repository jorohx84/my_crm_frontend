import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ObservableService } from '../services/observable.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subtasks',
  imports: [CommonModule, FormsModule],
  templateUrl: './subtasks.component.html',
  styleUrl: './subtasks.component.scss'
})
export class SubtasksComponent {
  observer = inject(ObservableService);
  task: any;
  subtasks: any[] = [];
  subtaskText: string = '';
  private destroy$ = new Subject<void>()
  currentSubtask: any;
  assigneListOpen: boolean = false;



  ngOnInit() {
    this.subscribeTask();
  }

  subscribeTask() {
    this.observer.taskSubject$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response) {
        this.setTaskData(response)
      };


    })
  }

  setTaskData(res: any) {
    this.task = res;
    this.subtasks = res.subtasks;
  }

  addSubtask() {
    const listObj = {
      text: '',
      is_checked: false,
      is_saved: false,
      assignee: null,
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
    this.sendDataToTask(data, 'checklist');
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
    this.subtaskText = checkbox.text
    const log = checkbox.is_checked ? 'tododone' : 'todoundone';
    this.sendDataToTask(data, log)
  }


  openAssigneList(subtask: any) {
    console.log(subtask);
    this.currentSubtask = subtask
    this.assigneListOpen = true;
  }

  setAssignee(assignee: any) {
    this.currentSubtask.assignee = assignee.profile.color;
    const data = {
      subtasks: this.task.subtasks
    }
    this.sendDataToTask(data, 'assignee')
    this.assigneListOpen = false;
  }



  sendDataToTask(data: any, key: string) {
    const responseData = {
      data: data,
      key: key,
    }
    this.observer.sendSubtask(responseData);
  }
}