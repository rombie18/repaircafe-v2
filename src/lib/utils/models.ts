import type { Timestamp } from 'firebase/firestore';

interface ExtendedCombinedReparation extends CombinedReparation {
  id: string;
  user_full_name: string;
}

interface CombinedReparation {
  // Reparation
  reparation_events: ReparationEvent[];
  reparation_remarks: string;
  reparation_state_cycle: string;
  reparation_state_reparation: string;
  reparation_state_token: string;
  reparation_token: string;
  // Item
  item_description: string;
  item_name: string;
  item_state: string;
  // User
  user_first_name: string;
  user_last_name: string;
  user_mail: string;
  user_phone: string;
}

interface ReparationEvent {
  state_cycle: string;
  timestamp: Timestamp;
}

export type { ExtendedCombinedReparation, CombinedReparation };
