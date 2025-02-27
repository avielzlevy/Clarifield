"use client"
import React, { useState, useEffect, useCallback } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    TextField,
    Box,
    Grid,
    Typography,
    Chip,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import RefreshIcon from '@mui/icons-material/Refresh'
import RandExp from 'randexp'
import { RefreshCcw } from 'lucide-react'

export default function RegexBuilderDialog(props) {
    const { open, setOpen,setFormat } = props
    // Regex pattern state
    const [pattern, setPattern] = useState("")
    const [testString, setTestString] = useState("Test your regex here")
    const [matches, setMatches] = useState([])
    const [examples, setExamples] = useState({ valid: [] })

    // Character class presets
    const [presets, setPresets] = useState({
        digits: false,
        letters: false,
        uppercase: false,
        lowercase: false,
        whitespace: false,
        specialChars: false,
    })

    // Length toggle and its parameters
    const [lengthEnabled, setLengthEnabled] = useState(false)
    const [minLength, setMinLength] = useState("")
    const [maxLength, setMaxLength] = useState("")
    // Build regex pattern based on presets and length settings
    useEffect(() => {
        let basePattern = ""
        const charClasses = []
        if (presets.digits) charClasses.push("0-9")
        if (presets.letters) charClasses.push("a-zA-Z")
        else {
            if (presets.lowercase) charClasses.push("a-z")
            if (presets.uppercase) charClasses.push("A-Z")
        }
        if (presets.whitespace) charClasses.push("\\s")
        if (presets.specialChars)
            charClasses.push("!@#$%^&*()_+\\-=\\[\\]{}|;:'\",.<>/?\\\\")
        if (charClasses.length > 0) {
            basePattern = `[${charClasses.join("")}]`
        }
        // If length toggle is enabled and there is a base pattern, append quantifier
        if (lengthEnabled && basePattern) {
            if (minLength !== "" || maxLength !== "") {
                basePattern = `${basePattern}{${minLength||0},${maxLength}}`
            }
        }
        setPattern(`^${basePattern}$`)
    }, [presets, lengthEnabled, minLength, maxLength])

    // Test the regex against the test string
    useEffect(() => {
        if (!pattern) {
            setMatches([])
            return
        }
        try {
            const regex = new RegExp(pattern, "g")
            const matchResults = [...testString.matchAll(regex)]
            setMatches(matchResults.map((match) => match[0]))
        } catch (error) {
            setMatches([])
        }
    }, [pattern, testString])

    const generateAllowed = useCallback(() => {
        // use RandExp and fill examples with valid examples
        const randexp = new RandExp(pattern);
        const valid = [];
        const invalid = [];
        for (let i = 0; i < 5; i++) {
            valid.push(randexp.gen());
        }
        setExamples({ valid, invalid });
    }, [pattern]);

    // Generate example matches and non-matches
    useEffect(() => {
        if (!pattern) {
            setExamples({ valid: [], invalid: [] })
            return
        }
        try {
            generateAllowed();
        } catch (error) {
            setExamples({ valid: [], invalid: [] })
        }
    }, [pattern, generateAllowed])

    // Toggle a preset
    const togglePreset = (preset) => {
        setPresets((prev) => ({
            ...prev,
            [preset]: !prev[preset],
        }))
    }

    // Copy regex to clipboard
    const copyRegex = () => {
        navigator.clipboard.writeText(`/${pattern}/`)
    }

    // Generate a random test string
    const generateRandomTestString = () => {
        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*() "
        let result = ""
        const length = 20
        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * characters.length)
            )
        }
        setTestString(result)
    }

    const useFormat = () => {
        setFormat((prev) => ({
            ...prev,
            pattern: pattern,
        }))
        setOpen(false)
    }

    return (
        <>
            <Button variant="contained" onClick={() => setOpen(true)}>
                Open Regex Builder
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>Regex Builder</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        {/* Sidebar for Character Classes */}
                        <Grid item xs={12} md={3}>
                            <Typography variant="h6" gutterBottom>
                                Character Classes
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button
                                    variant={presets.digits ? "contained" : "outlined"}
                                    onClick={() => togglePreset("digits")}
                                >
                                    Digits (0-9)
                                </Button>
                                <Button
                                    variant={presets.letters ? "contained" : "outlined"}
                                    onClick={() => togglePreset("letters")}
                                >
                                    Letters (a-z, A-Z)
                                </Button>
                                <Button
                                    variant={presets.lowercase ? "contained" : "outlined"}
                                    onClick={() => togglePreset("lowercase")}
                                >
                                    Lowercase (a-z)
                                </Button>
                                <Button
                                    variant={presets.uppercase ? "contained" : "outlined"}
                                    onClick={() => togglePreset("uppercase")}
                                >
                                    Uppercase (A-Z)
                                </Button>
                                <Button
                                    variant={presets.whitespace ? "contained" : "outlined"}
                                    onClick={() => togglePreset("whitespace")}
                                >
                                    Whitespace
                                </Button>
                                <Button
                                    variant={presets.specialChars ? "contained" : "outlined"}
                                    onClick={() => togglePreset("specialChars")}
                                >
                                    Special Characters
                                </Button>
                                {/* New Length Toggle */}
                                <Button
                                    variant={lengthEnabled ? "contained" : "outlined"}
                                    onClick={() => setLengthEnabled((prev) => !prev)}
                                >
                                    Length
                                </Button>
                                {lengthEnabled && (
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <TextField 
                                            label="Min" 
                                            variant="outlined" 
                                            size="small" 
                                            type="number" 
                                            value={minLength} 
                                            onChange={(e) => setMinLength(e.target.value)} 
                                        />
                                        <TextField 
                                            label="Max" 
                                            variant="outlined" 
                                            size="small" 
                                            type="number" 
                                            value={maxLength} 
                                            onChange={(e) => setMaxLength(e.target.value)} 
                                        />
                                    </Box>
                                )}
                                <Button
                                    variant="outlined"
                                    onClick={() =>
                                        setPresets({
                                            digits: false,
                                            letters: false,
                                            uppercase: false,
                                            lowercase: false,
                                            whitespace: false,
                                            specialChars: false,
                                        })
                                    }
                                    sx={{ mt: 2 }}
                                >
                                    Reset All
                                </Button>
                            </Box>
                        </Grid>
                        {/* Main Content */}
                        <Grid item xs={12} md={9}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">Current Regex</Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: '#f5f5f5',
                                        padding: 1,
                                        borderRadius: 1,
                                        fontFamily: 'monospace',
                                        overflowX: 'auto',
                                    }}
                                >
                                    {`/${pattern}/`}
                                    <IconButton onClick={copyRegex} size="small">
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="subtitle1">Test String</Typography>
                                    <Button
                                        onClick={generateRandomTestString}
                                        startIcon={<RefreshIcon fontSize="small" />}
                                    >
                                        Random
                                    </Button>
                                </Box>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    value={testString}
                                    onChange={(e) => setTestString(e.target.value)}
                                    inputProps={{ style: { fontFamily: 'monospace' } }}
                                />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">Matches</Typography>
                                <Box
                                    sx={{
                                        minHeight: '40px',
                                        padding: 1,
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: 1,
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                    }}
                                >
                                    {matches.length > 0 ? (
                                        matches.map((match, i) => (
                                            <Chip key={i} label={match} variant="outlined" />
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            No matches found
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1">Reference Window</Typography>
                                <RefreshCcw onClick={generateAllowed} style={{ cursor: 'pointer' }} />
                                </Box>
                                {examples.valid.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {examples.valid.map((ex, i) => (
                                            <Chip key={i} label={ex} variant="outlined" color="success" />
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No examples available
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Close</Button>
                    <Button onClick={useFormat} variant="contained" color="primary">
                        Use Regex
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
