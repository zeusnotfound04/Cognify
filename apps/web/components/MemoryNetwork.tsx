'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ConnectingNodes } from './ConnectingNodes';

interface Memory {
  id: string;
  title: string;
  content: string;
  type: 'conversation' | 'document' | 'integration' | 'note';
  source: string;
  timestamp: Date;
  connections: string[];
  tags: string[];
}

interface MemoryNetworkProps {
  memories: Memory[];
  selectedMemory: Memory | null;
  onMemorySelect: (memory: Memory) => void;
}

interface MemoryNode {
  id: string;
  x: number;
  y: number;
  memory: Memory;
  radius: number;
}

interface Connection {
  from: MemoryNode;
  to: MemoryNode;
}

export function MemoryNetwork({ memories, selectedMemory, onMemorySelect }: MemoryNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<MemoryNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Initialize nodes and connections
  useEffect(() => {
    if (!memories.length || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const { width, height } = rect;
    
    setContainerSize({ width, height });

    // Create nodes with circular layout for better distribution
    const newNodes: MemoryNode[] = memories.map((memory, index) => {
      const totalNodes = memories.length;
      const angle = (index / totalNodes) * 2 * Math.PI;
      
      // Create multiple rings for better distribution
      const ringIndex = Math.floor(index / 6); // 6 nodes per ring
      const nodesInRing = Math.min(6, totalNodes - ringIndex * 6);
      const ringAngle = ((index % 6) / nodesInRing) * 2 * Math.PI;
      
      const baseRadius = Math.min(width, height) * 0.15;
      const radius = baseRadius + (ringIndex * 80);
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Add some randomness for organic feel
      const randomOffset = 20;
      const randomX = (Math.random() - 0.5) * randomOffset;
      const randomY = (Math.random() - 0.5) * randomOffset;
      
      return {
        id: memory.id,
        x: centerX + Math.cos(ringAngle) * radius + randomX,
        y: centerY + Math.sin(ringAngle) * radius + randomY,
        memory,
        radius: 25 + Math.min(memory.connections.length * 2, 15) // Cap the size
      };
    });

    // Create connections between nodes
    const newConnections: Connection[] = [];
    newNodes.forEach(node => {
      node.memory.connections.forEach(connectionId => {
        const targetNode = newNodes.find(n => n.id === connectionId);
        if (targetNode) {
          newConnections.push({
            from: node,
            to: targetNode
          });
        }
      });
    });

    setNodes(newNodes);
    setConnections(newConnections);
  }, [memories]);

  // Draw connections on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !nodes.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerSize.width * dpr;
    canvas.height = containerSize.height * dpr;
    canvas.style.width = `${containerSize.width}px`;
    canvas.style.height = `${containerSize.height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, containerSize.width, containerSize.height);

    // Draw connections
    connections.forEach(connection => {
      const { from, to } = connection;
      const isHighlighted = selectedMemory && 
        (selectedMemory.id === from.id || selectedMemory.id === to.id ||
         selectedMemory.connections.includes(from.id) || selectedMemory.connections.includes(to.id));
      
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      
      if (isHighlighted) {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#8B5CF6';
        ctx.shadowBlur = 4;
      } else {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 1;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      
      ctx.stroke();
    });
  }, [nodes, connections, selectedMemory, containerSize]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prepare data for TSParticles background
  const particleNodes = useMemo(() => {
    return nodes.map(node => ({
      id: node.id,
      x: node.x,
      y: node.y,
      type: node.memory.type,
      connections: node.memory.connections
    }));
  }, [nodes]);

  const handleNodeClick = (node: MemoryNode) => {
    onMemorySelect(node.memory);
  };

  const getTypeColor = (type: string) => {
    const typeColors = {
      conversation: '#3B82F6',
      document: '#10B981',
      integration: '#F59E0B',
      note: '#8B5CF6'
    };
    return typeColors[type as keyof typeof typeColors] || '#8B5CF6';
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden"
    >
      {/* TSParticles Background - reduced opacity for subtlety */}
      <div className="absolute inset-0 opacity-30 z-0">
        <ConnectingNodes 
          id="memory-network-particles" 
          memoryNodes={particleNodes}
          className="z-0"
        />
      </div>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5 z-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Connection Lines Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-15 pointer-events-none"
      />

      {/* Interactive Memory Nodes */}
      <div className="absolute inset-0 z-20">
        {nodes.map((node) => {
          const isSelected = selectedMemory?.id === node.id;
          const isHovered = hoveredNode === node.id;
          const isConnected = selectedMemory ? 
            (selectedMemory.connections.includes(node.id) || node.memory.connections.includes(selectedMemory.id)) : 
            false;

          return (
            <motion.div
              key={node.id}
              className="absolute cursor-pointer"
              style={{
                left: node.x - node.radius,
                top: node.y - node.radius,
                width: node.radius * 2,
                height: node.radius * 2,
              }}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                scale: isSelected ? 1.2 : 1,
                opacity: selectedMemory && !isSelected && !isConnected ? 0.4 : 1,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Node Glow Effect */}
              {(isSelected || isHovered || isConnected) && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${getTypeColor(node.memory.type)}60 0%, transparent 70%)`,
                    transform: 'scale(1.8)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}

              {/* Pulse Animation for Selected Node */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{
                    borderColor: getTypeColor(node.memory.type),
                    transform: 'scale(1.5)',
                  }}
                  animate={{
                    scale: [1.5, 2, 1.5],
                    opacity: [0.8, 0, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Node Core */}
              <div
                className="w-full h-full rounded-full border-2 flex items-center justify-center relative overflow-hidden shadow-lg"
                style={{
                  backgroundColor: getTypeColor(node.memory.type),
                  borderColor: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                  borderWidth: isSelected ? 3 : 2,
                  boxShadow: isSelected ? `0 0 20px ${getTypeColor(node.memory.type)}80` : 'none',
                }}
              >
                {/* Animated Gradient Background */}
                <motion.div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: `conic-gradient(from 0deg, ${getTypeColor(node.memory.type)}, transparent, ${getTypeColor(node.memory.type)})`,
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Node Content */}
                <div className="relative z-10 text-center p-1">
                  <div className="text-white text-xs font-bold leading-tight drop-shadow-sm">
                    {node.memory.title.length > 6 ? 
                      `${node.memory.title.substring(0, 6)}...` : 
                      node.memory.title
                    }
                  </div>
                </div>

                {/* Connection Count Badge */}
                {node.memory.connections.length > 0 && (
                  <motion.div 
                    className="absolute -top-1 -right-1 bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {node.memory.connections.length}
                  </motion.div>
                )}
              </div>

              {/* Enhanced Tooltip */}
              {isHovered && (
                <motion.div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-30"
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs p-3 rounded-lg border border-gray-700 max-w-56 shadow-xl">
                    <div className="font-semibold mb-2 text-sm">{node.memory.title}</div>
                    <div className="text-gray-300 line-clamp-3 mb-2 leading-relaxed">{node.memory.content}</div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                      <span className="text-gray-400">{node.memory.source}</span>
                      <span className="text-purple-400 font-mono">{node.memory.connections.length} links</span>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-4 z-30">
        <h3 className="text-white text-sm font-semibold mb-3 font-heading">Memory Types</h3>
        <div className="space-y-2">
          {[
            { type: 'conversation', label: 'Conversations', color: '#3B82F6' },
            { type: 'document', label: 'Documents', color: '#10B981' },
            { type: 'integration', label: 'Integrations', color: '#F59E0B' },
            { type: 'note', label: 'Notes', color: '#8B5CF6' }
          ].map(({ type, label, color }) => (
            <div key={type} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-300 text-xs font-sans">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-4 z-30">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-purple-400 text-lg font-bold font-mono">{memories.length}</div>
            <div className="text-gray-400 text-xs font-sans">Memories</div>
          </div>
          <div>
            <div className="text-blue-400 text-lg font-bold font-mono">
              {memories.reduce((acc, m) => acc + m.connections.length, 0)}
            </div>
            <div className="text-gray-400 text-xs font-sans">Connections</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!selectedMemory && memories.length > 0 && (
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-white text-lg font-semibold mb-2 font-heading">Explore Your Memory Network</h3>
            <p className="text-gray-400 text-sm font-sans">Hover over nodes to see connections • Click to explore details</p>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {memories.length === 0 && (
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-white text-lg font-semibold mb-2 font-heading">No Memories Yet</h3>
            <p className="text-gray-400 text-sm font-sans">Start chatting or import your data to see your memory network</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}