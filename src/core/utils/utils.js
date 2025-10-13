import { useDrag } from 'react-dnd';

export const useInventoryItemDrag = (item) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'inventoryItem',
    item: { ...item },
    collect: (monitor => ({
      isDragging: !!monitor.isDragging(),
    })),
  }));

  return { isDragging, drag };
};