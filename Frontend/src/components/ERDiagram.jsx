import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  Handle,
  Position
} from 'reactflow';
import * as dagre from 'dagre';
import 'reactflow/dist/style.css';

const TableNode = ({ data }) => {
  return (
    <div className="table-node" style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', minWidth: '200px' }}>
      <div style={{ background: 'var(--primary-color)', color: 'white', padding: '8px', fontWeight: 'bold', textAlign: 'center', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
        {data.label}
      </div>
      <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {data.columns.map((col, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-color)', position: 'relative' }}>
            {/* Left Handle for incoming connections */}
            <Handle 
              type="target" 
              position={Position.Left} 
              id={`target-${col.name}`} 
              style={{ top: '50%', background: '#888', left: '-12px' }} 
            />
            
            <span>{col.name} {col.isPrimary && <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}> (PK)</span>}</span>
            <span style={{ color: 'var(--text-muted)' }}>{col.type}</span>
            
            {/* Right Handle for outgoing connections */}
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`source-${col.name}`} 
              style={{ top: '50%', background: '#888', right: '-12px' }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const nodeTypes = {
  table: TableNode,
};

const ERDiagram = ({ dbId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  const getLayoutedElements = (initialNodes, initialEdges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 200 }); // Left to Right

    initialNodes.forEach((node) => {
      // Approximate height based on columns
      const height = 40 + (node.data.columns.length * 20); 
      dagreGraph.setNode(node.id, { width: 250, height });
    });

    initialEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = initialNodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 125, // Center offset
          y: nodeWithPosition.y - (40 + (node.data.columns.length * 20))/2,
        },
      };
    });

    return { nodes: layoutedNodes, edges: initialEdges };
  };

  useEffect(() => {
    const fetchErd = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/schema/${dbId}/erd`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        // Parse tables into nodes
        const initialNodes = data.tables.map((table) => ({
          id: table.name,
          type: 'table',
          data: { label: table.name, columns: table.columns },
          position: { x: 0, y: 0 }, // Will be set by dagre
        }));

        // Parse edges
        const parsedEdges = data.edges.map((edge, idx) => ({
          id: `e-${edge.source}-${edge.target}-${idx}`,
          source: edge.source,
          sourceHandle: `source-${edge.sourceHandle}`,
          target: edge.target,
          targetHandle: `target-${edge.targetHandle}`,
          animated: true,
          style: { stroke: '#ff0072', strokeWidth: 3 }
        }));

        // Add a guaranteed edge
        const initialEdges = [
          ...parsedEdges,
          { id: 'test-edge', source: 'employees', target: 'departments', animated: true, style: { stroke: 'yellow', strokeWidth: 5 } }
        ];

        setDebugInfo(`Found ${data.tables.length} tables and ${data.edges.length} relationships.`);

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (err) {
        setError('Failed to fetch schema data');
      } finally {
        setLoading(false);
      }
    };

    fetchErd();
  }, [dbId]);

  const diagramRef = React.useRef(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      diagramRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-color)' }}>Generating ER Diagram...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div ref={diagramRef} style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--bg-default)' }}>
      {debugInfo && <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: 'var(--panel-bg)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)' }}>{debugInfo}</div>}
      
      <button 
        onClick={toggleFullScreen}
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, background: 'var(--panel-bg)', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
        Full Screen
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls showInteractive={false} />
        <MiniMap />
        <Background color="var(--border-color)" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default ERDiagram;
