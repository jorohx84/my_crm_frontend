import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
globalservice = inject(GlobalService);
}
