import React from "react";
import { Tooltip as ReactTooltip } from "react-tooltip"; // Use named import

const Tooltip: React.FC<{ id: string; text: string; children: React.ReactNode }> = ({ id, text, children }) => (
  <>
    <span className="relative cursor-pointer underline" data-tooltip-id={id} data-tooltip-content={text}>
      {children}
    </span>
    <ReactTooltip id={id} effect="solid" />
  </>
);

export default Tooltip;
