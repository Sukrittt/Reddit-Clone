import { FC } from "react";
import { Icon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/Tooltip";

interface CustomToolTipProps {
  text: string;
  trigger: Icon;
}

export const CustomToolTip: FC<CustomToolTipProps> = ({
  text,
  trigger: Icon,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button>
            <Icon className="cursor-pointer h-4 w-4 text-zinc-400 hover:text-zinc-500 transition" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="mr-2">
          <p className="text-xs text-zinc-800">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
