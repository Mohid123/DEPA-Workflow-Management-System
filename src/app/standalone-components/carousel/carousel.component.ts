import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiCarouselModule } from '@taiga-ui/kit';
import { distinctUntilChanged, Observable, Subject, takeUntil, tap } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TuiButtonModule } from '@taiga-ui/core';

/**
 * Custom Carousel component
 */
@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, TuiCarouselModule, TuiButtonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CarouselComponent implements OnDestroy {

  /**
   * The data cards to display inside the carousel
   */
  @Input() appStoreData$!: Observable<any>;

  /**
   * The name of the carousel
   */
  @Input() carouselName!: string;

  /**
   * @ignore
   */
  currentIndex: number = 0;

  /**
   * @ignore
   */
  noOfCards!: number;

  /**
   * @ignore
   */
  destroy$ = new Subject();

  /**
   * Breakpoint observer that monitors the breakpoints of the screen and adjusts carousel accordingly
   */
  readonly breakpoint$ = this.bpObserver
  .observe([
    '(min-width: 1536px) and (max-width: 1920px)',
    '(min-width: 1280px) and (max-width: 1440px)',
    Breakpoints.Medium,
    Breakpoints.Small,
    '(min-width: 500px)'])
  .pipe(
    distinctUntilChanged(),
    takeUntil(this.destroy$)
  );

  /**
   * Uses Breakpoint Oberver as a dependency
   * @param bpObserver Utility for checking the matching state of media queries.
   */
  constructor(private bpObserver: BreakpointObserver) {
    this.breakpoint$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkBreakPoints();
    })
  }

  /**
   * Function to move carousel cards and navigate through them
   * @param delta The index to increment or decrement
   */
  navigate(delta: number): void {
    this.currentIndex = (this.currentIndex + delta) % this.noOfCards;
  }

  /**
   * Breakpoint monitoring function
   */
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

  /**
   * Built in Angular Lifecycle method that is run when component or page is destroyed or removed from DOM
   */
  ngOnDestroy(): void {
    this.destroy$.complete()
    this.destroy$.unsubscribe()
  }

}
