import { WhamoNode, WhamoEdge, useNetworkStore } from './store';
import { saveAs } from 'file-saver';

export function generateInpFile(nodes: WhamoNode[], edges: WhamoEdge[]) {
  const state = useNetworkStore.getState();
  const lines: string[] = [];

  // Helper to add line
  const add = (str: string) => lines.push(str);
  const addComment = (comment?: string) => {
    if (comment) {
      add(`c ${comment}`);
    }
  };

  const addL = (str: string) => lines.push(str);
  
  addL('c Project Name');
  addL('C  SYSTEM CONNECTIVITY');
  addL('');
  addL('SYSTEM');
  addL('');

  // Reservoirs
  nodes.filter(n => n.type === 'reservoir').forEach(n => {
    addComment(n.data.comment);
    addL(`ELEM ${n.data.label} AT ${n.data.nodeNumber || n.id}`);
  });

  // Edges and Junctions
  const junctionNodes = new Set(nodes.filter(n => n.type === 'junction').map(n => n.id));
  
  edges.forEach(e => {
    const fromNode = nodes.find(n => n.id === e.source);
    const toNode = nodes.find(n => n.id === e.target);
    const fromId = fromNode?.data.nodeNumber || fromNode?.id || e.source;
    const toId = toNode?.data.nodeNumber || toNode?.id || e.target;
    
    // Check if source node is a junction
    if (fromNode?.type === 'junction') {
      addL('');
      addL(`JUNCTION AT ${fromId}`);
      addL('');
    }

    if (e.data) addComment(e.data.comment);
    addL(`ELEM ${e.data?.label || e.id} LINK ${fromId} ${toId}`);

    if (junctionNodes.has(e.target)) {
      addL('');
      addL(`JUNCTION AT ${toId}`);
      addL('');
    }
  });

  // Surge Tanks
  nodes.filter(n => n.type === 'surgeTank').forEach(n => {
    addComment(n.data.comment);
    addL(`ELEM ${n.data.label} AT ${n.data.nodeNumber}`);
  });

  // Flow boundaries
  nodes.filter(n => n.type === 'flowBoundary').forEach(n => {
    addComment(n.data.comment);
    addL(`ELEM ${n.data.label} AT ${n.data.nodeNumber}`);
  });

  addL('');
  nodes.forEach(n => {
    if (n.data.elevation !== undefined) {
      addL(`NODE ${n.data.nodeNumber || n.id} ELEV ${n.data.elevation} `);
    }
  });

  addL('');
  addL('FINISH');
  addL('');
  addL('C ELEMENT PROPERTIES');
  addL('');

  // Properties Section
  nodes.filter(n => n.type === 'reservoir').forEach(n => {
    addComment(n.data.comment);
    addL('RESERVOIR');
    addL(` ID ${n.data.label}`);
    addL(` ELEV ${n.data.elevation}`);
    addL(' FINISH');
    addL('');
  });

  edges.filter(e => e.data?.type === 'conduit').forEach(e => {
    const d = e.data;
    if (!d) return;
    addComment(d.comment);
    let line = `CONDUIT ID ${d.label || e.id} LENG ${d.length} DIAM ${d.diameter} CELE ${d.celerity} FRIC ${d.friction} `;
    if (d.cplus !== undefined || d.cminus !== undefined) {
      addL(line);
      let loss = 'ADDEDLOSS ';
      if (d.cplus !== undefined) loss += `CPLUS ${d.cplus} `;
      if (d.cminus !== undefined) loss += `CMINUS ${d.cminus} `;
      if (d.numSegments !== undefined) loss += `NUMSEG ${d.numSegments} `;
      loss += 'FINISH ';
      addL(loss);
    } else {
      if (d.numSegments !== undefined) line += `NUMSEG ${d.numSegments} `;
      line += 'FINISH ';
      addL(line);
    }
  });

  edges.filter(e => e.data?.type === 'dummy').forEach(e => {
    const d = e.data;
    if (!d) return;
    addComment(d.comment);
    addL(`CONDUIT ID ${d.label || e.id} `);
    addL(' DUMMY ');
    addL(` DIAMETER ${d.diameter}`);
    addL(' ADDEDLOSS ');
    if (d.cplus !== undefined) addL(` CPLUS ${d.cplus}`);
    if (d.cminus !== undefined) addL(` CMINUS ${d.cminus}`);
    addL('FINISH');
    addL('');
  });

  nodes.filter(n => n.type === 'surgeTank').forEach(n => {
    const d = n.data;
    if (!d) return;
    addComment(d.comment);
    addL('SURGETANK ');
    addL(` ID ${d.label} SIMPLE`);
    addL(` ELTOP ${d.topElevation}`);
    addL(` ELBOTTOM ${d.bottomElevation}`);
    addL(` DIAM ${d.diameter}`);
    addL(` CELERITY ${d.celerity}`);
    addL(` FRICTION ${d.friction}`);
    addL('FINISH');
    addL('');
  });

  nodes.filter(n => n.type === 'flowBoundary').forEach(n => {
    const d = n.data;
    if (!d) return;
    addComment(d.comment);
    addL(`FLOWBC ID ${d.label} QSCHEDULE ${d.scheduleNumber} FINISH`);
  });

  addL('');
  addL('');
  addL('SCHEDULE');
  // Mock schedules as per sample for now, or we could add UI for them later
  addL(' QSCHEDULE 1 T 0 Q 3000 T 20 Q 0 T 3000 Q 0');
  addL(' QSCHEDULE 2 T 0 Q 3000 T 20 Q 0 T 3000 Q 0');
  addL(' QSCHEDULE 3 T 0 Q 3000 T 20 Q 0 T 3000 Q 0');
  addL(' QSCHEDULE 4 T 0 Q 3000 T 20 Q 0 T 3000 Q 0');
  addL('');
  addL('FINISH');
  addL('');
  addL('');
  addL('C OUTPUT REQUEST');
  addL('');
  if (state.outputRequests.length > 0) {
    addL('HISTORY');
    state.outputRequests.forEach(req => {
      const element = req.elementType === 'node' 
        ? nodes.find(n => n.id === req.elementId)
        : edges.find(e => e.id === req.elementId);
      
      const label = element?.data?.nodeNumber || element?.data?.label || element?.id || req.elementId;
      const typeStr = req.elementType === 'node' ? 'NODE' : 'ELEM';
      addL(` ${typeStr} ${label} ${req.variables.join(' ')}`);
    });
    addL(' FINISH');
  } else {
    addL('HISTORY');
    addL(' NODE 2 Q HEAD');
    addL(' ElEM ST Q ELEV');
    addL(' FINISH');
  }
  addL('');
  addL('');
  addL('C COMPUTATIONAL PARAMETERS');
  addL('CONTROL');
  const cp = state.computationalParams;
  addL(` DTCOMP ${cp.dtcomp} DTOUT ${cp.dtout} TMAX ${cp.tmax}`);
  addL('FINISH');
  addL('');
  addL('C EXECUTION CONTROL');
  addL('GO');
  addL('GOODBYE');

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `network_${Date.now()}.inp`);
}