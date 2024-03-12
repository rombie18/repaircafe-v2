interface ExtendedUser extends User {
  id: string;
  name: string;
}

interface User {
  first_name: string;
  last_name: string;
  mail: string;
  phone: string;
}

export type { ExtendedUser, User };
