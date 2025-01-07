import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';

export interface TypeTooltipProps {
  type?: string;
  showIcon?: boolean;
}

export const TypeTooltip: React.FC<TypeTooltipProps> = ({ 
  type,
  showIcon = true 
}) => {
  return (
    <div className="inline-flex items-center gap-1">
      <span>{type}</span>
      {showIcon && (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <InfoCircledIcon className="h-3 w-3 text-gray-400 cursor-help" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-gray-800 px-4 py-2 rounded-md text-sm text-white shadow-lg"
                sideOffset={5}
              >
                <p>Indicates whether the token is associated with AI agents, frameworks, applications, or memes</p>
                <Tooltip.Arrow className="fill-gray-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
    </div>
  );
}; 