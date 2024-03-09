type ReparationEvent = {
  state_cycle: string;
  timestamp: Date;
};

type Reparation = {
  _id: string;
  events: ReparationEvent[];
  item_id: string;
  remarks: string;
  state_cycle: string;
  state_reparation: string;
  state_token: string;
  token: string;
};
