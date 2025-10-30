import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '../services/api.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-singletask',
  imports: [CommonModule],
  templateUrl: './singletask.component.html',
  styleUrl: './singletask.component.scss'
})
export class SingletaskComponent {
  globalservice = inject(GlobalService);
  apiservice = inject(APIService);
  route = inject(ActivatedRoute);
  userservice = inject(UserService);
  taskId: string | null = null;
  task: any;
  user:any;
  customer: number | null = null;
  linewidth: number = 100;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
 
      if (id) {
        this.taskId = id
        this.loadtask(id);
      }
    });

        this.userservice.getUser().subscribe((user) => {
      if (user) {
        this.user = user;
        console.log(user);
      }
    })

  }

  loadtask(id: string | null) {
    if (id) {
      this.apiservice.getData(`task/${id}`).subscribe({
        next: (response) => {
          console.log(response);
          this.task = response;
          // this.getProgressState();
        },
        error: (err) => console.log(err)

      })
    }
  }
  backToCustomer() {
    this.globalservice.navigateToPath(['main', 'singlecustomer', this.task.customer.id, 'tasklist'])

  }


  getProgressState() {
    if (this.task.state === 'undone') {
      this.linewidth = 0;
    }
    else if (this.task.state === 'in_progress') {
      this.linewidth = 33.3;
    }
    else if (this.task.state === 'under_review') {
      this.linewidth = 66.6;
    }
    else 
      this.linewidth = 100;

    console.log(this.linewidth);
    
    }

    updateTask(newState:string){
      console.log(this.user.id);
      console.log(this.task.reviewer.id);
      
      
      // if (this.user.id !== this.task.assignee.id) {
      //   return
        
      // }
      this.task.state=newState
      this.apiservice.patchData(`task/${this.taskId}/`, this.task).subscribe({
        next:(response)=>{
          console.log(response);
          this.getProgressState();
          
        }
      })
    }
  
}
