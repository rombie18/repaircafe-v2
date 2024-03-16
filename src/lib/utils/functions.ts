import { FirebaseError } from 'firebase/app';

import type { ExtendedReparation } from '../models/reparation';

function generateRandomToken(reservedTokens: Set<string>): string {
  let randomToken;

  if (reservedTokens.size === 2600) {
    // TODO change to other more suitable error type
    throw new FirebaseError(
      'no-tokens-available',
      'Er zijn geen vrije volgnummers beschikbaar. Alle 2600 nummers zijn in gebruik.'
    );
  }

  do {
    const randomLetter = String.fromCharCode(
      65 + Math.floor(Math.random() * 26)
    );
    const randomDigits = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');
    randomToken = `${randomLetter}${randomDigits}`;
  } while (reservedTokens.has(randomToken));

  return randomToken;
}

function sortReparationsOnEvent(
  reparationA: ExtendedReparation,
  reparationB: ExtendedReparation,
  event_state_cycle: string
) {
  return (
    reparationA.events
      .filter((event) => event.state_cycle === event_state_cycle)[0]
      .timestamp.toMillis() -
    reparationB.events
      .filter((event) => event.state_cycle === event_state_cycle)[0]
      .timestamp.toMillis()
  );
}

export { generateRandomToken, sortReparationsOnEvent };
