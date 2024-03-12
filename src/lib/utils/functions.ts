import { FirebaseError } from 'firebase/app';

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

export { generateRandomToken };
