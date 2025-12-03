import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ObservableService } from '../services/observable.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { GlobalService } from '../services/global.service';
import { LogBookService } from '../services/log.service';

@Component({
  selector: 'app-subtasks',
  imports: [CommonModule, FormsModule],
  templateUrl: './subtasks.component.html',
  styleUrl: './subtasks.component.scss'
})
export class SubtasksComponent {
  observer = inject(ObservableService);
  global = inject(GlobalService);
  logbook = inject(LogBookService);
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
      this.checkSubtasks(this.task.subtasks, this.task.members);
    }
    if (changes['oldMemberlist']) {
      console.log('NewList');

    }
  }


  checkSubtasks(subtasks: any[], members: any[]) {
    const memberIds = members.map(m => m.id);
    let changed = false;
    for (const sub of subtasks) {
      if (sub.assignee && !memberIds.includes(sub.assignee.id)) {
        sub.assignee = null;
        changed = true;
      }
    }
    if (changed) {
      this.sendDataToTask({ subtasks: this.subtasks }, 'nolog')
    }
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

  // foundMembersToDelete(memberList: any) {
  //   const foundMembers = this.logbook.findChangesInIdList(memberList, this.oldMemberlist);
  //   const deletedMembers = foundMembers.deletedMembers
  //   console.log(deletedMembers);

  //   if (deletedMembers.length > 0) {
  //     console.log('GO');



  //     this.deleteAssigneFromSubtask(deletedMembers);
  //     console.log(this.subtasks);
  //     this.task.substasks = this.subtasks;
  //     const data = {
  //       subtasks: this.subtasks,
  //     }

  //     this.sendDataToTask(data, 'nolog', null);

  //   }

  // }

  // deleteAssigneFromSubtask(deletedMembers: any[]) {
  //   const members = deletedMembers;
  //   for (let index = 0; index < members.length; index++) {
  //     const id = members[index].id;
  //     this.deleteAssigne(id);
  //   }

  //   const data = {
  //     subtasks: this.subtasks,
  //   }
  //   // this.sendDataToTask(data, 'nolog', null);
  // }

  // deleteAssigne(id: string) {
  //   console.log(id);
  //   for (let index = 0; index < this.subtasks.length; index++) {
  //     const substask = this.subtasks[index];
  //     const assignee = substask.assignee;
  //     if (assignee && assignee.id === id) {
  //       substask.assignee = null;

  //     }
  //   }

  //   console.log(this.subtasks);



  // }
}