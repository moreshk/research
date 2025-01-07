import React from 'react';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';

export interface ScoreTooltipProps {
  label: string;
  score: number | null;
  tooltipContent: string;
}

export const ScoreTooltip: React.FC<ScoreTooltipProps> = ({ 
  label, 
  score, 
  tooltipContent 
}) => {
  return (
    <div className="text-center">
      <div className="text-sm text-gray-400 flex items-center justify-center">
        {label}
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <InfoCircledIcon className="h-3 w-3 text-gray-400 ml-1 cursor-help" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-gray-800 px-4 py-2 rounded-md text-sm text-white shadow-lg max-w-xs"
                sideOffset={5}
              >
                <p>{tooltipContent}</p>
                <Tooltip.Arrow className="fill-gray-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
      <div className="text-lg font-medium text-white">
        {score !== null ? score.toFixed(1) : 'N/A'}
      </div>
    </div>
  );
}; 