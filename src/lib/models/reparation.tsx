import type { Timestamp } from 'firebase/firestore';

interface ExtendedReparation extends Reparation {
  id: string;
}

interface Reparation {
  events: ReparationEvent[];
  item_id: string;
  remarks: string;
  state_cycle: string;
  state_reparation: string;
  state_token: string;
  token: string;
}

interface ReparationEvent {
  state_cycle: string;
  timestamp: Timestamp;
}

export type { ExtendedReparation, Reparation, ReparationEvent };
