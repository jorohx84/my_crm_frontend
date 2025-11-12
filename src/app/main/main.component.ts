import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { GlobalsearchwrapperComponent } from '../globalsearchwrapper/globalsearchwrapper.component';
import { GlobalService } from '../services/global.service';
@Component({
  selector: 'app-main',
  imports: [CommonModule, RouterOutlet, HeaderComponent, GlobalsearchwrapperComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
globalservice=inject(GlobalService);
}
