import React, { useState, useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel
} from "reactflow";
import "reactflow/dist/style.css";

// Improved Custom Node component with four connection points
// Improved Custom Node component with four connection points
const CustomNode = ({ data, isConnectable }) => {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "8px",
        background: data.nodeColor || "#fff",
        border: "1px solid #777",
        color: getContrastColor(data.nodeColor || "#fff"),
        transition: "all 0.3s ease",
        boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
        minWidth: "140px",
        minHeight: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
      className="custom-node"
    >
      <div style={{ fontSize: "0.95rem", fontWeight: "500", textAlign: "center" }}>{data.label}</div>

      {/* Delete button positioned on the node */}
      <div
        className="delete-button"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) data.onDelete();
        }}
        title="Delete node"
      >
        ×
      </div>

      {/* Left handle - can be both source and target */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        style={{
          background: data.handleColor || "#555",
          width: "8px",
          height: "8px",
          left: "-4px"
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={isConnectable}
        style={{
          background: data.handleColor || "#555",
          width: "8px",
          height: "8px",
          left: "-4px",
          top: "60%" // Offset slightly to avoid exact overlap
        }}
      />

      {/* Right handle - can be both source and target */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        style={{
          background: data.handleColor || "#555",
          width: "8px",
          height: "8px",
          right: "-4px"
        }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        isConnectable={isConnectable}
        style={{
          background: data.handleColor || "#555",
          width: "8px",
          height: "8px",
          right: "-4px",
          top: "60%" // Offset slightly
        }}
      />

      {/* Top handle - can be both source and target */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectable={isConnectable}
        style={{
          background: data.handleColor || "#555",
          width: "8px",
          height: "8px",
          top: "-4px"
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        isConnectable={isConnectable}
        style={{
          background: data.handleColor || "#555",
          width: "8px",
          height: "8px",
          top: "-4px",
          left: "60%" // Offset slightly
        }}
      />

      {/* Bottom handle - can be both source and target */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        style={{
          background: data.handleColor || "#555",
          width: "8px",
          height: "8px",
          bottom: "-4px"
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        isConnectable={isConnectable}
        style={{
          background: data.handleColor || "#555",
          width: "8px",
          height: "8px",
          bottom: "-4px",
          left: "60%" // Offset slightly
        }}
      />
    </div>
  );
};

// Function to determine text color based on background for better contrast
function getContrastColor(hexColor) {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "#000" : "#fff";
}

// Define node types
const nodeTypes = {
  custom: CustomNode,
};

// Default initial node
const defaultInitialNodes = [
  { id: "1", type: "custom", data: { label: "Industrial Controller", nodeColor: "#ccffcc", handleColor: "#55ff55" }, position: { x: 250, y: 200 } },
];

// Empty initial edges
const defaultInitialEdges = [];

export default function IndustrialBoilerFlowchart() {
  // Track selected node/edge for color customization
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [currentEdgeColor, setCurrentEdgeColor] = useState("#888888");
  const [isAnimated, setIsAnimated] = useState(true);
  const [edgeType, setEdgeType] = useState("smoothstep");
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showComponentPanel, setShowComponentPanel] = useState(false);
  const [showWirePanel, setShowWirePanel] = useState(false);

  // Load from localStorage if available
  const loadFromLocalStorage = () => {
    try {
      const savedNodes = localStorage.getItem('boilerFlowchartNodes');
      const savedEdges = localStorage.getItem('boilerFlowchartEdges');

      return {
        nodes: savedNodes ? JSON.parse(savedNodes) : defaultInitialNodes,
        edges: savedEdges ? JSON.parse(savedEdges) : defaultInitialEdges
      };
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return { nodes: defaultInitialNodes, edges: defaultInitialEdges };
    }
  };

  const savedData = loadFromLocalStorage();

  // Add onDelete function to the nodes data
  const processedNodes = savedData.nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onDelete: () => deleteNode(node.id)
    }
  }));

  // Initialize state
  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(savedData.edges);

  // Set up theme based options
  const themeStyles = useMemo(() => {
    return {
      backgroundColor: darkMode ? "#1a1a2e" : "#f8f9fa",
      textColor: darkMode ? "#e7e7e7" : "#333",
      controlPanelBg: darkMode ? "#16213e" : "#ffffff",
      panelBorder: darkMode ? "1px solid #293b5f" : "1px solid #e0e0e0",
      buttonBg: darkMode ? "#293b5f" : "#007bff",
      buttonHoverBg: darkMode ? "#364f6b" : "#0069d9",
      dangerButtonBg: darkMode ? "#861a22" : "#dc3545",
      dangerButtonHoverBg: darkMode ? "#a52a36" : "#c82333",
      helperTextColor: darkMode ? "#ccc" : "#666",
      shadedBg: darkMode ? "#212940" : "#f1f3f5",
      borderColor: darkMode ? "#293b5f" : "#dee2e6",
      modalBg: darkMode ? "#16213e" : "#ffffff",
      inputBg: darkMode ? "#293b5f" : "#ffffff",
      inputBorder: darkMode ? "#364f6b" : "#ced4da",
      highlightColor: darkMode ? "#3a86ff" : "#007bff"
    };
  }, [darkMode]);

  // Function to delete an individual node
  const deleteNode = (nodeId) => {
    const confirmation = window.confirm("Delete this node?");
    if (confirmation) {
      if (selectedElement && selectedElement.id === nodeId) {
        setSelectedElement(null);
      }
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    }
  };

  // Update onDelete function whenever nodes change
  useEffect(() => {
    setNodes((nds) => nds.map(node => ({
      ...node,
      data: {
        ...node.data,
        onDelete: () => deleteNode(node.id)
      }
    })));
  }, []);

  // Save to localStorage whenever nodes or edges change
  useEffect(() => {
    const nodesToSave = nodes.map(({ data, ...rest }) => {
      // Remove the onDelete function before saving to localStorage
      const { onDelete, ...dataWithoutOnDelete } = data;
      return {
        ...rest,
        data: dataWithoutOnDelete
      };
    });

    localStorage.setItem('boilerFlowchartNodes', JSON.stringify(nodesToSave));
    localStorage.setItem('boilerFlowchartEdges', JSON.stringify(edges));
  }, [nodes, edges]);

  // Handle new connections with improved edge customization
  const onConnect = useCallback((params) => {
    // Ensure we don't create duplicate connections
    const connectionExists = edges.some(
      edge =>
        edge.source === params.source &&
        edge.target === params.target &&
        edge.sourceHandle === params.sourceHandle &&
        edge.targetHandle === params.targetHandle
    );

    if (!connectionExists) {
      setEdges((eds) =>
        addEdge({
          ...params,
          label: "Connection",
          type: edgeType,
          style: { stroke: currentEdgeColor, strokeWidth: 2 },
          animated: isAnimated,
          markerEnd: { type: MarkerType.ArrowClosed, color: currentEdgeColor }
        }, eds)
      );
    }
  }, [currentEdgeColor, isAnimated, edgeType, edges]);

  // Add a new node with random position
  const addNode = () => {
    const newNode = {
      id: Date.now().toString(),
      type: "custom",
      data: {
        label: `New Node ${nodes.length + 1}`,
        nodeColor: selectedColor,
        handleColor: selectedColor,
        onDelete: () => { } // Placeholder, will be updated in the effect
      },
      position: {
        x: Math.random() * 800 + 50,
        y: Math.random() * 400 + 50
      }
    };

    setNodes((nds) => {
      const updatedNodes = [...nds, newNode];
      // Set the onDelete function for the new node
      updatedNodes[updatedNodes.length - 1].data.onDelete = () =>
        deleteNode(updatedNodes[updatedNodes.length - 1].id);
      return updatedNodes;
    });
  };

  // Add preset type node
  const addPresetNode = (type) => {
    let nodeData = {
      label: "Generic Node",
      nodeColor: "#ccccff"
    };

    switch (type) {
      case "sensor":
        nodeData = { label: "Sensor Node", nodeColor: "#ffcccc", handleColor: "#ff5555" };
        break;
      case "controller":
        nodeData = { label: "Controller", nodeColor: "#ccffcc", handleColor: "#55ff55" };
        break;
      case "processor":
        nodeData = { label: "Data Processor", nodeColor: "#ccccff", handleColor: "#5555ff" };
        break;
      case "storage":
        nodeData = { label: "Storage", nodeColor: "#ffffcc", handleColor: "#ffff55" };
        break;
      case "cloud":
        nodeData = { label: "Cloud Service", nodeColor: "#ffccff", handleColor: "#ff55ff" };
        break;
    }

    const newNode = {
      id: Date.now().toString(),
      type: "custom",
      data: {
        ...nodeData,
        onDelete: () => { } // Placeholder, will be updated in the effect
      },
      position: {
        x: Math.random() * 800 + 50,
        y: Math.random() * 400 + 50
      }
    };

    setNodes((nds) => {
      const updatedNodes = [...nds, newNode];
      // Set the onDelete function for the new node
      updatedNodes[updatedNodes.length - 1].data.onDelete = () =>
        deleteNode(updatedNodes[updatedNodes.length - 1].id);
      return updatedNodes;
    });
  };

  // Handle node click to select it for editing
  const onNodeClick = (event, node) => {
    setSelectedElement({ type: 'node', id: node.id });
    setSelectedColor(node.data.nodeColor || "#ffffff");
  };

  // Handle edge click to select it for editing
  const onEdgeClick = (event, edge) => {
    setSelectedElement({ type: 'edge', id: edge.id });
    setSelectedColor(edge.style?.stroke || "#888888");
  };

  // Toggle edge animation for all edges
  const toggleAnimation = () => {
    setIsAnimated(!isAnimated);
    setEdges((eds) => eds.map(edge => ({
      ...edge,
      animated: !isAnimated
    })));
  };

  // Change edge type for all edges
  const changeEdgeType = (newType) => {
    setEdgeType(newType);
    setEdges((eds) => eds.map(edge => ({
      ...edge,
      type: newType
    })));
  };

  // Update current edge color for new connections
  const updateCurrentEdgeColor = (color) => {
    setCurrentEdgeColor(color);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle minimap
  const toggleMinimap = () => {
    setShowMinimap(!showMinimap);
  };

  // Toggle snap to grid
  const toggleSnapToGrid = () => {
    setSnapToGrid(!snapToGrid);
  };

  // Toggle component panel visibility
  const toggleComponentPanel = () => {
    setShowComponentPanel(!showComponentPanel);
    if (showWirePanel) setShowWirePanel(false);
  };

  // Toggle wire panel visibility
  const toggleWirePanel = () => {
    setShowWirePanel(!showWirePanel);
    if (showComponentPanel) setShowComponentPanel(false);
  };

  // Custom modal for editing node label and color
  const NodeEditor = () => {
    const [newLabel, setNewLabel] = useState("");
    const [nodeColor, setNodeColor] = useState(selectedColor);

    // All hooks are called unconditionally at the top level
    useEffect(() => {
      // Only update state if we have a valid node
      if (selectedElement && selectedElement.type === 'node') {
        const node = nodes.find(n => n.id === selectedElement.id);
        if (node) {
          setNewLabel(node.data.label);
          setNodeColor(node.data.nodeColor || "#ffffff");
        }
      }
    }, [selectedElement, nodes, selectedColor]);

    // Early returns after all hooks are called
    if (!selectedElement || selectedElement.type !== 'node') return null;

    const node = nodes.find(n => n.id === selectedElement.id);
    if (!node) return null;

    const handleSave = () => {
      setNodes((nds) => nds.map((n) => (
        n.id === selectedElement.id
          ? {
            ...n,
            data: {
              ...n.data,
              label: newLabel || n.data.label,
              nodeColor: nodeColor,
              handleColor: nodeColor,
              onDelete: n.data.onDelete // Preserve the onDelete function
            }
          }
          : n
      )));
      setSelectedElement(null);
    };

    return (
      <div className="modal-overlay" onClick={() => setSelectedElement(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: themeStyles.modalBg, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}>
          <h3>Edit Node</h3>
          <div className="input-group">
            <label>Node Name:</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              style={{ background: themeStyles.inputBg, color: themeStyles.textColor, borderColor: themeStyles.inputBorder }}
            />
          </div>

          <div className="input-group">
            <label>Node Color:</label>
            <div className="color-picker-wrapper">
              <input
                type="color"
                value={nodeColor}
                onChange={(e) => setNodeColor(e.target.value)}
              />
              <div className="color-preview" style={{ backgroundColor: nodeColor }}></div>
            </div>
          </div>

          <div className="color-presets">
            {['#ffcccc', '#ccffcc', '#ccccff', '#ffffcc', '#ffccff', '#ccffff', '#f7f7f7', '#888888', '#e91e63', '#3f51b5'].map(color => (
              <div
                key={color}
                onClick={() => setNodeColor(color)}
                style={{
                  width: "25px",
                  height: "25px",
                  backgroundColor: color,
                  border: nodeColor === color ? `2px solid ${themeStyles.highlightColor}` : `1px solid ${themeStyles.borderColor}`,
                  borderRadius: "3px",
                  cursor: "pointer"
                }}
              />
            ))}
          </div>

          <div className="button-group">
            <button onClick={handleSave} style={{ background: themeStyles.buttonBg }}>Save</button>
            <button onClick={() => setSelectedElement(null)} style={{ background: darkMode ? '#555' : '#6c757d' }}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  // Custom modal for editing edge label and color
  const EdgeEditor = () => {
    const [newLabel, setNewLabel] = useState("");
    const [edgeColor, setEdgeColor] = useState(selectedColor);
    const [animated, setAnimated] = useState(true);
    const [edgeThickness, setEdgeThickness] = useState(2);
    const [currentEdgeType, setCurrentEdgeType] = useState("default");

    // All hooks are called unconditionally at the top level
    useEffect(() => {
      // Only update state if we have a valid edge
      if (selectedElement && selectedElement.type === 'edge') {
        const edge = edges.find(e => e.id === selectedElement.id);
        if (edge) {
          setNewLabel(edge.label);
          setEdgeColor(edge.style?.stroke || "#888888");
          setAnimated(edge.animated || false);
          setCurrentEdgeType(edge.type || "default");
          setEdgeThickness(edge.style?.strokeWidth || 2);
        }
      }
    }, [selectedElement, edges, selectedColor]);

    // Early returns after all hooks are called
    if (!selectedElement || selectedElement.type !== 'edge') return null;

    const edge = edges.find(e => e.id === selectedElement.id);
    if (!edge) return null;

    const handleSave = () => {
      setEdges((eds) => eds.map((e) => (
        e.id === selectedElement.id
          ? {
            ...e,
            label: newLabel || e.label,
            style: { ...e.style, stroke: edgeColor, strokeWidth: edgeThickness },
            animated: animated,
            type: currentEdgeType,
            markerEnd: { ...e.markerEnd, color: edgeColor, type: MarkerType.ArrowClosed }
          }
          : e
      )));
      setSelectedElement(null);
    };

    return (
      <div className="modal-overlay" onClick={() => setSelectedElement(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: themeStyles.modalBg, color: themeStyles.textColor, borderColor: themeStyles.borderColor }}>
          <h3>Edit Connection</h3>
          <div className="input-group">
            <label>Connection Label:</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              style={{ background: themeStyles.inputBg, color: themeStyles.textColor, borderColor: themeStyles.inputBorder }}
            />
          </div>

          <div className="input-group">
            <label>Connection Type:</label>
            <select
              value={currentEdgeType}
              onChange={(e) => setCurrentEdgeType(e.target.value)}
              style={{
                padding: "8px",
                width: "100%",
                borderRadius: "5px",
                background: themeStyles.inputBg,
                color: themeStyles.textColor,
                borderColor: themeStyles.inputBorder
              }}
            >
              <option value="default">Straight</option>
              <option value="step">Step</option>
              <option value="smoothstep">Smooth Step</option>
              <option value="straight">Simple</option>
            </select>
          </div>

          <div className="input-group">
            <label>Line Thickness: {edgeThickness}px</label>
            <input
              type="range"
              min="1"
              max="6"
              value={edgeThickness}
              onChange={(e) => setEdgeThickness(parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div className="input-group">
            <label>Connection Color:</label>
            <div className="color-picker-wrapper">
              <input
                type="color"
                value={edgeColor}
                onChange={(e) => setEdgeColor(e.target.value)}
              />
              <div className="color-preview" style={{ backgroundColor: edgeColor }}></div>
            </div>
          </div>

          <div className="color-presets">
            {['#ff5555', '#55ff55', '#5555ff', '#ffff55', '#ff55ff', '#55ffff', '#777777', '#000000', '#e91e63', '#3f51b5'].map(color => (
              <div
                key={color}
                onClick={() => setEdgeColor(color)}
                style={{
                  width: "25px",
                  height: "25px",
                  backgroundColor: color,
                  border: edgeColor === color ? `2px solid ${themeStyles.highlightColor}` : `1px solid ${themeStyles.borderColor}`,
                  borderRadius: "3px",
                  cursor: "pointer"
                }}
              />
            ))}
          </div>

          <div className="input-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={animated}
                onChange={(e) => setAnimated(e.target.checked)}
              />
              Animated Flow
            </label>
          </div>

          <div className="button-group">
            <button onClick={handleSave} style={{ background: themeStyles.buttonBg }}>Save</button>
            <button onClick={() => setSelectedElement(null)} style={{ background: darkMode ? '#555' : '#6c757d' }}>Cancel</button>
            <button
              onClick={() => {
                if (window.confirm("Delete this connection?")) {
                  setEdges((eds) => eds.filter(e => e.id !== selectedElement.id));
                  setSelectedElement(null);
                }
              }}
              style={{ background: themeStyles.dangerButtonBg }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle node right-click to delete
  const onNodeContextMenu = (event, node) => {
    event.preventDefault();
    deleteNode(node.id);
  };

  // Clear all data
  const clearAll = () => {
    if (window.confirm("Clear all nodes and connections? This cannot be undone.")) {
      setNodes([]);
      setEdges([]);
      setSelectedElement(null);
    }
  };

  // Export data as JSON
  const exportData = () => {
    // Remove onDelete from nodes for export
    const nodesToExport = nodes.map(({ data, ...rest }) => {
      const { onDelete, ...dataWithoutOnDelete } = data;
      return {
        ...rest,
        data: dataWithoutOnDelete
      };
    });

    const dataStr = JSON.stringify({ nodes: nodesToExport, edges });
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `flowchart-export-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import data from JSON
  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);

          if (importedData.nodes && importedData.edges) {
            // Add onDelete function to imported nodes
            const processedNodes = importedData.nodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                onDelete: () => deleteNode(node.id)
              }
            }));

            setNodes(processedNodes);
            setEdges(importedData.edges);
          } else {
            alert('Invalid file format. Please import a valid flowchart JSON file.');
          }
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Failed to import. The file might be corrupted or in the wrong format.');
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  // Component panel that will slide in/out
  const ComponentPanel = () => {
    if (!showComponentPanel) return null;

    return (
      <div className="slide-panel component-panel" style={{ background: themeStyles.controlPanelBg, border: themeStyles.panelBorder }}>
        <h3 style={{ color: themeStyles.textColor, margin: '0 0 10px 0' }}>Add Components</h3>

        <div className="panel-section">
          <div className="node-buttons">
            <button onClick={() => addPresetNode("sensor")} style={{ backgroundColor: "#ffcccc" }}>Sensor</button>
            <button onClick={() => addPresetNode("controller")} style={{ backgroundColor: "#ccffcc" }}>Controller</button>
            <button onClick={() => addPresetNode("processor")} style={{ backgroundColor: "#ccccff" }}>Processor</button>
            <button onClick={() => addPresetNode("storage")} style={{ backgroundColor: "#ffffcc" }}>Storage</button>
            <button onClick={() => addPresetNode("cloud")} style={{ backgroundColor: "#ffccff" }}>Cloud</button>
            <button onClick={addNode} style={{ backgroundColor: "#007bff", color: "white" }}>Custom</button>
          </div>
        </div>

        <div className="panel-section">
          <p className="panel-help">Click on nodes to edit their properties. Drag from connection points to create links.</p>
        </div>
      </div>
    );
  };

  // Wire settings panel that will slide in/out
  const WirePanel = () => {
    if (!showWirePanel) return null;

    return (
      <div className="slide-panel wire-panel" style={{ background: themeStyles.controlPanelBg, border: themeStyles.panelBorder }}>
        <h3 style={{ color: themeStyles.textColor, margin: '0 0 10px 0' }}>Wire Settings</h3>

        <div className="panel-section">
          <label style={{ display: 'block', marginBottom: '5px' }}>Connection Style:</label>
          <div className="connection-buttons">
            <button
              onClick={() => changeEdgeType("default")}
              className={edgeType === "default" ? "active" : ""}
            >
              Straight
            </button>
            <button
              onClick={() => changeEdgeType("step")}
              className={edgeType === "step" ? "active" : ""}
            >
              Step
            </button>
            <button
              onClick={() => changeEdgeType("smoothstep")}
              className={edgeType === "smoothstep" ? "active" : ""}
            >
              Smooth
            </button>
          </div>
        </div>

        <div className="panel-section">
          <label style={{ display: 'block', marginBottom: '5px' }}>Wire Color:</label>
          <div className="color-presets">
            {['#ff5555', '#55ff55', '#5555ff', '#ffff55', '#ff55ff', '#55ffff', '#777777', '#000000'].map(color => (
              <div
                key={color}
                onClick={() => updateCurrentEdgeColor(color)}
                style={{
                  width: "25px",
                  height: "25px",
                  backgroundColor: color,
                  border: currentEdgeColor === color ? `2px solid ${themeStyles.highlightColor}` : `1px solid ${themeStyles.borderColor}`,
                  borderRadius: "3px",
                  cursor: "pointer",
                  margin: "3px"
                }}
              />
            ))}
          </div>
        </div>

        <div className="panel-section toggle-section">
          <button
            onClick={toggleAnimation}
            className={isAnimated ? "active full-width" : "full-width"}
          >
            {isAnimated ? "Flow Animation: ON" : "Flow Animation: OFF"}
          </button>
        </div>

        <div className="panel-section">
          <p className="panel-help">Click on connections to edit their properties. Each node has 4 connection points that can connect to any other node.</p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100vw", height: "95vh", background: themeStyles.backgroundColor, color: themeStyles.textColor }}>
      {/* Top Navigation Bar */}
      <div className="top-navbar" style={{ background: themeStyles.controlPanelBg, borderBottom: themeStyles.panelBorder }}>
        <div className="navbar-brand" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2>Flowchart Marker</h2> <h5>- Ajinkya Mhetre</h5>
        </div>

        <div className="navbar-controls">
          <div className="control-group">
            <button
              onClick={toggleComponentPanel}
              className={showComponentPanel ? "active" : ""}
              title="Add Components"
            >
              Add Components
            </button>
            <button
              onClick={toggleWirePanel}
              className={showWirePanel ? "active" : ""}
              title="Wire Settings"
            >
              Wire Settings
            </button>
            <button onClick={toggleDarkMode} title="Toggle Dark/Light Mode">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
          <div className="control-group">
            <button onClick={toggleMinimap} title="Toggle Minimap">
              {showMinimap ? "Hide Minimap" : "Show Minimap"}
            </button>
            <button onClick={toggleSnapToGrid} title="Toggle Snap to Grid">
              {snapToGrid ? "Snap: OFF" : "Snap: ON"}
            </button>
          </div>
          <div className="control-group file-controls">
            <button onClick={exportData} title="Export Flowchart">Export</button>
            <button onClick={importData} title="Import Flowchart">Import</button>
            <button onClick={clearAll} className="danger-button" title="Clear All Nodes">Clear All</button>
          </div>
        </div>
      </div>

      {/* React Flow Container */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeContextMenu={onNodeContextMenu}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        fitView
        attributionPosition="bottom-left"
        style={{ background: themeStyles.backgroundColor }}
      >
        <Controls style={{
          background: themeStyles.controlPanelBg,
          borderColor: themeStyles.borderColor,
          color: themeStyles.textColor,
          boxShadow: "0 0 10px rgba(0,0,0,0.15)"
        }}
          showInteractive={false} />

        {showMinimap && <MiniMap style={{ background: themeStyles.shadedBg, borderColor: themeStyles.borderColor }} />}

        <Background
          color={darkMode ? "#555" : "#aaa"}
          gap={16}
          size={1}
          variant={snapToGrid ? "dots" : "lines"}
        />

        <Panel position="top-center" className="flow-info-panel" style={{ background: 'transparent' }}>
          {selectedElement ? (
            <div className="info-box" style={{ background: themeStyles.controlPanelBg, border: themeStyles.panelBorder }}>
              <p style={{ color: themeStyles.textColor }}>
                {selectedElement.type === 'node' ? 'Node selected' : 'Connection selected'} - Click again to edit
              </p>
            </div>
          ) : (
            <div className="info-box" style={{ display: 'none' }}></div>
          )}
        </Panel>

        {/* Slide-in panels */}
        <ComponentPanel />
        <WirePanel />
      </ReactFlow>

      {/* Editor Modals */}
      {selectedElement && selectedElement.type === 'node' && <NodeEditor />}
      {selectedElement && selectedElement.type === 'edge' && <EdgeEditor />}

      {/* Global CSS for the application */}
      <style jsx global>{`
        body {
          margin: 0;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .top-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          height: 60px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 10;
          position: relative;
        }
        
        .navbar-brand h2 {
          margin: 0;
          font-size: 1.4rem;
        }
        
        .navbar-controls {
          display: flex;
          gap: 15px;
        }
        
        .control-group {
          display: flex;
          gap: 8px;
        }
        
        .custom-node .delete-button {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 18px;
          height: 18px;
          background: #ff4d4f;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 200;
        }
        
        .custom-node:hover .delete-button {
          opacity: 1;
        }
        
        .custom-node:hover .connection-handle {
          opacity: 1;
        }
        
        button {
          padding: 8px 12px;
          border-radius: 5px;
          border: none;
          background: #007bff;
          color: white;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        
        button:hover {
          background: #0069d9;
        }
        
        button.active {
          background: #0050b3;
          box-shadow: inset 0 0 5px rgba(0,0,0,0.3);
        }
        
        button.danger-button {
          background: #dc3545;
        }
        
        button.danger-button:hover {
          background: #c82333;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          padding: 25px;
          border-radius: 8px;
          width: 350px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.2);
          border: 1px solid #ddd;
        }
        
        .input-group {
          margin-bottom: 15px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .input-group input[type="text"] {
          width: 100%;
          padding: 8px;
          border-radius: 5px;
          border: 1px solid #ced4da;
          font-size: 0.9rem;
        }
        
        .color-picker-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .color-preview {
          width: 30px;
          height: 30px;
          border-radius: 5px;
          border: 1px solid #ddd;
        }
        
        .color-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 15px;
        }
        
        .checkbox {
          display: flex;
          align-items: center;
        }
        
        .checkbox input {
          margin-right: 10px;
        }
        
        .button-group {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        
        .button-group button {
          flex: 1;
        }
        
        .flow-info-panel {
          pointer-events: none;
        }
        
        .info-box {
          padding: 8px 15px;
          border-radius: 5px;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-top: 10px;
        }
        
        .info-box p {
          margin: 0;
          font-size: 0.85rem;
        }
        
        .slide-panel {
          position: absolute;
          top: 70px;
          right: 10px;
          width: 250px;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.1);
          z-index: 900;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .panel-section {
          margin-bottom: 15px;
        }
        
        .node-buttons, .connection-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        
        .node-buttons button {
          padding: 10px;
          font-weight: 500;
          color: #333;
        }
        
        .panel-help {
          font-size: 0.85rem;
          line-height: 1.4;
          margin: 0;
          opacity: 0.8;
        }
        
        .toggle-section button.full-width {
          width: 100%;
        }
        
        /* Enhance handle styling for better connection visibility */
        .react-flow__handle {
          width: 10px !important;
          height: 10px !important;
          border-radius: 50% !important;
          border: 2px solid white !important;
          transition: background-color 0.2s, transform 0.2s !important;
        }
        
        .react-flow__handle:hover {
          transform: scale(1.3) !important;
        }
        
        /* Fix for handle positions to ensure better connections */
        .react-flow__handle-left {
          left: -6px !important;
        }
        
        .react-flow__handle-right {
          right: -6px !important;
        }
        
        .react-flow__handle-top {
          top: -6px !important;
        }
        
        .react-flow__handle-bottom {
          bottom: -6px !important;
        }
      `}</style>
    </div>
  );
}