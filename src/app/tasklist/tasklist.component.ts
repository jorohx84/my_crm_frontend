import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { ActivatedRoute } from '@angular/router';
import { ObservableService } from '../services/observable.service';
import { APIService } from '../services/api.service';
import { GlobalService } from '../services/global.service';



@Component({
  selector: 'app-tasklist',
  imports: [CommonModule],
  templateUrl: './tasklist.component.html',
  styleUrl: './tasklist.component.scss'
})
export class TasklistComponent {
  observerservice = inject(ObservableService);
  globalservice=inject(GlobalService);
  apiservice = inject(APIService);
  tasks: any[] = [];
  customerID: number | string | null = null;
  route = inject(ActivatedRoute);

  ngOnInit() {

    // this.route.paramMap.subscribe(params => {
    //   const id = params.get('id');
    //   this.customerID = id
    //   if (id) {
    //     this.loadTasks(id)
    //   }

    // });

     this.route.parent?.paramMap.subscribe(params => {
    const id = params.get('id');
    this.customerID = id;
    if (id) {
      this.loadTasks(id);
    }
  });

    this.observerservice.taskSubject$.subscribe((data) => {
      if (this.customerID) {
              this.loadTasks(this.customerID);
      }

    })

  }

  loadTasks(id: string | number | null = null) {
    console.log(id);
    
    this.apiservice.getData(`tasks/${id}`).subscribe({
      next: (response) => {
        console.log(response);
        this.tasks = response;
      }
    })
  }


  openTask(index:number){
    const currentTask=this.tasks[index];
    console.log(currentTask);
    const taskId = currentTask.id ;
    console.log(taskId);
    
    this.globalservice.navigateToPath(['main','singlecustomer', this.customerID, 'task', taskId]);
    //  this.globalservice.navigateToPath(['main', 'task', taskId]);
  }

}
