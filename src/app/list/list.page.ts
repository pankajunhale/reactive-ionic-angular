import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {

  public searchTerm$ = this._employeeService.searchEmployee$;
  public employeeListResult$ = this._employeeService.employeeResult$;
  public pageOffset$ = this._employeeService.pageOffset$;
  public totalResult$ = this._employeeService.totalResult$;
  public isFirstPage$ = this._employeeService.pageOffset$.pipe(map(page => page === 0))
  public totalPages$ = this._employeeService.totalPages$;
  public userPage$ = this._employeeService.pageOffset$.pipe(map(page => page + 1));
  public gender$ = this._employeeService.gender$;
  public isLastPage$ = combineLatest(this.userPage$,this.totalPages$).pipe(
    map(([currrentPage,totalPages])=>{
      return currrentPage === totalPages;
    })
  );

  constructor(private _employeeService:EmployeeService) {    
  }

  ngOnInit() {
  }
  // only set value obsevable 
  public next(num){
    this._employeeService.setPageOffset(num);
  }
  public previous(num){
    this._employeeService.setPageOffset(num);
  }
  public doSearch(data){
    this._employeeService.setSearch(data);
  }
  public doSearchByGnder(data){
    this._employeeService.setGender(data);
  } 
}
