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

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'registration', component: RegistrationComponent },

    {
        path: 'main', component: MainComponent, children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'customers', component: CustomersComponent },
            {
                path: 'singlecustomer/:id', component: SinglecustomerComponent, children: [
                    { path: 'tasklist', component: TasklistComponent },
                    { path: 'task/:id', component: SingletaskComponent },
                ]
            },
            // { path: 'task/:id', component: SingletaskComponent },
        ]
    }
];
