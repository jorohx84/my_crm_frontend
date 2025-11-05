import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { APIService } from '../services/api.service';
import { DataService } from '../services/data.service';
import { GlobalService } from '../services/global.service';
import { ObservableService } from '../services/observable.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
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
  observerservice = inject(ObservableService);
  user: any;
  tasks: any[] = [];
  board: any = {
    undone: [],
    in_progress: [],
    under_review: [],
    done: [],
  }
  connectedBoards: any[] = [];
  stateKeys = ['undone', 'in_progress', 'under_review', 'done'];
  stateLabels: any = {
    undone: 'Undone',
    in_progress: 'In Progress',
    under_review: 'Under Review',
    done: 'Done'
  };

  ngOnInit() {
    this.loadUser()
    this.connectedBoards = Object.values(this.board);
  }

  loadUser() {
    this.userservice.getUser().subscribe((userData) => {
      if (userData) {
        this.user = userData
        console.log(userData);
        this.loadTasks(userData.id)
      }
    })
  }


  loadTasks(id: number) {
    this.apiservice.getData(`board/${id}/`).subscribe({
      next: (response) => {
        console.log(response);
        this.tasks = response;
        this.loadBoard();
      }
    })
  }




  loadBoard() {
    this.stateKeys.forEach(key => {
      this.board[key] = this.tasks.filter(task => task.state === key);
    });
  }


  drop(event: CdkDragDrop<any[]>, newState: string) {
    const movedTask = event.item?.data;

    // Wenn kein Task vorhanden → ignorieren
    if (!movedTask) return;
    console.log('shit');

    // Wenn nichts geändert wurde → ignorieren
    if (event.previousContainer === event.container && event.previousIndex === event.currentIndex) {
      return;
    }

    // Wenn zwischen Spalten verschoben
    if (event.previousContainer !== event.container) {
      console.log('%cTask wurde verschoben nach: ' + newState, 'color: limegreen; font-weight: bold');
      console.log('Task:', movedTask);

      // Verschiebe das Element im Datenmodell
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      console.log('hallo');

      // Aktualisiere State im Task-Objekt
      movedTask.state = newState;
      this.apiservice.patchData(`task/${movedTask.id}/`, { state: newState }).subscribe({
        next: (response) => {
          console.log(response);

        }
      })
    } else {
      // Innerhalb derselben Spalte neu sortiert
      console.log('Task innerhalb von', newState, 'verschoben');
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  openTaskInCustomer(task: any) {
    console.log(task);
  
this.globalservice.navigateToPath(['main', 'singlecustomer', task.customer, 'task', task.id ])
  }
}