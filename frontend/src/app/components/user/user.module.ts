import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from './user';
 
@NgModule({
  declarations: [User],
  imports: [CommonModule, FormsModule]
})
export class UserModule {} 