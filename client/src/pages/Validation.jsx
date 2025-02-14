import React, { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Box, Divider, Paper, Typography } from '@mui/material'
import axios from 'axios'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

const isValidJSON = (jsonString) => {
    if (!jsonString) return false
    try {
        JSON.parse(jsonString)
        return true
    } catch (error) {
        return false
    }
}

const validateJSON = async (jsonString) => {
    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/validate`, jsonString, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        if (error.status === 400) {
            return error.response
        }
    }
}

function Validation() {
    const [errors, setErrors] = useState([])
    const [schema, setSchema] = useState(null)
    const theme = useTheme()
    const { t } = useTranslation()

    const handleSchemaValidation = async (value) => {
        setSchema(value)
        if (isValidJSON(value)) {
            const validateResponse = await validateJSON(value)
            if (validateResponse)
                setErrors(validateResponse.data)
            else
                setErrors([])
        }
        else
            setErrors([])
    }


    return (
        <Box  
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: '10px',
            height: '87.5vh',
            margin: '10px 10px 0px 10px'
        }}>
            <Box sx={{display:'flex',flexGrow:'1'}}dir='ltr'>
            <Editor
                // height="90vh"
                width="100%"
                defaultLanguage="json"
                defaultValue=""
                value={schema}
                theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                options={{
                    minimap: {
                        enabled: false
                    },
                }}
                onChange={(value) => handleSchemaValidation(value)}
            />
            </Box>
            {/* <Divider orientation="vertical" flexItem /> */}
            <Box sx={{
                width: '50%',
                padding: '10px',
                overflow: 'auto',
                backgroundColor: theme.palette.custom.editor,
            }}>
                <Typography variant="h6" gutterBottom>
                    {t('validation_results')}
                </Typography>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                }}>
                    <Typography variant="body1" sx={{
                        //support new line
                        whiteSpace: 'pre-wrap'
                    }}>
                        {t('valid_object')}:{' '}
                    </Typography>
                    <Typography variant="body1" sx={{
                        color: isValidJSON(schema) ? 'green' : 'red',
                        fontWeight: 'bold'
                    }}>
                        {isValidJSON(schema) ? t('true') : t('false')}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="body1">
                        {t('policy_violation')}:
                    </Typography>
                    <Typography variant="body1"
                    dir='ltr'
                    sx={{
                        color: 'red',
                        fontWeight: 'bold',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {errors.map((error, index) => (
                            <Typography key={index} variant="body1" sx={{ whiteSpace: 'pre-wrap', fontWeight: 'bold' }}>
                                {`${index + 1}. ${error}`}
                            </Typography>
                        ))}
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default Validation