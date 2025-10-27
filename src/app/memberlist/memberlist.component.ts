import { Component, inject } from '@angular/core';
import { APIService } from '../services/api.service';
import { ObservableService } from '../services/observable.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalService } from '../services/global.service';

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
  members: any[] = [];
  allMembers: any[] = [];
  searchValue: string = '';
  isSearch: boolean = false;
  isFound: boolean = false;
  ngOnInit() {
    this.loadUsers()
  }

  loadUsers() {
    this.apiservice.getData('profile/').subscribe({
      next: (response) => {
        console.log(response);
        this.members = response;
        this.allMembers = response;
      },
      error: (err) => console.log(err),

    })
  }

  sendUserdata(index: number) {
    const foundUser = this.members[index];
    console.log(foundUser);
    this.observerservice.sendMember(foundUser);
    this.globalservice.memberListOpen = false;
  }



  searchUser() {
    if (this.searchValue.length > 0) {
      this.isSearch = true;

      const searchedUsers: any[] = [];
      for (let index = 0; index < this.allMembers.length; index++) {
        const user = this.allMembers[index];
        if (user.fullname.toLowerCase().includes(this.searchValue.toLowerCase())) {
          searchedUsers.push(user);
          console.log(searchedUsers);

        }
      }
      this.isFound = searchedUsers.length > 0 ? true : false;
      this.members = searchedUsers;
    } else {
      this.members = this.allMembers;
      this.isSearch = false;
    }
  }
}



