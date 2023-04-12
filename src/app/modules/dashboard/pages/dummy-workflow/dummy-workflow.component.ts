import { Component } from '@angular/core';
import { ClusterNode, Edge, Node } from '@swimlane/ngx-graph';

@Component({
  templateUrl: './dummy-workflow.component.html',
  styleUrls: ['./dummy-workflow.component.scss']
})
export class DummyWorkflowComponent {
  employees: any[];
  nodes: Node[] = [];
  links: Edge[] = [];
  clusters: ClusterNode[] = [];

  constructor() {
    this.employees = [
      {
        id: '1',
        name: 'Shahid',
        office: 'Office 1',
        role: 'Manager',
        backgroundColor: '#FF7F50'
      },
      {
        id: '2',
        name: 'Mudassar',
        office: 'Office 2',
        role: 'Jr. Developer',
        backgroundColor: '#00FFFF',
        upperManagerId: '1'
      },
      {
        id: '3',
        name: 'Tanveer',
        office: 'Office 3',
        role: 'Sr. Developer',
        backgroundColor: '#00FFFF',
        upperManagerId: '1'
      },
      {
        id: '4',
        name: 'Sohail',
        office: 'Office 4',
        role: 'Procurement Officer',
        backgroundColor: '#00FFFF',
        upperManagerId: '3'
      },
      {
        id: '5',
        name: 'Rana',
        office: 'Office 5',
        role: 'Janitor',
        backgroundColor: '#F2D2BD',
        upperManagerId: '3'
      },
      {
        id: '6',
        name: 'Fahad',
        office: "CEO's Office",
        role: 'Dish Washer',
        backgroundColor: '#AEB2FA',
        upperManagerId: '5'
      }
    ];

    this.clusters = [
      {
        id: 'Step 1',
        label: 'OR',
        childNodeIds: ['2', '3']
      },
      {
        id: 'Step 2',
        label: 'AND',
        childNodeIds: ['4', '5']
      }
    ]
  }

  ngOnInit(): void {
    for (const employee of this.employees) {
      const node: Node = {
        id: employee.id,
        label: employee.name,
        data: {
          office: employee.office,
          role: employee.role,
          backgroundColor: employee.backgroundColor
        }
      };

      this.nodes.push(node);
    }

    for (const employee of this.employees) {
      if (!employee.upperManagerId) {
        continue;
      }

      const edge: Edge = {
        source: employee.upperManagerId,
        target: employee.id,
        label: '',
        data: {
          linkText: ''
        }
      };

      this.links.push(edge);
    }
  }
}
