import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import  { ClusterNode, DagreClusterLayout, Edge, Layout, NgxGraphModule, Node } from '@swimlane/ngx-graph';
import * as shape from 'd3-shape';

@Component({
  selector: 'app-workflow-chart',
  standalone: true,
  imports: [CommonModule, NgxGraphModule],
  templateUrl: './workflow-chart.component.html',
  styleUrls: ['./workflow-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowChartComponent {
  @Input() employees: any[] = [];
  @Input() nodes: Node[] = [];
  @Input() links: Edge[] = [];
  @Input() clusters: ClusterNode[] = [];
  public layoutSettings = {
    orientation: 'TB'
  };
  public curve: any = shape.curveCatmullRom;
  public layout: Layout = new DagreClusterLayout();
  draggingEnabled: boolean = true;
  panningEnabled: boolean = true;
  zoomEnabled: boolean = true;

  zoomSpeed: number = 0.1;
  minZoomLevel: number = 0.1;
  maxZoomLevel: number = 4.0;
  panOnZoom: boolean = true;

  autoZoom: boolean = false;
  autoCenter: boolean = true;

  public getStyles(node: Node): any {
    return {
      'background-color': node.data.backgroundColor
    };
  }
}
