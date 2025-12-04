import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { APIService } from '../services/api.service';
import { DataService } from '../services/data.service';
import { GlobalService } from '../services/global.service';
import { ObservableService } from '../services/observable.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';
import { LogBookService } from '../services/log.service';

@Component({
  selector: 'app-board',
  imports: [CommonModule, DragDropModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  globalservice = inject(GlobalService);
  userservice = inject(UserService);
  dataservice = inject(DataService);
  apiservice = inject(APIService);
  logbook=inject(LogBookService);
  observerservice = inject(ObservableService);
  user: any;
  countsLoaded: boolean = false;
  releasesWrapperOpen: boolean = false;
  private destroy$ = new Subject<void>();

  boardKey: string = '';
  tasks: any = {
    assigned: [],
    reviewed: [],
  };
  board: any = {
    undone: [],
    in_progress: [],
    under_review: [],
    done: [],
  }
  releases: any[] = [];
  // connectedBoards: any[] = [];
  stateKeys = ['undone', 'in_progress', 'under_review', 'done'];
  stateLabels: any = {
    undone: 'Offen',
    in_progress: 'In Bearbeitung',
    under_review: 'Rückmeldung',
    done: 'Erledigt',

  };

  columns = [
    { id: 'undoneList', key: 'undone' },
    { id: 'inProgressList', key: 'in_progress' },
    { id: 'underReviewList', key: 'under_review' },
    { id: 'doneList', key: 'done' },

  ];


  constructor() {
    this.boardKey = this.dataservice.getDataFromLocalStorage('board') || 'assigned';
    this.releasesWrapperOpen = this.dataservice.getDataFromLocalStorage('releases');
  }

  ngOnInit() {
    this.loadUser()
    // this.connectedBoards = Object.values(this.board);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  connectedLists(currentId: string) {
    return this.columns.filter(col => col.id !== currentId).map(col => col.id);
  }

  loadUser() {
    this.userservice.getUser().pipe(takeUntil(this.destroy$)).subscribe((userData) => {
      if (userData) {
        this.user = userData
        console.log(userData);
        // this.loadAssignedTasks(userData.id);
        // this.loadReviewedTasks(userData.id);

        this.loadTasks(userData.id, this.boardKey);
        if (this.releasesWrapperOpen) {
          this.loadReleases();

        }

      }
    })
  }

  loadTasks(id: number, taskKey: string) {
    this.apiservice.getData(`board/${id}/${taskKey}/`).subscribe({
      next: (response) => {
        this.setTasks(response, taskKey);

      }
    })
  }

  setTasks(taskList: any[], taskKey: string) {
    this.tasks[taskKey] = taskList;
    console.log(this.tasks);
console.log(taskList);

    if (taskKey !== 'releases') {
      this.loadBoard(taskKey);
    }
  }

  loadBoard(taskKey: string) {

    const tasks = this.tasks[taskKey];
    console.log(tasks);

    console.log(tasks);
    this.stateKeys.forEach(key => {
      this.board[key] = tasks.filter((task: any) => task.state === key).sort((a: any, b: any) => a.board_position - b.board_position);
      console.log(this.board[key]);

    });

  }



  getCountLinePercentage(index: number, array: any) {

    if (this.countsLoaded) {
      const task = array[index];
      const completedTasks = task.counts?.completed_count;
      const totalTasks = task.counts?.total_count;
      const percentage = (completedTasks / totalTasks) * 100 || 0;
      return percentage
    }
    return 0

  }

  drop(event: CdkDragDrop<any[]>, newState: string) {
    const movedTask = event.item?.data;

    // // Wenn kein Task vorhanden → ignorieren
    // if (!movedTask) return;

    // // Wenn nichts geändert wurde → ignorieren
    // if (event.previousContainer === event.container && event.previousIndex === event.currentIndex) {
    //   return;
    // }

    // Wenn zwischen Spalten verschoben
    if (event.previousContainer !== event.container) {
      // console.log('%cTask wurde verschoben nach: ' + newState, 'color: limegreen; font-weight: bold');
      // console.log('Task:', movedTask);

      // Verschiebe das Element im Datenmodell
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.updateBoardPosition(event.container.data, newState)
    } else {
      // Innerhalb derselben Spalte neu sortiert
      console.log('Task innerhalb von', newState, 'verschoben');
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      console.log('nix passiert');
      this.updateBoardPosition(event.container.data, newState)


    }
  }

  updateBoardPosition(tasks: any[], newState: string) {
    tasks.forEach((task, index) => {
      task.board_position = index;
      const data = {
        state: newState,
        board_position: index,
      }
      this.apiservice.patchData(`task/${task.id}/`, data).subscribe({
        next: (response) => {
          console.log(response);

          this.logbook.saveTaskLog('state', response)
        }
      })

    })
  }


  toggleReleasesWrapper() {
    this.releasesWrapperOpen = !this.releasesWrapperOpen;
    this.dataservice.saveDataToLocalStorage('releases', this.releasesWrapperOpen)
    if (!this.releasesWrapperOpen) {
      return
    }

    this.loadReleases()
  }

  loadReleases() {
    this.apiservice.getData(`board/${this.user.id}/releases/`).subscribe({
      next: (response) => {
        console.log(response);
        this.releases = response

      }
    })
  }



  openTaskInCustomer(task: any) {
    console.log(task);
    const queryParams = {
      type: task.type
    }
    console.log(queryParams);


    this.globalservice.navigateToPath(['main', 'singlecustomer', task.customer.id, 'singletask', task.id], queryParams)
  }

  changeList(list: string) {
    this.boardKey = list;
    console.log(this.boardKey);
    this.dataservice.saveDataToLocalStorage('board', list);
    this.releasesWrapperOpen = false;
    this.dataservice.saveDataToLocalStorage('releases', false)
  }

  // countSubtasksDone(index: number, tasksList: any[], countKey: string) {
  //   const tasks = tasksList;

  //   const task = tasks[index]
  //   let count = 0;
  //   for (let index = 0; index < task.subtasks.length; index++) {
  //     const check = task.subtasks[index];
  //     if (check.is_checked) {
  //       count++;
  //     }
  //   }
  //   const percentage = (count / task.subtasks.length) * 100
  //   if (countKey === 'percentage') {
  //     return percentage
  //   } else {
  //     return count
  //   }


  // }
}