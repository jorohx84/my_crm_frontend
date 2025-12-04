import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ObservableService } from '../services/observable.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { GlobalService } from '../services/global.service';
import { LogBookService } from '../services/log.service';
import { DragDropModule, CdkDropList } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PermissionService } from '../services/permissions.service';

@Component({
  selector: 'app-subtasks',
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './subtasks.component.html',
  styleUrl: './subtasks.component.scss'
})
export class SubtasksComponent {
  observer = inject(ObservableService);
  global = inject(GlobalService);
  logbook = inject(LogBookService);
  permission=inject(PermissionService);
  @Input() task: any;
  subtasks: any[] = [];
  @Output() subtaskChanged = new EventEmitter();
  @Input() oldMemberlist: any[] = [];

  subtaskText: string = '';
  oldSubtask: any;
  private destroy$ = new Subject<void>()
  currentSubtask: any;
  currentIndex: any;
  assigneListOpen: boolean = false;
  isEmpty: boolean = false;
  deleteWrapperOpen: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['task']) {
      this.subtasks = this.task.subtasks
      this.checkSubtasks();
    }
  }


  checkSubtasks() {
    if (this.newListisShorter()) {
      const changed = this.deleteAssignee();
      if (changed) {
        this.sendDataToTask({ subtasks: this.subtasks }, 'nolog')
      }
    }
  }

  deleteAssignee() {
    const subtasks: any[] = this.task.subtasks;
    const members: any[] = this.task.members;
    const memberIds = members.map((m) => m.id);
    let changed = false;
    for (const sub of subtasks) {
      if (sub.assignee && !memberIds.includes(sub.assignee.id)) {
        sub.assignee = null;
        changed = true;
      }
    }
    return changed
  }


  newListisShorter() {
    return this.oldMemberlist.length > this.task.members.length;
  }



  // subscribeMemberList() {
  //   this.observer.memberlistSubject$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
  //     if (response) {
  //       this.foundMembersToDelete(response);
  //       console.log(response);

  //     }
  //   })
  // }

  addSubtask() {
    const listObj = {
      text: '',
      is_checked: false,
      is_saved: false,
      assignee: null,
    }
    this.subtasks.push(listObj)
  }

  saveSubtask(subtask: any, index: number) {
    const count = this.countEmptyTask();
    this.isEmpty = count > 0 ? true : false;
    if (this.isEmpty) { return }
    subtask.is_saved = true;
    // if (!subtask.ordering) {
    //   console.log('Ordering');
    //   subtask.ordering = index;
    // }

    console.log(subtask);

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
    console.log(assignee);

    this.currentSubtask.assignee = this.getAssignee(assignee);
    console.log(this.currentSubtask);

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

  getAssignee(assignee: any) {
    return {
      id: assignee.id,
      fullname: assignee.profile.fullname,
      initials: assignee.profile.initials,
      color: assignee.profile.color,
    }
  }

  deleteTask() {

    this.subtasks.splice(this.currentIndex, 1);
    const data = {
      subtasks: this.subtasks,
    }
    this.deleteWrapperOpen = false;
    this.global.isoverlay = false;
    this.sendDataToTask(data, 'subtask_delete', this.currentIndex.text);
  }



  sendDataToTask(data: any, key: string, varObj: any = null) {
    const responseData = {
      data: data,
      key: key,
      obj: varObj,
    }
    console.log(responseData);

    this.subtaskChanged.emit(responseData);

  }
  openDelete(index: number, subtask: number) {
    this.currentSubtask = subtask;
    this.currentIndex = index;
    this.deleteWrapperOpen = true;
    this.global.isoverlay = true;
  }

  drop(event: CdkDragDrop<any[]>) {
    if (!this.permission.isMember(this.task.members)){return}
    moveItemInArray(this.subtasks, event.previousIndex, event.currentIndex);
    this.sendDataToTask({ subtasks: this.subtasks }, 'nolog')
  }

}