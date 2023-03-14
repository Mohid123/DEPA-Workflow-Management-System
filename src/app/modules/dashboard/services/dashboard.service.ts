import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ApiService } from 'src/core/core-services/api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends ApiService<any> {

  constructor(protected override http: HttpClient) {
    super(http)
  }

  dashboardMenuItems = of({
    consoleCategories: [
      {name: 'View Categories', isActive: false},
      {name: 'Add New Category', isActive: false},
    ],
    apps: [
      {name: 'Apps', isActive: false},
      {name: 'Publish an App', isActive: false},
    ]
  });


  apps = of([
    {
      appIcon: '../../../assets/app_icons/employees.svg',
      appName: 'Employees',
      themeColor: '#ffffff'
    },
    {
      appIcon: '../../assets/app_icons/performance.svg',
      appName: 'Performance (PMS)',
      themeColor: '#FFD05B'
    },
    {
      appIcon: '../../assets/app_icons/performance.svg',
      appName: 'Departments',
      themeColor: '#FFD05B'
    },
    {
      appIcon: '../../../assets/app_icons/performance.svg',
      appName: 'Employee Clearance',
      themeColor: '#FFD05B'
    },
    {
      appIcon: '../../../assets/app_icons/employees.svg',
      appName: 'Payroll',
      themeColor: '#ffffff'
    },
    {
      appIcon: '../../../assets/app_icons/employees.svg',
      appName: 'Invoices',
      themeColor: '#ffffff'
    },
    {
      appIcon: '../../../assets/app_icons/performance.svg',
      appName: 'Expense Management',
      themeColor: '#FFD05B'
    },
  ])
}
