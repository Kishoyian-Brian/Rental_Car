import { Routes } from '@angular/router';
import { Landingpage } from './components/landingpage/landingpage';
import { Agent } from './components/agent/agent';
import { User } from './components/user/user';
import { Login } from './components/login/login';
import { Bookings } from './components/bookings/bookings';
import { AdminComponent } from './components/admin/admin';
import { AllCars } from './components/all-cars/all-cars';
import { Booknow } from './components/booknow/booknow';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';

export const routes: Routes = [
    {
        path: '',
        component: Landingpage
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'agent-dashboard',
        component: Agent
    },
    {
        path: 'user-dashboard',
        component: User
    },
    {
        path: 'user-bookings',
        component: Bookings
    },
    {
        path: 'admin-dashboard',
        component: AdminComponent
    },
    {
        path: 'all-cars',
        component: AllCars 
    },
    {
        path:'book-car',
        component: Booknow
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent
    }
];
