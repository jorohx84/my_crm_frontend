import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { APIService } from '../services/api.service';
import { GlobalService } from '../services/global.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tasksidebar',
  imports: [CommonModule, FormsModule],
  templateUrl: './tasksidebar.component.html',
  styleUrl: './tasksidebar.component.scss'
})
export class TasksidebarComponent {
  api = inject(APIService);
  global = inject(GlobalService);
  userservice = inject(UserService);
  route = inject(ActivatedRoute);
  task: any;

  user: any;
  logBook: any[] = [];
  sortedComments: any[] = [];
  sidebarKey: string = 'comments';
  taskID: string = '';

  comment: any = {
    task: '',
    creator: {},
    text: '',
    created_at: '',
  }
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.subscribeUser();
    this.loadTemplate();
  }

  loadTemplate() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((param) => {
      if (param) {
        const id = param.get('task_id')
        console.log(id);

        if (id) {
          this.taskID = id;
          this.loadComments(id);
          this.loadLog(id);
        }

      }
    })
  }


  loadComments(id: string) {
    this.api.getData(`comments/${id}/`).subscribe({
      next: (response) => {
        console.log(response);
        this.sortedComments = this.global.sortListbyTime(response, 'created_at', 'down')
      }
    })

  }

    loadLog(id: string) {
    this.api.getData(`task/logs/${id}`).subscribe({
      next: (response) => {
        this.logBook = this.global.sortListbyTime(response, 'logged_at', 'down');
        console.log(this.logBook);
        
      }
    })
  }

  subscribeUser() {
    this.userservice.getUser().pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) { this.user = user; }
    })
  }
  createComment() {
    const commentData = {
      task: this.taskID,
      text: this.comment.text,
    }
    this.api.postData('comment-create/', commentData).subscribe({
      next: (response) => {
        console.log(response);

        const id = this.taskID
        this.sidebarKey = 'comments';
        this.comment.text = '';
        this.loadComments(this.taskID);
      }
    });
  }



  updateComment(index: number) {
    const comments = this.task.comments;
    const currentComment = comments[index];
    const id = currentComment.id
    this.api.patchData(`comments/${id}/`, currentComment).subscribe({
      next: (response) => {
        const id = this.task.id
        console.log(response);

        console.log('Kommentar bearbeitet!', response);
      }
    })

  }

  deleteComment(index: number) {
    const comments = this.task.comments;
    const currentComment = comments[index];
    const id = currentComment.id
    this.api.deleteData(`comments/${id}/`, currentComment).subscribe({
      next: (response) => {
        const id = this.task.id
        console.log(response);

        console.log('Kommentar bearbeitet!', response);

      }
    })
  }


  changeSidebarContent(key: string) {
    this.sidebarKey = key;
  }








}


