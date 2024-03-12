function validateFirstName(value: string) {
  let error;
  if (!value) {
    error = 'Voornaam is vereist';
  }
  return error;
}

function validateLastName(value: string) {
  let error;
  if (!value) {
    error = 'Achternaam is vereist';
  }
  return error;
}

function validateMail(value: string) {
  let error;
  if (!value) {
    error = 'E-mailadres is vereist';
  } else if (
    !String(value).match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  ) {
    error = 'Geef een geldig e-mailadres op a.u.b.';
  }
  return error;
}

function validatePhone(value: string) {
  let error;
  if (!value) {
    error = 'Telefoonnummer is vereist';
  } else if (
    !String(value).match(
      /^(((\+|00)32[ ]?(?:\(0\)[ ]?)?)|0){1}(4(60|[789]\d)\/?(\s?\d{2}\.?){2}(\s?\d{2})|(\d\/?\s?\d{3}|\d{2}\/?\s?\d{2})(\.?\s?\d{2}){2})$/
    )
  ) {
    error = 'Geef een geldig telefoonnummer op a.u.b.';
  }
  return error;
}

function validateTitle(value: string) {
  let error;
  if (!value) {
    error = 'Omschrijving toestel is vereist';
  }
  return error;
}

function validateDescription(value: string) {
  let error;
  if (!value) {
    error = 'Omschrijving probleem is vereist';
  }
  return error;
}

function validateState(value: string) {
  let error;
  if (!value) {
    error = 'Kies een toestand waarin het toestel zich bevind';
  }
  return error;
}

function validateToken(value: string) {
  let error;
  if (!value) {
    error = 'Volgnummer is vereist';
  } else if (String(value).match(/^[a-z][0-9]*$/)) {
    error = 'Enkel hoofdletters zijn toegelaten.';
  } else if (!String(value).match(/^[A-Z][0-9]{2}$/)) {
    error = 'Geef een geldig volgnummer op a.u.b.';
  }
  return error;
}

export {
  validateDescription,
  validateFirstName,
  validateLastName,
  validateMail,
  validatePhone,
  validateState,
  validateTitle,
  validateToken,
};
