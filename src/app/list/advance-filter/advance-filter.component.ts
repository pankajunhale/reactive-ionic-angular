import { Component, OnInit, IterableDiffers } from '@angular/core';
import { EmployeeService } from 'src/app/services/employee.service';
import { EmployeeEmailDomain } from 'src/app/dto/employe.email.domain';
import { isNgTemplate } from '@angular/compiler';

@Component({
  selector: 'app-advance-filter',
  templateUrl: './advance-filter.component.html',
  styleUrls: ['./advance-filter.component.scss'],
})
export class AdvanceFilterComponent implements OnInit {

  
  constructor(private employeeService:EmployeeService) { }
  myDomainList$ = this.employeeService.domain$;
  ngOnInit() {
  }

  public doSearchByDomain(data,item){   
    const result = this.employeeService.domain$.getValue();
    result.forEach((element:EmployeeEmailDomain) => {
      if(element.Name === item.Name){
        element.IsChecked = data;
      }
    });
    this.employeeService.setDomain(result);
  }

}
