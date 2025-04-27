// explorer/context/useContextMenu.ts
import { useState } from "react";

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    visible: boolean;
    folderPath?: string[]; // Add path tracking
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, folderPath?: string[]) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true,
      folderPath,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
  };
};
