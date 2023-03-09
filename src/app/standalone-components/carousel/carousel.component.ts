import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiCarouselModule } from '@taiga-ui/kit';
import { StoreCardComponent } from '../store-card/store-card.component';
import { distinctUntilChanged, Observable, Subject, takeUntil, tap } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TuiButtonModule } from '@taiga-ui/core';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, TuiCarouselModule, StoreCardComponent, TuiButtonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent implements OnDestroy {
  @Input() appStoreData$!: Observable<any>;
  @Input() carouselName!: string;
  currentIndex: number = 0;
  noOfCards!: number;

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

  constructor(private bpObserver: BreakpointObserver) {
    this.breakpoint$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkBreakPoints();
    })
  }

  navigate(delta: number): void {
    this.currentIndex = (this.currentIndex + delta) % this.noOfCards;
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

  ngOnDestroy(): void {
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

}
