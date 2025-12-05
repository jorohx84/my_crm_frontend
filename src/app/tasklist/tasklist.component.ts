import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { ActivatedRoute } from '@angular/router';
import { ObservableService } from '../services/observable.service';
import { APIService } from '../services/api.service';
import { GlobalService } from '../services/global.service';
import { Subject, takeUntil } from 'rxjs';



@Component({
  selector: 'app-tasklist',
  imports: [CommonModule],
  templateUrl: './tasklist.component.html',
  styleUrl: './tasklist.component.scss'
})
export class TasklistComponent {
  observerservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  apiservice = inject(APIService);
  dataservice = inject(DataService);
  private destroy$ = new Subject<void>();
  tasks: any[] = [];
  customerID: number | string | null = null;
  route = inject(ActivatedRoute);
  counts: any[] = [];
  countsLoaded: boolean = false;

  filteredTaskList: any[] = [];
 constructor() {
    this.globalservice.setCustomerProfileState();
  }

  ngOnInit() {
    this.loadCustomerFromURL();
    this.subscribeCustomer();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCustomerFromURL() {
    this.route.parent?.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('customer_id');
      this.customerID = id;
      if (id) {
        this.loadTasks(id, 'open');
      }
    });
  }

  subscribeCustomer() {
    this.observerservice.taskTriggerSubject$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (this.customerID) {
        this.loadTasks(this.customerID, 'open');
      }
    })
  }




  loadTasks(id: string | number | null = null, filter: string) {
    console.log(id);

    this.apiservice.getData(`tasks/${id}/${filter}`).subscribe({
      next: (response) => {
        this.tasks = response;
        console.log(response);

      }
    })
  }


  openTask(index: number) {
    const currentTask = this.tasks[index];
    const taskId = currentTask.id;

    this.globalservice.navigateToPath(['main', 'singlecustomer', this.customerID, 'singletask', taskId]);
  }


  countSubtasksDone(index: number, countKey: string) {
    const task = this.tasks[index];
    const subtasks = task.subtasks
    let count = 0;
    for (let index = 0; index < subtasks.length; index++) {
      const subtask = subtasks[index];
      if (subtask.is_checked === true) {
        count++
      }
    }



    return
  }
  // getCountLinePercentage(index: number) {

  //   if (this.countsLoaded) {
  //     const task = this.tasks[index];
  //     const completedTasks = task.counts?.completed_count;
  //     const totalTasks = task.counts?.total_count;
  //     const percentage = (completedTasks / totalTasks) * 100 || 0;
  //     return percentage
  //   }
  //   return 0

  // }
}
