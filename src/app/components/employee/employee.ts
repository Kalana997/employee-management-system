import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { EmployeeService, Employee as EmployeeModel } from '../../services/employee.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './employee.html',
  styleUrl: './employee.css'
})
export class EmployeeComponent implements OnInit {

  employees: EmployeeModel[] = [];

  searchText = '';

  selectedDepartment = 'All';

  selectedSalary = 'All';

  departments: string[] = ['All'];

  sortOrder: 'asc' | 'desc' = 'asc';

  currentPage = 1;

  itemsPerPage = 5;

  pageSizeOptions = [5, 10, 20, 50];

  showAddForm = false;

  isEditMode = false;

  editingEmployeeId = 0;

  successMessage = '';

  messageType: 'add' | 'update' | 'delete' = 'add';

  isDarkMode = true;

  userRole = '';
  
  isAdmin = false;

  currentDate = '';

  currentTime = '';

  activityLogs: string[] = [];

  maxLogs = 10;

  showViewModal = false;

  selectedEmployee: EmployeeModel | null = null;

  selectedImage: string = '';

  selectedFileName = '';

  private getEmployeeDepartment(employee: EmployeeModel): string {
    return (employee as EmployeeModel & { department?: string }).department ?? '';
  }

  employeeForm = new FormGroup({

    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      Validators.pattern('^[A-Za-z ]+$')
    ]),

    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    department: new FormControl('', [
      Validators.required,
      Validators.pattern('^[A-Za-z ]+$')
    ]),

    phone: new FormControl('', [
     Validators.required,
     Validators.pattern('^[0-9]{10}$')
   ]),

    salary: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1000),
      Validators.max(1000000)
    ])

  });

constructor(
  private themeService: ThemeService,
  private router: Router,
  private employeeService: EmployeeService,
  private cdr: ChangeDetectorRef
) 

{

  this.isDarkMode = this.themeService.isDarkMode();

  this.updateClock();

  setInterval(() => {

    this.updateClock();

  },1000);

}

ngOnInit(): void {

  this.loadEmployees();

  this.employeeForm.controls.email.valueChanges.subscribe(email => {

    if (
      !email ||
      this.employeeForm.controls.email.errors?.['required'] ||
      this.employeeForm.controls.email.errors?.['email']
    ) {
      return;
    }

    this.employeeService
      .checkEmail(
        email,
        this.isEditMode ? this.editingEmployeeId : undefined
      )
      .subscribe(result => {

        const control = this.employeeForm.controls.email;
        const errors = control.errors || {};

        if (result.exists) {

          control.setErrors({
            ...errors,
            duplicate: true
          });

        } else {

          delete errors['duplicate'];

          control.setErrors(
            Object.keys(errors).length ? errors : null
          );

        }

      });

  });

 this.employeeForm.controls.phone.valueChanges.subscribe(phone => {

  const control = this.employeeForm.controls.phone;

  if (!phone) {
    return;
  }

  if (!/^[0-9]{10}$/.test(phone)) {

    const errors = control.errors || {};

    delete errors['duplicate'];

    control.setErrors(
      Object.keys(errors).length ? errors : null
    );

    return;
  }

  this.employeeService
    .checkPhone(
      phone,
      this.isEditMode ? this.editingEmployeeId : undefined
    )
    .subscribe(result => {

      const errors = control.errors || {};

      if (result.exists) {

        control.setErrors({
          ...errors,
          duplicate: true
        });

        control.markAsTouched();

      } else {

        delete errors['duplicate'];

        control.setErrors(
          Object.keys(errors).length ? errors : null
        );

      }

    });

});

  this.userRole =
    localStorage.getItem('role') ||
    sessionStorage.getItem('role') ||
    '';

  this.isAdmin = this.userRole === 'admin';
}

get filteredEmployees(): EmployeeModel[] {

  let filtered = this.employees.filter(employee => {

    const matchesSearch =
      employee.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      this.getEmployeeDepartment(employee)
        .toLowerCase()
        .includes(this.searchText.toLowerCase());

    const matchesDepartment =
      this.selectedDepartment === 'All' ||
      this.getEmployeeDepartment(employee) === this.selectedDepartment;

    let matchesSalary = true;

    switch (this.selectedSalary) {

      case 'below50000':
        matchesSalary = employee.salary < 50000;
        break;

      case '50000to100000':
        matchesSalary =
          employee.salary >= 50000 &&
          employee.salary <= 100000;
        break;

      case '100001to150000':
        matchesSalary =
          employee.salary >= 100001 &&
          employee.salary <= 150000;
        break;

      case 'above150000':
        matchesSalary = employee.salary > 150000;
        break;

      default:
        matchesSalary = true;

    }

    return matchesSearch && matchesDepartment && matchesSalary;

  });

  filtered.sort((a, b) =>

    this.sortOrder === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)

  );


