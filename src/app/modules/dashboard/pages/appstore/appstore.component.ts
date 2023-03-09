import { Component, OnDestroy } from '@angular/core';
import { distinctUntilChanged, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-appstore',
  templateUrl: './appstore.component.html',
  styleUrls: ['./appstore.component.scss']
})
export class AppstoreComponent implements OnDestroy {
  categories$: Observable<any>;
  consoleCategories$: Observable<any>;
  apps$: Observable<any>;
  currentIndex: number = 0;
  appStoreApps$: Observable<any>;
  noOfCards!: number
  total!: Observable<number>;
  isLastItem = false;
  destroy$ = new Subject();
  readonly breakpoint$ = this.bpObserver
  .observe([
    '(min-width: 1536px) and (max-width: 1920px)',
    '(min-width: 1280px) and (max-width: 1440px)',
    Breakpoints.Medium,
    Breakpoints.Small,
    '(min-width: 500px)'])
  .pipe(
    tap(value => console.log(value)),
    distinctUntilChanged(),
    takeUntil(this.destroy$)
  );

  constructor(private dashService: DashboardService, private bpObserver: BreakpointObserver) {
    this.categories$ = this.dashService.dashboardMenuItems.pipe(map((value: any) => value.categories));
    this.consoleCategories$ = this.dashService.dashboardMenuItems.pipe(map((value: any) => value.consoleCategories));
    this.apps$ = this.dashService.dashboardMenuItems.pipe(map((value: any) => value.apps));
    this.appStoreApps$ = this.dashService.apps;
    this.total = this.appStoreApps$.pipe(map((val: any) => val.length));

    this.breakpoint$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkBreakPoints();
    })
  }

  setActiveInactive(item: any) {
    this.categories$ = this.categories$.pipe(map((value: any) => {
      return this.loopOverItems(value, item.name)
    }));
    this.consoleCategories$ = this.consoleCategories$.pipe(map((value: any) => {
      return this.loopOverItems(value, item.name)
    }));
    this.apps$ = this.apps$.pipe(map((value: any) => {
      return this.loopOverItems(value, item.name)
    }))
  }

  loopOverItems(items: any, name: string) {
    for (let i = 0; i < items.length; i++) {
      if(items[i].name === name) {
        items[i].isActive = true
      }
      else {
        items[i].isActive = false;
      }
    }
    return items
  }

  checkBreakPoints() {
    if(this.bpObserver.isMatched('(min-width: 1536px) and (max-width: 1920px)')) {
      this.noOfCards = 4;
    }
    if(this.bpObserver.isMatched('(min-width: 1280px) and (max-width: 1440px)')) {
      this.noOfCards = 3;
    }
    if(this.bpObserver.isMatched(Breakpoints.Medium)) {
      this.noOfCards = 3;
    }
    if(this.bpObserver.isMatched(Breakpoints.Small)) {
      this.noOfCards = 2;
    }
  }

  navigate(delta: number): void {
    this.currentIndex = (this.currentIndex + delta) % this.noOfCards;
}

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  
}
