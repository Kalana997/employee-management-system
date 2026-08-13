import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  id?: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  salary: number;
  photo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private apiUrl = 'https://localhost:7018/api/Employee';

  constructor(private http: HttpClient) {}

  // GET: Get all employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // GET: Get employee by ID
  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  // POST: Add employee
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  // PUT: Update employee
  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(
      `${this.apiUrl}/${id}`,
      employee
    );
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete<any>(
        `${this.apiUrl}/${id}`
    );
}
checkEmail(email: string, id?: number): Observable<{ exists: boolean }> {
  let url = `${this.apiUrl}/check-email?email=${encodeURIComponent(email)}`;

  if (id !== undefined) {
    url += `&id=${id}`;
  }

  return this.http.get<{ exists: boolean }>(url);
}

checkPhone(phone: string, id?: number): Observable<{ exists: boolean }> {
  let url = `${this.apiUrl}/check-phone?phone=${encodeURIComponent(phone)}`;

  if (id !== undefined) {
    url += `&id=${id}`;
  }

  return this.http.get<{ exists: boolean }>(url);
}
}