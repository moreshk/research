import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';

export interface MomentumTooltipProps {
  score: number | null;
  showScore?: boolean;
}

export const MomentumTooltip: React.FC<MomentumTooltipProps> = ({   
  score, 
  showScore = true
}) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className="inline-flex items-center gap-1 cursor-help">
            {showScore && score !== null && (
              <span className={`font-medium ${
                score === 0 ? 'text-gray-400' :
                score > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
              </span>
            )}
            <InfoCircledIcon className="h-3 w-3 text-gray-400" />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-800 px-4 py-2 rounded-md text-sm text-white shadow-lg max-w-xs"
            sideOffset={5}
          >
            <p>Indicates the token's momentum based on recent price and volume activity</p>
            <Tooltip.Arrow className="fill-gray-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}; 