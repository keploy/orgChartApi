
import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { PersonDetails } from '../api/client';

interface OrgChartProps { persons: PersonDetails[]; }

// Simple tree layout: assign x/y based on breadth-first traversal
function computeTreeLayout(persons: PersonDetails[]) {
  // Build id → person map and children map
  const idMap = new Map<number, PersonDetails>();
  const childrenMap = new Map<number, PersonDetails[]>();
  persons.forEach(p => {
    idMap.set(p.id, p);
    if (p.manager_id) {
      if (!childrenMap.has(p.manager_id)) childrenMap.set(p.manager_id, []);
      childrenMap.get(p.manager_id)!.push(p);
    }
  });
  // Find roots (no manager)
  const roots = persons.filter(p => !p.manager_id);
  // Layout params
  const nodeWidth = 160, nodeHeight = 70, hGap = 40, vGap = 80;
  let nextX = 0;
  const positions = new Map<number, {x:number,y:number}>();

  // Recursively assign positions
  function layoutSubtree(person: PersonDetails, depth: number): number {
    const children = childrenMap.get(person.id) || [];
    let subtreeWidth = 0;
    let childXs: number[] = [];
    // Layout children first
    children.forEach(child => {
      const w = layoutSubtree(child, depth + 1);
      childXs.push(nextX - w/2);
      subtreeWidth += w + hGap;
    });
    if (children.length > 0) subtreeWidth -= hGap;
    // Position self: if no children, assign nextX
    let x;
    if (children.length === 0) {
      x = nextX;
      nextX += nodeWidth + hGap;
    } else {
      // Center above children
      x = (childXs[0] + childXs[childXs.length-1]) / 2;
    }
    positions.set(person.id, { x, y: depth * (nodeHeight + vGap) });
    return children.length === 0 ? nodeWidth : subtreeWidth;
  }
  roots.forEach(root => { layoutSubtree(root, 0); });
  return positions;
}

export const OrgChart: React.FC<OrgChartProps> = ({ persons }) => {
  const positions = useMemo(() => computeTreeLayout(persons), [persons]);
  const nodes: Node[] = useMemo(() => persons.map(p => ({
    id: String(p.id),
    data: { label: `${p.first_name} ${p.last_name}` },
    position: positions.get(p.id) || { x: 0, y: 0 },
    style: { padding: 8, borderRadius: 8, border: '1px solid #888', background: 'var(--node-bg, white)', minWidth: 120, minHeight: 40 }
  })), [persons, positions]);

  const edges: Edge[] = useMemo(() => persons.filter(p => p.manager_id).map(p => ({
    id: `e-${p.manager_id}-${p.id}`,
    source: String(p.manager_id),
    target: String(p.id),
  })), [persons]);

  return (
    <div style={{ width: '100%', height: 600 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};
