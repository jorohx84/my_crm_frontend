import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { CustomersComponent } from './customers/customers.component';
import { SinglecustomerComponent } from './singlecustomer/singlecustomer.component';
import { TasklistComponent } from './tasklist/tasklist.component';
import { SingletaskComponent } from './singletask/singletask.component';
import { BoardComponent } from './board/board.component';
import { ContactsComponent } from './contacts/contacts.component';
import { SinglecontactComponent } from './singlecontact/singlecontact.component';
import { SetpasswordComponent } from './setpassword/setpassword.component';
import { AdminpanelComponent } from './adminpanel/adminpanel.component';
import { CustomerdashboardComponent } from './customerdashboard/customerdashboard.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    // { path: 'registration', component: RegistrationComponent },
    { path: 'set-password/:uidb64/:token', component: SetpasswordComponent },
    {
        path: 'main', component: MainComponent, children: [
            { path: 'admin', component: AdminpanelComponent },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'customers', component: CustomersComponent },
            {
                path: 'singlecustomer/:customer_id', component: SinglecustomerComponent, children: [
                    { path: 'dashboard', component: CustomerdashboardComponent },
                    { path: 'tasklist', component: TasklistComponent },
                    { path: 'task/:task_id', component: SingletaskComponent },
                    { path: 'contacts', component: ContactsComponent },
                    { path: 'singlecontact/:contact_id', component: SinglecontactComponent },
                ]
            },
            { path: 'board', component: BoardComponent },
        ]
    }
];