return filtered;

}

get paginatedEmployees(): EmployeeModel[] {

  const start = (this.currentPage - 1) * this.itemsPerPage;

  const end = start + this.itemsPerPage;

  return this.filteredEmployees.slice(start, end);

}



 get totalDepartments() {

  return new Set(
    this.employees.map(employee => this.getEmployeeDepartment(employee))
  ).size;

}

get totalSalary() {

  return this.employees.reduce(
    (sum, employee) => sum + employee.salary,
    0
  );

}

get averageSalary() {

  if (this.employees.length === 0) {

    return 0;

  }

  return Math.round(
    this.totalSalary / this.employees.length
  );

}

    updateClock(){

    const now = new Date();

    this.currentDate = now.toLocaleDateString('en-GB',{
      weekday:'long',
      year:'numeric',
      month:'long',
      day:'numeric'
    });

    this.currentTime = now.toLocaleTimeString();

  }

 toggleTheme(): void {

  this.themeService.toggleTheme();

  this.isDarkMode = this.themeService.isDarkMode();

}

  openAddForm(){

    this.employeeForm.reset();

    this.showAddForm = true;

    this.isEditMode = false;

    this.editingEmployeeId = 0;

  }

  cancel(){

    if(confirm("Discard entered details?")){

      this.employeeForm.reset();

      this.showAddForm = false;

      this.isEditMode = false;

      this.editingEmployeeId = 0;

      this.selectedImage = '';

      this.selectedFileName = '';

    }

  }

 saveEmployee() {

  if (this.employeeForm.invalid) {

    this.employeeForm.markAllAsTouched();

    return;

  }

  const value = this.employeeForm.value;

  if (this.isEditMode) {

    const updatedEmployee = {

      id: this.editingEmployeeId,

      name: value.name!,

      email: value.email!,

      phone: value.phone!,

      department: value.department!,

      salary: Number(value.salary),

      photo: this.selectedImage,

    } as unknown as EmployeeModel & { department: string };

    this.employeeService
      .updateEmployee(this.editingEmployeeId, updatedEmployee)
      .subscribe({

        next: () => {

          this.loadEmployees();

          this.messageType = 'update';

          this.successMessage = 'Employee Updated Successfully.';

          this.addActivity(`✏️ Employee "${updatedEmployee.name}" was updated`);

          this.showAddForm = false;

          this.isEditMode = false;

          this.employeeForm.reset();

          this.selectedImage = '';

          this.selectedFileName = '';

          setTimeout(() => {

            this.successMessage = '';

          }, 3000);

        },

        error: (err) => {

          if (err.status === 409) {

            const message = err.error?.message || '';

            if (message === 'Email already exists.') {

              this.employeeForm.controls.email.setErrors({
                duplicate: true
              });

              this.employeeForm.controls.email.markAsTouched();

            }

            if (message === 'Phone number already exists.') {

              this.employeeForm.controls.phone.setErrors({
                duplicate: true
              });

              this.employeeForm.controls.phone.markAsTouched();

            }

          }

        }

      });

  } else {

    const newEmployee = {

      name: value.name!,

      email: value.email!,

      phone: value.phone!,

      department: value.department!,

      salary: Number(value.salary),

      photo: this.selectedImage,

    } as unknown as EmployeeModel & { department: string };

    this.employeeService
      .addEmployee(newEmployee)
      .subscribe({

        next: () => {

          this.loadEmployees();

          this.messageType = 'add';

          this.successMessage = 'Employee Added Successfully.';

          this.addActivity(`✅ Employee "${newEmployee.name}" was added`);

          this.showAddForm = false;

          this.employeeForm.reset();

          this.selectedImage = '';

          this.selectedFileName = '';

          setTimeout(() => {

            this.successMessage = '';

          }, 3000);

        },

        error: (err) => {

          if (err.status === 409) {

            const message = err.error?.message || '';

            if (message === 'Email already exists.') {

              this.employeeForm.controls.email.setErrors({
                duplicate: true
              });

              this.employeeForm.controls.email.markAsTouched();

            }

            if (message === 'Phone number already exists.') {

              this.employeeForm.controls.phone.setErrors({
                duplicate: true
              });

              this.employeeForm.controls.phone.markAsTouched();

            }

          }

        }

      });

  }

}

viewEmployee(employee: EmployeeModel): void {

  this.selectedEmployee = employee;

  this.showViewModal = true;

}

