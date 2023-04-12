import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workflow-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-chart.component.html',
  styleUrls: ['./workflow-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowChartComponent {

}
