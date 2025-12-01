import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ObservableService } from '../services/observable.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subtasks',
  imports: [CommonModule, FormsModule],
  templateUrl: './subtasks.component.html',
  styleUrl: './subtasks.component.scss'
})
export class SubtasksComponent implements OnChanges {
  observer = inject(ObservableService);
  @Input() task: any;
  @Input() subtasks: any[] = [];
  @Output() subtaskChanged = new EventEmitter();
  subtaskText: string = '';
  oldSubtask: any;
  private destroy$ = new Subject<void>()
  currentSubtask: any;
  currentIndex: number | null = null;
  assigneListOpen: boolean = false;
  isEmpty: boolean = false;
  ngOnChanges(changes: SimpleChanges) {
    if (changes['task']) {
      this.subtasks = this.task.subtasks

    }
  }

  ngOnInit() {

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

  saveSubtask(subtask: any) {
    const count = this.countEmptyTask();
    this.isEmpty = count > 0 ? true : false;
    if (this.isEmpty) { return }
    subtask.is_saved = true;
    const data = {
      subtasks: this.subtasks,
    }
    this.sendDataToTask(data, 'subtask_create', subtask.text);
  }

  countEmptyTask() {
    const subtasks = this.subtasks;
    let count = 0;
    for (let index = 0; index < subtasks.length; index++) {
      const subtask = subtasks[index];
      if (subtask.text === '') {
        count++
      }
    }
    return count
  }


  saveCurrentSubtask(index: number) {
    this.currentIndex = index;
    const currentSubtask = this.subtasks[index]
    console.log(currentSubtask);
    this.oldSubtask = JSON.parse(JSON.stringify(currentSubtask));

  }

  changeIsChecked(index: number) {
    const currentSubtask = this.subtasks[index]
    currentSubtask.is_checked = !currentSubtask.is_checked
    const data = {
      subtasks: this.subtasks,
    }
    this.subtaskText = currentSubtask.text
    const log = currentSubtask.is_checked ? 'subtask_done' : 'subtask_undone';
    this.sendDataToTask(data, log, currentSubtask.text)
  }


  openAssigneList(subtask: any) {
    this.currentSubtask = subtask
    this.assigneListOpen = !this.assigneListOpen;
  }

  setAssignee(assignee: any) {
    this.currentSubtask.assignee = assignee.profile.color;
    const data = {
      subtasks: this.task.subtasks
    }
    const logData = {
      assignee: assignee,
      subtask: this.currentSubtask
    }
    this.sendDataToTask(data, 'assignee', logData);
    this.assigneListOpen = false;
  }

  deleteTask(index: number, subtask: any) {
    console.log(index);
    this.subtasks.splice(index, 1);
    const data = {
      subtasks: this.subtasks,
    }
    this.sendDataToTask(data, 'subtask_delete', subtask.text);
  }



  sendDataToTask(data: any, key: string, varObj: any = null) {
    const responseData = {
      data: data,
      key: key,
      obj: varObj,
    }
    console.log(responseData);

    this.subtaskChanged.emit(responseData);
    // this.observer.sendSubtask(responseData);
  }


}