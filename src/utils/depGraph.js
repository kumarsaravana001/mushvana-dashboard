export function buildGraph(tickets) {
  const adj = {};
  const rev = {};
  const ticketMap = {};

  tickets.forEach((t) => {
    ticketMap[t.id] = t;
    adj[t.id] = [];
    rev[t.id] = [];
  });

  tickets.forEach((t) => {
    (t.depends_on || []).forEach((depId) => {
      if (ticketMap[depId]) {
        adj[depId].push(t.id);
        rev[t.id].push(depId);
      }
    });
  });

  return { adj, rev, ticketMap };
}

export function topoLayers(tickets) {
  const { adj, rev, ticketMap } = buildGraph(tickets);
  const ids = tickets.map((t) => t.id);
  const inDeg = {};

  ids.forEach((id) => { inDeg[id] = rev[id].length; });

  const layers = [];
  let queue = ids.filter((id) => inDeg[id] === 0);
  const visited = new Set();

  while (queue.length > 0) {
    layers.push(queue);
    queue.forEach((id) => visited.add(id));
    const next = [];
    queue.forEach((id) => {
      adj[id].forEach((child) => {
        inDeg[child]--;
        if (inDeg[child] === 0 && !visited.has(child)) next.push(child);
      });
    });
    queue = next;
  }

  // Add any remaining (cycles) to last layer
  ids.forEach((id) => {
    if (!visited.has(id)) {
      if (layers.length === 0) layers.push([]);
      layers[layers.length - 1].push(id);
    }
  });

  return { layers, ticketMap, adj, rev };
}

export function getBlockerChain(ticketId, rev, visited = new Set()) {
  if (visited.has(ticketId)) return visited;
  visited.add(ticketId);
  (rev[ticketId] || []).forEach((depId) => {
    getBlockerChain(depId, rev, visited);
  });
  return visited;
}
