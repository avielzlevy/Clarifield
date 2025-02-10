import React, { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

// Define the styled container outside the component.
const Search = styled('div', {
    // Prevent the 'focused' prop from being passed to the DOM.
    shouldForwardProp: (prop) => prop !== 'focused',
})(({ theme, focused }) => ({
    position: 'relative',
    border: focused
        ? `1px solid ${theme.palette.custom.bright}`
        : `1px solid ${theme.palette.custom.light}`,
    borderRadius: 10,
    backgroundColor: theme.palette.background.default,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(5),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // Account for the search icon.
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        [theme.breakpoints.up('sm')]: {
            width: '20ch',
            '&:focus': {
                width: '50ch',
            },
        },
    },
}));

function SearchAll() {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef(null);
    const { t } = useTranslation();

    const handleContainerClick = () => {
        // Focus the input element when the container is clicked.
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <Search focused={focused} onClick={handleContainerClick}>
            <SearchIconWrapper>
                <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
                placeholder={t('search')}
                inputProps={{
                    'aria-label': 'search',
                    onFocus: () => setFocused(true),
                    onBlur: () => setFocused(false),
                }}
                inputRef={inputRef}
            />
        </Search>
    );
}

export default SearchAll;
