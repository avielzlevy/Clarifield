import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  useViewport,
  ReactFlowProvider,
} from '@xyflow/react';
import { Box, CircularProgress, Fab } from '@mui/material';
import '@xyflow/react/dist/style.css';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import EntityCard from '../components/EntityCard';
import EntityDialog from './EntityDialog';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import { useSearch } from '../contexts/SearchContext';

function Entities({ setRefreshSearchables }) {
  const nodeTypes = useMemo(() => ({ entityCard: EntityCard }), []);
  const theme = useTheme();
  const { auth } = useAuth();
  const { search: globalSearch, setSearch: setGlobalSearch } = useSearch();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  // Parse stored viewport center, with a fallback.
  const storedCenter = useMemo(() => {
    try {
      const stored = localStorage.getItem('reactFlowCenter');
      return stored ? JSON.parse(stored) : { x: 0, y: 0 };
    } catch (err) {
      console.error('Failed to parse center coordinates:', err);
      return { x: 0, y: 0 };
    }
  }, []);

  const viewport = useViewport();
  const nodesRef = useRef(nodes);
  const reactFlowInstanceRef = useRef(null);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Fetch nodes from the API
  const fetchNodes = useCallback(async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities`);
      const newNodes = Object.values(data).map((node, index) => ({
        id: index.toString(),
        type: 'entityCard',
        position: { x: index * 150, y: 100 },
        data: {
          label: node.label,
          fields: node.fields,
          onCopy: () => {
            setDialogMode('copy');
            setDialogOpen(true);
          },
          onEdit: () => {
            setDialogMode('edit');
            setDialogOpen(true);
          },
          onDelete: () => {
            setDialogMode('delete');
            setDialogOpen(true);
          },
          onMouseEnter: () => {
            setSelectedNode(node);
          },
          onMouseLeave: () => {
            setSelectedNode(null);
            setDialogMode(null);
          },
          // Trigger search when an entity is clicked.
          onEntityClick: (nodeLabel) => {
            performSearch(nodeLabel);
          },
        },
      }));
      setNodes(newNodes);
    } catch (error) {
      console.error('Error fetching entities:', error);
      setNodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  // Save viewport changes in localStorage.
  useEffect(() => {
    localStorage.setItem('reactFlowCenter', JSON.stringify(viewport));
  }, [viewport]);

  const onInit = useCallback((instance) => {
    reactFlowInstanceRef.current = instance;
  }, []);

  // Local search function to center a found node.
  const performSearch = useCallback((searchQuery) => {
    const searchTerm = searchQuery.trim().toLowerCase();
    if (!searchTerm) return;

    const currentNodes = nodesRef.current;
    const foundNode = currentNodes.find((node) =>
      node.data.label.toLowerCase().includes(searchTerm)
    );

    if (foundNode && reactFlowInstanceRef.current) {
      const newCenter = {
        x: foundNode.position.x + 50,
        y: foundNode.position.y + 100,
      };
      reactFlowInstanceRef.current.setCenter(newCenter.x, newCenter.y, { duration: 500 });
      localStorage.setItem('reactFlowCenter', JSON.stringify(newCenter));
      setSelectedNode(foundNode.data);
    }
  }, []);

  // Listen for global search changes.
  useEffect(() => {
    if (nodes.length > 0 && globalSearch) {
      const timer = setTimeout(() => {
        performSearch(globalSearch);
        setGlobalSearch('');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nodes, globalSearch, setGlobalSearch, performSearch]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  return (
    <>
      {loading ? (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ position: 'relative', height: 'calc(100vh - 80px)', width: '100%' }}>
          <Box
            sx={{
              height: '100%',
              width: '100%',
              backgroundColor:
                theme.palette.background.paper !== '#fff'
                  ? theme.palette.background.paper
                  : '#c8c8c8',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <ReactFlow
              onInit={onInit}
              nodes={nodes}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              defaultViewport={storedCenter}
              snapToGrid
              style={{
                '--xy-controls-button-background-color-default':
                  theme.palette.background.paper !== '#fff'
                    ? theme.palette.custom.light
                    : '#e9e9e9',
                '--xy-controls-button-background-color-hover-default':
                  theme.palette.background.paper !== '#fff'
                    ? theme.palette.custom.dark
                    : '#bfbcbc',
                '--xy-controls-button-color-default': theme.palette.text.primary,
                '--xy-controls-button-color-hover-default': 'inherit',
                '--xy-controls-button-border-color-default': '#5c5c5c',
              }}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </Box>
          {auth && (
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => {
                setDialogMode('create');
                setDialogOpen(true);
              }}
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                zIndex: 999,
              }}
            >
              <AddIcon />
            </Fab>
          )}
        </Box>
      )}
      <EntityDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setDialogMode(null);
        }}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        mode={dialogMode}
        nodes={nodes}
        setNodes={setNodes}
        fetchNodes={fetchNodes}
        setRefreshSearchables={setRefreshSearchables}
      />
    </>
  );
}

function EntitiesWithProvider(props) {
  return (
    <ReactFlowProvider>
      <Entities {...props} />
    </ReactFlowProvider>
  );
}

export default EntitiesWithProvider;
