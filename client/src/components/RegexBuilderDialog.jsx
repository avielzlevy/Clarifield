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
    Typography,
    Chip,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import RefreshIcon from '@mui/icons-material/Refresh'
import RandExp from 'randexp'
import { RefreshCcw, CircleCheck, CircleX } from 'lucide-react'

export default function RegexBuilderDialog(props) {
    const { open, setOpen, setFormat } = props
    // Regex pattern state
    const [pattern, setPattern] = useState("")
    const [testString, setTestString] = useState("Test your regex here")
    const [matches, setMatches] = useState(false)
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
    const [minLength, setMinLength] = useState("")
    const [maxLength, setMaxLength] = useState("")
    // Build regex pattern based on presets and length settings
    useEffect(() => {
        let basePattern = ""
        const charClasses = []
        if (presets.digits) charClasses.push("0-9")
        if (presets.hebrewletters) charClasses.push("א-תךםןףץ")
        if (presets.lowercase) charClasses.push("a-z")
        if (presets.uppercase) charClasses.push("A-Z")
        if (presets.whitespace) charClasses.push("\\s")
        if (presets.specialChars)
            charClasses.push("!@#$%^&*()_+\\-=\\[\\]{}|;:'\",.<>/?\\\\")
        if (charClasses.length > 0) {
            basePattern = `[${charClasses.join("")}]`
        }
        if (minLength !== "" || maxLength !== "") {
            basePattern = `${basePattern}{${minLength || 0},${maxLength}}`
        }
        setPattern(`^${basePattern}$`)
    }, [presets, minLength, maxLength])

    // Test the regex against the test string
    useEffect(() => {
        if (!pattern) {
            setMatches(false)
            return
        }
        try {
            const regex = new RegExp(pattern, "g")
            const matchResults = regex.test(testString)
            setMatches(matchResults)
        } catch (error) {
            setMatches(false)
        }
    }, [pattern, testString])


    // Extract {min,max} from the pattern
    const extractMinMaxFromPattern = (pattern) => {
        const match = pattern.match(/\{(\d+),?(\d+)?\}/); // Capture `{min,max}` or `{min}`
        if (match) {
            const min = parseInt(match[1], 10);
            const max = match[2] ? parseInt(match[2], 10) : min; // If no max, min = max
            return { min, max };
        }
        return { min: 5, max: 10 }; // Default fallback if no `{x,y}` is found
    };

    // Hebrew character set (including final letters)
    const HEBREW_CHARS = "אבגדהוזחטיכלמנסעפצקרשתךםןףץ";

    // Generate a fully Hebrew example
    const generateHebrewExample = ({ min, max, numbers = false }) => {
        console.log({ min, max, numbers })
        const length = Math.floor(Math.random() * (max - min + 1)) + min;
        let result = "";
        let charUsed = HEBREW_CHARS
        if (numbers) {
            charUsed += "0123456789"
        }
        for (let i = 0; i < length; i++) {
            result += charUsed.charAt(Math.floor(Math.random() * charUsed.length));
        }
        console.log(result)
        return result;
    };

    // Function to mix Hebrew into a base string
    const mixHebrewIntoExample = (baseExample) => {
        let result = baseExample.split('');
        for (let i = 0; i < result.length; i++) {
            if (Math.random() < 0.5) { // 50% chance to replace a character with Hebrew
                result[i] = HEBREW_CHARS.charAt(Math.floor(Math.random() * HEBREW_CHARS.length));
            }
        }
        return result.join('');
    };

    const generateAllowed = useCallback(() => {
        const { min, max } = extractMinMaxFromPattern(pattern); // Extract min/max from pattern
        const randexp = new RandExp(pattern);
        const valid = [];

        for (let i = 0; i < 5; i++) {
            let example;

            if (pattern.includes("א-תךםןףץ") && !pattern.includes("a-z") && !pattern.includes("A-Z") && !pattern.includes("0-9")) {

                example = generateHebrewExample({ min, max });

            } else {
                // Otherwise, use RandExp and inject Hebrew if needed
                example = randexp.gen();
                if (pattern.includes('א-ת') || pattern.includes('ךםןףץ')) {
                    example = mixHebrewIntoExample(example);
                }
            }
            if (example !== null && example !== undefined)
                valid.push(example);
        }

        setExamples({ valid });
    }, [pattern]);
    // Generate example matches and non-matches
    useEffect(() => {
        if (
            !pattern ||
            (
                minLength !== "" &&
                maxLength !== "" &&
                (!pattern.includes("[") || !pattern.includes("]"))
            )
        ) {
            setExamples({ valid: [] })
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
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xl">
                <DialogTitle>Regex Builder</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            maxWidth: '20vw',
                            gap: 2,
                            // padding: 2,
                            // borderRight: { xs: 0, md: '1px solid #e0e0e0' },
                        }}>
                            <Typography variant="h7" gutterBottom>
                                Character Classes
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    variant={presets.digits ? "contained" : "outlined"}
                                    onClick={() => togglePreset("digits")}
                                >
                                    Digits (0-9)
                                </Button>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    variant={presets.hebrewletters ? "contained" : "outlined"}
                                    onClick={() => togglePreset("hebrewletters")}
                                >
                                    Hebrew Letters (א-ת)
                                </Button>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    variant={presets.lowercase ? "contained" : "outlined"}
                                    onClick={() => togglePreset("lowercase")}
                                >
                                    English Lowercase (a-z)
                                </Button>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    variant={presets.uppercase ? "contained" : "outlined"}
                                    onClick={() => togglePreset("uppercase")}
                                >
                                    English Uppercase (A-Z)
                                </Button>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    variant={presets.whitespace ? "contained" : "outlined"}
                                    onClick={() => togglePreset("whitespace")}
                                >
                                    Whitespace
                                </Button>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    variant={presets.specialChars ? "contained" : "outlined"}
                                    onClick={() => togglePreset("specialChars")}
                                >
                                    Special Characters
                                </Button>

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
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            maxWidth: '50vw',
                            width: '50vw',
                            gap: 2,
                            // padding: 2,
                        }}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
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
                                    Ado
                                    sx={{
                                        "& fieldset": { border: 'none' },
                                        "border": matches ? '1px solid green' : '1px solid red',
                                        borderRadius: 2,
                                    }}
                                    slotProps={{
                                        input: {
                                            disableUnderline: true,
                                            endAdornment: matches ? <CircleCheck color="green" /> : <CircleX color="red" />
                                        }
                                    }}
                                />
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                maxWidth: '50vw'

                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle1">Reference Window</Typography>
                                    <RefreshCcw onClick={generateAllowed} style={{ cursor: 'pointer' }} />
                                </Box>
                                {examples.valid.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
                                        {examples.valid.map((ex, i) => (
                                            <Chip key={i} label={ex} variant="outlined" color="success" onClick={() => setTestString(ex)} />
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No examples available
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
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
