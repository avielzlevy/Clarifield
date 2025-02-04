import { ReactFlow, Controls, Background, applyNodeChanges } from '@xyflow/react';
import { Box, Dialog, DialogTitle, DialogContent, TextField, CircularProgress } from '@mui/material';
import '@xyflow/react/dist/style.css';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState, useEffect, useCallback,useRef } from 'react';
import EntityCard from '../components/EntityCard';
import EntitiesDialog from './EntitiesDialog';
import axios from 'axios';

function Entities() {
    const nodeTypes = useMemo(() => ({ entityCard: EntityCard }), []);
    const theme = useTheme();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);

    const nodesRef = useRef(nodes);
    const reactFlowInstanceRef = useRef(null);

    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    // Move fetchEntities outside useEffect so we can reuse it
    const fetchEntities = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities`);
            const newNodes = Object.values(response.data).map((node, index) => ({
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
                    onMouseEnter: () => {
                        setSelectedNode(node);
                    },
                    onMouseLeave: () => {
                        setSelectedNode(null);
                    },
                    onEntityClick: (nodeLabel) => {
                        search(nodeLabel);
                    }
                },
            }));
            return newNodes;
        } catch (error) {
            console.error('Error fetching entities:', error);
            return [];
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchEntities().then((newNodes) => {
            setNodes(newNodes);
            // console.log('Nodes:', newNodes);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
                event.preventDefault();
                setSearchOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearchClose = () => {
        setSearchOpen(false);
        setSearchQuery('');
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            search(searchQuery);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    useEffect(() => {
        if (reactFlowInstanceRef.current) {
            const storedCenter = localStorage.getItem('reactFlowCenter');
            if (storedCenter) {
                try {
                    const { x, y } = JSON.parse(storedCenter);
                    reactFlowInstanceRef.current.setCenter(x, y, { duration: 0 });
                } catch (error) {
                    console.error('Failed to parse center coordinates:', error);
                }
            }
        }
    }, [reactFlowInstanceRef.current]); // Only run when instance ref changes

    const onInit = (instance) => {
        // console.log('ReactFlow instance initialized:', instance);
        reactFlowInstanceRef.current = instance;
    };

    const search = (searchQuery) => {
        // console.log('Searching for:', searchQuery);
        const searchTerm = searchQuery.trim().toLowerCase();
        if (!searchTerm) return;

        const currentNodes = nodesRef.current;
        // console.log('Current nodes:', currentNodes);

        const foundNode = currentNodes.find(node => 
            node.data.label.toLowerCase().includes(searchTerm)
        );
        
        // console.log('Found node:', foundNode);
        // console.log('React Flow instance:', reactFlowInstanceRef.current);

        if (foundNode && reactFlowInstanceRef.current) {
            const newCenter = {
                x: foundNode.position.x + 50,
                y: foundNode.position.y + 100,
            };
            reactFlowInstanceRef.current.setCenter(newCenter.x, newCenter.y, { duration: 500 });
            localStorage.setItem('reactFlowCenter', JSON.stringify(newCenter));
            setSelectedNode(foundNode.data);
        }
    };

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
                <Box
                    sx={{
                        height: '89.5vh',
                        width: '100%',
                        backgroundColor: theme.palette.background.paper !== '#fff'
                            ? theme.palette.background.paper
                            : '#e9e9e9',
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <ReactFlow
                        onInit={onInit}
                        nodes={nodes}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        snapToGrid
                        style={{
                            '--xy-controls-button-background-color-default':
                                theme.palette.background.paper !== '#fff' ? '#393939' : '#e9e9e9',
                            '--xy-controls-button-background-color-hover-default':
                                theme.palette.background.paper !== '#fff' ? '#5c5c5c' : '#bfbcbc',
                            '--xy-controls-button-color-default': theme.palette.text.primary,
                            '--xy-controls-button-color-hover-default': 'inherit',
                            '--xy-controls-button-border-color-default': '#5c5c5c',
                            '--xy-node-color-default':
                                theme.palette.background.paper !== '#fff' ? '#fafafa' : '#393939',
                            '--xy-node-border-default': theme.palette.divider,
                            '--xy-node-background-color-default':
                                theme.palette.background.paper !== '#fff' ? '#393939' : '#b0b0b0',
                        }}
                    >
                        <Background />
                        <Controls />
                    </ReactFlow>
                </Box>
            )}
            <Dialog open={searchOpen} onClose={handleSearchClose}>
                <DialogTitle>Search an Entity</DialogTitle>
                <DialogContent>
                    <TextField
                        dir="ltr"
                        autoFocus
                        margin="dense"
                        label="Search"
                        type="text"
                        fullWidth
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search for an entity..."
                    />
                </DialogContent>
            </Dialog>
            <EntitiesDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                mode={dialogMode}
                nodes={nodes}
                setNodes={setNodes}
            />
        </>
    );
}

export default Entities;