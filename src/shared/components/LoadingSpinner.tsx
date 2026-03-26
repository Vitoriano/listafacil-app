import React from 'react';
import { Box } from '../../../components/ui/box';
import { Spinner } from '../../../components/ui/spinner';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
}

export function LoadingSpinner({ size = 'large' }: LoadingSpinnerProps) {
  return (
    <Box className="flex-1 items-center justify-center">
      <Spinner size={size} className="text-primary-500" />
    </Box>
  );
}
