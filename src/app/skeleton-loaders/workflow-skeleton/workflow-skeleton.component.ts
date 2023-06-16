import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workflow-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-skeleton.component.html',
  styleUrls: ['./workflow-skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowSkeletonComponent {

}
