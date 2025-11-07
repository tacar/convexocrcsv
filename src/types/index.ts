export interface Category {
  _id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  joinTokenHash?: string;
  createdAt: number;
}

export interface List {
  _id: string;
  categoryId: string;
  title: string;
  createdAt: number;
}

export interface Item {
  _id: string;
  listId: string;
  title: string;
  done: boolean;
  details?: string;
  reminderTime?: number;
  isReminderEnabled?: boolean;
  createdBy: string;
  createdByName?: string;
  createdAt: number;
}