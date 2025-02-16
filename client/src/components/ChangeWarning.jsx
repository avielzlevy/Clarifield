import React, { useMemo } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

function ChangeWarning({ items, level }) {
  // Memoize the tooltip text to prevent unnecessary recalculations
  const tooltipText = useMemo(() => {
    return Object.entries(items)
      .map(
        ([key, values]) =>
          `${key}:\n${values.map((v) => `- ${v}`).join('\n')}`
      )
      .join('\n\n');
  }, [items]);

  const message = `The following items will ${
    level === 'warning' ? 'be affected' : 'break'
  } by this change:\n${tooltipText}`;

  return (
    <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{message}</span>}>
      <IconButton color={level === 'warning' ? 'warning' : 'error'} aria-label="warning">
        <WarningIcon />
      </IconButton>
    </Tooltip>
  );
}

export default ChangeWarning;
