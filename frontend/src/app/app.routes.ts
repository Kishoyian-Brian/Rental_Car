import { Routes } from '@angular/router';
import { Landingpage } from './components/landingpage/landingpage';

export const routes: Routes = [
    {
        path:'landingpage',
        component:Landingpage
    },
    {
        path:'',
        redirectTo:'landingpage',
        pathMatch:'full'
    }
];
