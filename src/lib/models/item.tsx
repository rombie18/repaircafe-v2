interface ExtendedItem extends Item {
  id: string;
}

interface Item {
  description: string;
  name: string;
  state: string;
  user_id: string;
}

export type { ExtendedItem, Item };
