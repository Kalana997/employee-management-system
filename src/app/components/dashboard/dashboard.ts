import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  constructor(private router: Router) {}
  // Variables
  userName = 'Admin';

  employeeCount = 25;
  departmentCount = 5;
  averageSalary = 120000;
  buttonText = 'View Employees';
  buttonDisabled = false;
  pageTitle = 'Employee Management Dashboard';


  viewEmployees() {
  
  this.userName = "Lahiru";
  this.employeeCount = this.employeeCount + 1;
  this.buttonText = "Employees Loaded";
  console.log('Button clicked');//developers can see
  this.router.navigate(['/employees']);

  }
}