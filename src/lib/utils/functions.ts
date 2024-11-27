import type { ExtendedCombinedReparation } from './models';

function sortReparationsOnEvent(
  reparationA: ExtendedCombinedReparation,
  reparationB: ExtendedCombinedReparation,
  event_state_cycle: string
) {
  return (
    reparationA.reparation_events
      .filter((event) => event.state_cycle === event_state_cycle)[0]
      .timestamp.toMillis() -
    reparationB.reparation_events
      .filter((event) => event.state_cycle === event_state_cycle)[0]
      .timestamp.toMillis()
  );
}

export { sortReparationsOnEvent };
