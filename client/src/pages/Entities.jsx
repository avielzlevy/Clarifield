import { ReactFlow, Controls, Background, applyNodeChanges } from '@xyflow/react';
import { Box, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import '@xyflow/react/dist/style.css';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState, useEffect, useCallback } from 'react';
import EntityCard from '../components/EntityCard';
import EntitiesDialog from './EntitiesDialog';

function Entities() {
    // Register your custom node type.
    const nodeTypes = useMemo(() => ({ entityCard: EntityCard }), []);
    const theme = useTheme();

    // Save the react flow instance when it is initialized.
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    // Open/close dialog state.
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState(null);

    // Define your nodes.
    const [nodes, setNodes] = useState([
        {
            id: '1',
            type: 'entityCard',
            position: { x: 0, y: 0 },
            data: {
                label: 'User',
                fields: [
                    { label: 'id' },
                    { label: 'firstName' },
                    { label: 'lastName' },
                    { label: 'email' },
                    { label: 'appointments' },
                ],
            },
        },
        {
            id: '2',
            type: 'entityCard',
            position: { x: 250, y: 1000 },
            data: {
                label: 'Employee',
                fields: [
                    { label: 'id' },
                    { label: 'employeeId' },
                    { label: 'firstName' },
                    { label: 'lastName' },
                    { label: 'email' },
                    {
                        label: 'appointments', 
                        children: [
                            { label: 'id' },
                            { label: 'date' },
                            { label: 'time' },
                            { 
                                label: 'user', 
                                children: [
                                    { label: 'id' },
                                    { label: 'firstName' },
                                    { label: 'lastName' },
                                    { label: 'email' },
                                ]
                            }
                        ]
                    },
                ],
            },
        },
    ].map((node) => ({
        ...node,
        data: {
            ...node.data,
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
            }
        },
    })));

    // Custom search dialog state.
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);

    // When the React Flow instance becomes available, check localStorage for the center coordinates.
    useEffect(() => {
        if (reactFlowInstance) {
            const storedCenter = localStorage.getItem('reactFlowCenter');
            if (storedCenter) {
                try {
                    const { x, y } = JSON.parse(storedCenter);
                    // Center the view on the stored coordinates without animation.
                    reactFlowInstance.setCenter(x, y, { duration: 0 });
                } catch (error) {
                    console.error('Failed to parse center coordinates from localStorage:', error);
                }
            }
        }
    }, [reactFlowInstance]);

    // Add a keydown listener to override the browser's Ctrl+F behavior.
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
                event.preventDefault();
                setSearchOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Close the search dialog.
    const handleSearchClose = () => {
        setSearchOpen(false);
        setSearchQuery('');
    };

    // Update the search query state.
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // When the user presses Enter in the search field, search for a node and center the view.
    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const searchTerm = searchQuery.trim().toLowerCase();
            if (!searchTerm) return;

            // Find the first node whose label includes the search term.
            const foundNode = nodes.find((node) =>
                node.data.label.toLowerCase().includes(searchTerm)
            );

            // If a node is found and we have a React Flow instance, center the view on that node.
            if (foundNode && reactFlowInstance) {
                const newCenter = {
                    x: foundNode.position.x + 50,
                    y: foundNode.position.y + 100,
                };
                reactFlowInstance.setCenter(newCenter.x, newCenter.y, { duration: 500 });
                localStorage.setItem('reactFlowCenter', JSON.stringify(newCenter));
                setSelectedNode(foundNode);
                setSearchOpen(false);
                setSearchQuery('');
            }
        }
    };

    const onNodesChange = useCallback(
        (changes) => {
            setNodes((nds) => applyNodeChanges(changes, nds));
        },
        []
    );

    return (
        <>
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
                    onInit={setReactFlowInstance}
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

            {/* Custom Search Dialog */}
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
