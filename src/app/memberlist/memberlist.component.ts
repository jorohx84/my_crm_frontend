import { Component, inject, Input } from '@angular/core';
import { APIService } from '../services/api.service';
import { ObservableService } from '../services/observable.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalService } from '../services/global.service';
import { pipe, Subject, takeUntil } from 'rxjs';
import { response } from 'express';

@Component({
  selector: 'app-memberlist',
  imports: [CommonModule, FormsModule],
  templateUrl: './memberlist.component.html',
  styleUrl: './memberlist.component.scss'
})
export class MemberlistComponent {
  apiservice = inject(APIService);
  observerservice = inject(ObservableService);
  globalservice = inject(GlobalService);
  @Input() many: boolean = false;
  members: any[] = [];
  addedMembers: any[] = [];
  allMembers: any[] = [];
  searchValue: string = '';
  isSearch: boolean = false;
  isFound: boolean = false;
  private destroy$ = new Subject<void>()
  ngOnInit() {
    this.loadUsers()
    this.susbscribeMemberListFromTaks();
  }

  loadUsers() {
    this.apiservice.getData('users/').subscribe({
      next: (response) => {
        this.members = response;
        this.allMembers = response;
      },
      error: (err) => console.log(err),

    })
  }

  sendUserdata(index: number) {
    if (this.many) {
      return
    }
    const foundMember = this.members[index];
    this.observerservice.sendMember(foundMember);
    this.globalservice.memberListOpen = false;
  }

  susbscribeMemberListFromTaks() {
    this.observerservice.memberlistSubject$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response) {
        console.log(response);
        
        this.addedMembers = response;
      }
    })
  }


  searchUser() {
    if (this.searchValue.length > 0) {
      this.isSearch = true;
      const searchedUsers: any[] = [];
      for (let index = 0; index < this.allMembers.length; index++) {
        const user = this.allMembers[index];
        if (user.profile.fullname.toLowerCase().includes(this.searchValue.toLowerCase())) {
          searchedUsers.push(user);
        }
      }
      this.isFound = searchedUsers.length > 0 ? true : false;
      this.members = searchedUsers;
    } else {
      this.members = this.allMembers;
      this.isSearch = false;
    }
  }



  addMember(member: any) {
    const uid = member.id;
    if (this.checkMemberAdded(uid)) {
      this.removeMember(uid);
    } else {
      this.addedMembers.push(uid);
    }
  }

  removeMember(uid: number) {
    const index = this.addedMembers.indexOf(uid);
    if (index > -1) {
      this.addedMembers.splice(index, 1)
    }
  }

  checkMemberAdded(uid: any) {
    return this.addedMembers.includes(uid);
  }

  sendList() {
    this.observerservice.sendMemberList(this.addedMembers);
    this.addedMembers = [];
  }

}

