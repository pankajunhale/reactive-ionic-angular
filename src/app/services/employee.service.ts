import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable, combineLatest } from 'rxjs'
import { EmployeeDto } from '../dto/employee.dto';
import { switchMap, map, flatMap, endWith, skip, take, takeUntil, takeLast, toArray, tap, mergeMap, observeOn, filter, mergeAll, retry } from 'rxjs/operators';
import {  of, from } from 'rxjs';
import { EmployeeInfo } from '../constants/employee.data';
import * as _ from 'underscore';
import { EmployeeEmailDomain } from '../dto/employe.email.domain';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private PAGE_LIMIT: number = 10;
  constructor(private _http: HttpClient) {

  }

  searchEmployee$ = new BehaviorSubject('');
  pageOffset$ = new BehaviorSubject(0);
  pageLimit$ = new BehaviorSubject(this.PAGE_LIMIT);
  searchByGender$ = new BehaviorSubject('');
  employeeListDto: Array<EmployeeDto> = new Array<EmployeeDto>();
  totalResult$= new BehaviorSubject(0);
  gender$ = new BehaviorSubject("");
  domain$ = new BehaviorSubject(this.getAllDomain());
  //totalPages$;
  totalPages$ = combineLatest(this.totalResult$,this.pageLimit$).pipe(
    map(([total,limit])=> Math.ceil(total/limit))
  );
  
  
  combinedSearchParameters = combineLatest(this.searchEmployee$, this.pageOffset$,this.gender$,this.domain$);

  employeeResult$ = this.combinedSearchParameters.pipe(
    switchMap(([term,pageOffset,gender,domainList]) => {
      return this.getAllEmployee(term, pageOffset,gender,domainList) //this._http.get("/assets/mock-data/employee-list.json");
    }),
    tap((res:any)=>{
      //side effect operator
      this.totalResult$.next(this.findTotalRecords(this.searchEmployee$.getValue(),this.gender$.getValue(),this.domain$.getValue()));
    }),
    map((response: any) => {
      this.employeeListDto.length = 0;
      response.forEach(element => {
        this.employeeListDto.push(this.setEmployeeDataToDto(element));
      });
      return this.employeeListDto;
    })    
  )

  private setEmployeeDataToDto(element: any) {
    return new EmployeeDto(element);    
  }
  
  private manageFilter(item: any, term:string,gender:string,domainList:Array<EmployeeEmailDomain>) {
    console.log(term,gender);
    return this.manageFilterOption(gender,term,domainList,item);    
  }
  private findTotalRecords(term:string,gender:string,domainList:Array<EmployeeEmailDomain>){
    const data = EmployeeInfo.filter((item)=>{  
      return this.manageFilterOption(gender,term,domainList,item);
    });    
    return data.length;
  }

  private getAllEmployee(term:string, pageOffset:number,gender:string,domainList:Array<EmployeeEmailDomain>) {
    const skipRecords = (pageOffset * this.PAGE_LIMIT);
    let result: any = of(EmployeeInfo);
    let source = result.pipe(
      flatMap((response: any) => from(response.filter((item) => {
        return this.manageFilter(item,term,gender,domainList);
      }
      ))),
      map((res)=>{
        return res;
      }),
      skip(skipRecords),
      take(this.PAGE_LIMIT),
      toArray()
      // returns Observable<items> from array of items
      // flatMap merges back the observables into one
    );
    //debugger;
    //console.log(source);
    return source;
  }

  private getAllDomain(){
    const list:Array<EmployeeEmailDomain> = new Array<EmployeeEmailDomain>();
    const emailList = _.pluck(EmployeeInfo,'email');      
    const strList:Array<string> = new Array<string>();
    emailList.forEach((element:any) => {
      const splitResult = element.split('.');
      if(splitResult.length > 0){        
        strList.push(splitResult[1]);                  
      }
    });
    const uniqueResult = Array.from(new Set(strList)); 
    _.map(uniqueResult,(item,index:number)=>{
      list.push(new EmployeeEmailDomain(item,false));      
    });      
    return list;
  }

  private manageFilterOption(gender:string,term:string,domainList:Array<EmployeeEmailDomain>,item:any){
    const name = (item.first_name + " " + item.last_name).toLowerCase(); 
    const domainName:string = item.email.split('.')[1];
    const isDomainChecked = this.isDomainSelected(domainList,domainName);
    
    if(this.isAnyDomainOptionSelected(domainList)){
      if(_.isUndefined(gender)){
        return isDomainChecked;
      }
      else{
        return ((item.gender === gender && isDomainChecked && name.includes(term.toLowerCase())));
      }
    }
    //console.log(isDomainChecked);
    if(_.isUndefined(gender)){
      gender = "";     
      return (name.includes(term.toLowerCase()));
    } 
   
    //debugger;
    return ((item.gender === gender && name.includes(term.toLowerCase())));
  }

  private isDomainSelected(domainList:Array<EmployeeEmailDomain>,domainName:string){
    const result = domainList.filter(element => {
      return (element.Name.toLowerCase() === domainName.toLowerCase() && element.IsChecked)      
    });
    return (result.length > 0);    
  }
  private isAnyDomainOptionSelected(domainList:Array<EmployeeEmailDomain>){
    const result = domainList.filter(element => {
      return (element.IsChecked)      
    });
    return (result.length > 0);    
  }

  public setPageOffset(currentPageIndex: number) {
    const currentPage = this.pageOffset$.getValue();
    this.pageOffset$.next(currentPage + currentPageIndex);
  }

  public setSearch(data){
    this.pageOffset$.next(0);
    this.searchEmployee$.next(data);
  }

  public setGender(data){
    this.pageOffset$.next(0);
    this.gender$.next(data);
  }

  public setDomain(data){
    this.searchEmployee$.next("");
    this.pageOffset$.next(0);
    this.domain$.next(data);
  }

}
