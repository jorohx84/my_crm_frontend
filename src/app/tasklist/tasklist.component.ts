import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { ActivatedRoute } from '@angular/router';
import { ObservableService } from '../services/observable.service';
import { APIService } from '../services/api.service';
import { GlobalService } from '../services/global.service';
import { TaskwrapperComponent } from '../taskwrapper/taskwrapper.component';



@Component({
  selector: 'app-tasklist',
  imports: [CommonModule, TaskwrapperComponent],
  templateUrl: './tasklist.component.html',
  styleUrl: './tasklist.component.scss'
})
export class TasklistComponent {
  observerservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  apiservice = inject(APIService);
  tasks: any[] = [];
  customerID: number | string | null = null;
  route = inject(ActivatedRoute);
  counts: any[] = [];
  countsLoaded: boolean = false;
  filteredTaskList: any[] = [];

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      this.globalservice.sidebarOpen = params['sidebarOpen']; // Wert auslesen
    });

    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      this.customerID = id;
      if (id) {
        this.loadTasks(id);
      }
    });

    this.observerservice.taskTriggerSubject$.subscribe((data) => {
      if (this.customerID) {
        this.loadTasks(this.customerID);
      }

    })

  }

  getSubtaskCount() {
    for (let index = 0; index < this.tasks.length; index++) {
      const task = this.tasks[index];

      this.apiservice.getData(`subtasks/count/${task.id}`).subscribe({
        next: (response) => {
          task.counts = response
          this.countsLoaded = true;
        }
      })
    }
    console.log(this.tasks);

  }

  loadTasks(id: string | number | null = null) {
    console.log(id);

    this.apiservice.getData(`tasks/${id}`).subscribe({
      next: (response) => {
        this.tasks = response;
        this.getSubtaskCount()
        this.filterTasks('undone')
      }
    })
  }
  filterTasks(filter: string) {
    console.log(filter);
    if (filter === 'done') {
      const filteredTasks = this.tasks.filter(task => task.state === 'done');
      this.filteredTaskList = filteredTasks
    } else if (filter === 'undone') {
      const filteredTasks = this.tasks.filter(task => task.state !== 'done');
      this.filteredTaskList = filteredTasks
    }

    console.log(this.filteredTaskList);

  }

  openTask(index: number) {
    const currentTask = this.filteredTaskList[index];
    const taskId = currentTask.id;
    const queryParam = {
      type: currentTask.type,
      sidebarOpen:false,
    }
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.customerID, 'task', taskId], queryParam);
    //  this.globalservice.navigateToPath(['main', 'task', taskId]);

  }



  getCountLinePercentage(index: number) {

    if (this.countsLoaded) {
      const task = this.tasks[index];
      const completedTasks = task.counts?.completed_count;
      const totalTasks = task.counts?.total_count;
      const percentage = (completedTasks / totalTasks) * 100 || 0;
      return percentage
    }
    return 0

  }
}