closeViewModal(): void {

  this.showViewModal = false;

  this.selectedEmployee = null;

}

editEmployee(employee: EmployeeModel): void {

  this.showAddForm = true;

  this.isEditMode = true;

  this.editingEmployeeId = employee.id!;

  this.selectedImage = employee.photo || '';

  this.employeeForm.patchValue({

    name: employee.name,

    email: employee.email,

    phone: employee.phone,

    department: this.getEmployeeDepartment(employee),

    salary: employee.salary

  });

  const employeePhoto = (employee as EmployeeModel & { photo?: string }).photo || '';

  this.selectedImage = employeePhoto;

  this.selectedFileName = employeePhoto ? 'Current Image' : '';

}

deleteEmployee(id: number): void {

  if (confirm("Are you sure you want to delete this employee?")) {

    this.employeeService.deleteEmployee(id).subscribe({

      next: () => {

        this.loadEmployees();

        this.messageType = 'delete';
        this.successMessage = "Employee Deleted Successfully.";
        this.addActivity("🗑 An employee was deleted");

        setTimeout(() => {
          this.successMessage = "";
        }, 3000);

      },

      error: (err) => {

        console.error(err);

        alert('Failed to delete employee.');

      }

    });

  }

}

  allowOnlyLetters(event: KeyboardEvent){

    const key = event.key;

    if(

      !/^[a-zA-Z ]$/.test(key)

      &&

      ![
        'Backspace',
        'Delete',
        'Tab',
        'ArrowLeft',
        'ArrowRight'
      ].includes(key)

    ){

      event.preventDefault();

    }

  }

  allowOnlyNumbers(event: KeyboardEvent){

    const key = event.key;

    if(

      !/^[0-9]$/.test(key)

      &&

      ![
        'Backspace',
        'Delete',
        'Tab',
        'ArrowLeft',
        'ArrowRight'
      ].includes(key)

    ){

      event.preventDefault();

    }

  }

  capitalizeFirstLetter(controlName:string){

    const control = this.employeeForm.get(controlName);

    if(control && control.value){

      const value = control.value.toString();

      control.setValue(

        value.charAt(0).toUpperCase() +

        value.slice(1),

        {

          emitEvent:false

        }

      );

    }

  }

  blockPaste(event:ClipboardEvent){

    event.preventDefault();

    alert("Copy / Paste is not allowed.");

  }

  onImageSelected(event: Event): void {

  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {

      alert('Please select a valid image.');

      return;

    }

    this.selectedFileName = file.name;

    const reader = new FileReader();

    reader.onload = () => {

      this.selectedImage = reader.result as string;

    };

    reader.readAsDataURL(file);

  }

}

  logout(): void {

  if (confirm('Are you sure you want to logout?')) {

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');

    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');

    this.router.navigate(['/login']);

  }

}

loadEmployees(): void {

  console.log("loadEmployees called");

  this.employeeService.getEmployees().subscribe({

    next: (data) => {

      console.log("API Response:", data);
      this.employees = [...data];
      this.departments = ['All', ...new Set(data.map(emp => this.getEmployeeDepartment(emp)))];
      this.cdr.detectChanges();
      console.log("Employees:", this.employees);

    },

    error: (err) => {

      console.error("API Error:", err);

    }

  });

}

  toggleSort(): void {

   this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';

  }

  clearSearch(){

    this.searchText = '';

  }

  addActivity(message: string): void {

  const time = new Date().toLocaleTimeString();

  this.activityLogs.unshift(`${time} - ${message}`);

  if (this.activityLogs.length > this.maxLogs) {

    this.activityLogs.pop();

  }

}

  changePageSize(): void {

  this.currentPage = 1;

  }

  exportToPDF(): void {

  const doc = new jsPDF();

  doc.setFontSize(18);

  doc.text('Employee Management Report', 14, 20);

  autoTable(doc, {

    head: [['ID', 'Name', 'Department', 'Salary']],

    body: this.employees.map(emp => [
   emp.id ?? '',
   emp.name,
   this.getEmployeeDepartment(emp),
  `Rs. ${emp.salary.toLocaleString()}`
] as (string | number)[]),

    startY: 30

  });

  doc.save('Employee_Report.pdf');

}

  nextPage() {

  const totalPages = Math.ceil(
    this.employees.length / this.itemsPerPage
  );

  if (this.currentPage < totalPages) {

    this.currentPage++;

  }

}

previousPage() {

  if (this.currentPage > 1) {

    this.currentPage--;

  }

}

get totalPages() {

  return Math.ceil(
    this.filteredEmployees.length / this.itemsPerPage
  );

}

} 