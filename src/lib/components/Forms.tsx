import { DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { FirebaseError } from 'firebase/app';
import {
  Timestamp,
  addDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';
import type { FieldProps, FormikHelpers, FormikProps } from 'formik';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';

import { typedDb } from '../utils/db';
import {
  validateFirstName,
  validateLastName,
  validateMail,
  validatePhone,
  validateTitle,
  validateDescription,
  validateState,
  validateToken,
} from '../utils/validators';

type ChakraInputProps = string | number | readonly string[] | undefined;

interface RegisterFormValues {
  first_name: string;
  last_name: string;
  mail: string;
  phone: string;
  token: string;
  title: string;
  description: string;
  state: string;
}

interface TrackFormValues {
  mail: string;
  token: string;
}

function RegistrationFormComponent() {
  const handleSubmit = async (
    values: RegisterFormValues,
    { setStatus, resetForm }: FormikHelpers<RegisterFormValues>
  ) => {
    setStatus();

    const reparationCollectionReference = typedDb.combinedReparations;
    addDoc(reparationCollectionReference, {
      reparation_events: [
        {
          state_cycle: 'REGISTERED',
          timestamp: Timestamp.fromDate(new Date()),
        },
      ],
      reparation_remarks: '',
      reparation_state_cycle: 'REGISTERED',
      reparation_state_reparation: 'UNKNOWN',
      reparation_state_token: 'RELEASED',
      reparation_token: values.token,

      user_first_name: values.first_name,
      user_last_name: values.last_name,
      user_mail: values.mail,
      user_phone: values.phone,

      item_name: values.title,
      item_description: values.description,
      item_state: values.state,
    })
      .then(() => {
        resetForm({
          values: {
            ...values,
            token: '',
            title: '',
            description: '',
            state: '',
          },
        });

        setStatus({
          status: 'SUCCESS',
          message: 'Gelukt! We hebben uw registratie goed ontvangen.',
        });
      })
      .catch((error) => {
        const code = error instanceof FirebaseError ? error.code : 'unknown';

        console.error(error);
        setStatus({
          status: 'ERROR',
          message: `Oeps, er liep iets mis. Probeer later opnieuw. (${code})`,
        });
      });
  };

  return (
    <Box w="100%">
      <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          mail: '',
          phone: '',
          token: '',
          title: '',
          description: '',
          state: '',
        }}
        onSubmit={(values, actions) => handleSubmit(values, actions)}
      >
        {(props: FormikProps<RegisterFormValues>) => (
          <Form>
            <VStack w="100%" spacing={10} marginY={10}>
              <VStack w="100%" spacing={4}>
                <HStack w="100%" alignItems="flex-start">
                  <Field name="first_name" validate={validateFirstName}>
                    {({
                      field,
                      form,
                    }: FieldProps<ChakraInputProps, RegisterFormValues>) => (
                      <FormControl
                        isInvalid={
                          !!form.errors.first_name && !!form.touched.first_name
                        }
                      >
                        <FormLabel>Voornaam</FormLabel>
                        <Input
                          {...field}
                          placeholder="Jan"
                          autoComplete="given-name"
                        />
                        <FormErrorMessage>
                          {form.errors.first_name}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="last_name" validate={validateLastName}>
                    {({
                      field,
                      form,
                    }: FieldProps<ChakraInputProps, RegisterFormValues>) => (
                      <FormControl
                        isInvalid={
                          !!form.errors.last_name && !!form.touched.last_name
                        }
                      >
                        <FormLabel>Achternaam</FormLabel>
                        <Input
                          {...field}
                          placeholder="Peeters"
                          autoComplete="family-name"
                        />
                        <FormErrorMessage>
                          {form.errors.last_name}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </HStack>

                <HStack w="100%" alignItems="flex-start">
                  <Field name="mail" validate={validateMail}>
                    {({
                      field,
                      form,
                    }: FieldProps<ChakraInputProps, RegisterFormValues>) => (
                      <FormControl
                        isInvalid={!!form.errors.mail && !!form.touched.mail}
                      >
                        <FormLabel>
                          E-mailadres <small>(optioneel)</small>
                        </FormLabel>
                        <Input
                          {...field}
                          type="email"
                          placeholder="jan.peeters@telenet.be"
                          autoComplete="email"
                        />
                        <FormHelperText>
                          Je zal op dit e-mailadres een melding ontvangen
                          wanneer je toestel gerepareerd is.
                        </FormHelperText>
                        <FormErrorMessage>{form.errors.mail}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="phone" validate={validatePhone}>
                    {({
                      field,
                      form,
                    }: FieldProps<ChakraInputProps, RegisterFormValues>) => (
                      <FormControl
                        isInvalid={!!form.errors.phone && !!form.touched.phone}
                      >
                        <FormLabel>
                          Telefoonnummer <small>(optioneel)</small>
                        </FormLabel>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="0470 12 34 56"
                          autoComplete="tel"
                        />
                        <FormHelperText>
                          Moesten er zich toch problemen voordoen, bereiken we
                          je via dit nummer.
                        </FormHelperText>
                        <FormErrorMessage>{form.errors.phone}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </HStack>

                <Box h={1} />

                <Field name="token" validate={validateToken}>
                  {({
                    field,
                    form,
                  }: FieldProps<ChakraInputProps, RegisterFormValues>) => (
                    <FormControl
                      isInvalid={!!form.errors.title && !!form.touched.title}
                    >
                      <FormLabel>Volgnummer</FormLabel>
                      <Input {...field} placeholder="R18" />
                      <FormHelperText>
                        Zorg ervoor dat deze nummer uniek is om conflicten bij
                        het oproepen en ophalen te vermijden.
                      </FormHelperText>
                      <FormErrorMessage>{form.errors.token}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="title" validate={validateTitle}>
                  {({
                    field,
                    form,
                  }: FieldProps<ChakraInputProps, RegisterFormValues>) => (
                    <FormControl
                      isInvalid={!!form.errors.title && !!form.touched.title}
                    >
                      <FormLabel>Omschrijving toestel</FormLabel>
                      <Input {...field} placeholder="Stofzuiger" />
                      <FormErrorMessage>{form.errors.title}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="description" validate={validateDescription}>
                  {({
                    field,
                    form,
                  }: FieldProps<ChakraInputProps, RegisterFormValues>) => (
                    <FormControl
                      isInvalid={
                        !!form.errors.description && !!form.touched.description
                      }
                    >
                      <FormLabel>
                        Omschrijving probleem <small>(optioneel)</small>
                      </FormLabel>
                      <Textarea
                        {...field}
                        placeholder="Wanneer ik het toestel inschakel gebeurt er niets. Ik hoor een zoemend geluid."
                      />
                      <FormHelperText>
                        Een goede omschrijving help onze techniekers om snel een
                        goede oplossing te vinden.
                      </FormHelperText>
                      <FormErrorMessage>
                        {form.errors.description}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="state" validate={validateState}>
                  {({
                    field,
                    form,
                  }: FieldProps<string | undefined, RegisterFormValues>) => (
                    <FormControl
                      isInvalid={!!form.errors.state && !!form.touched.state}
                    >
                      <FormLabel>Toestand toestel</FormLabel>
                      <RadioGroup {...field}>
                        <Stack direction="row">
                          <Radio {...field} value="BROKEN">
                            Defect
                          </Radio>
                          <Radio {...field} value="FAULTY">
                            Niet goed werkend
                          </Radio>
                          <Radio {...field} value="OTHER">
                            Anders
                          </Radio>
                        </Stack>
                      </RadioGroup>
                      <FormErrorMessage>{form.errors.state}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </VStack>

              <FormControl isInvalid={props.status?.status === 'ERROR'}>
                <HStack>
                  <Button w="100%" isLoading={props.isSubmitting} type="submit">
                    Registreren
                  </Button>
                  <IconButton
                    onClick={() => props.resetForm()}
                    isRound
                    aria-label="Formulier leegmaken"
                    icon={<DeleteIcon />}
                  />
                </HStack>
                {props.status?.status === 'ERROR' ? (
                  <FormErrorMessage>{props.status?.message}</FormErrorMessage>
                ) : (
                  <Text mt={2}>{props.status?.message}</Text>
                )}
              </FormControl>
            </VStack>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

function TrackFormComponent() {
  const { push } = useRouter();

  const handleSubmit = async (
    values: TrackFormValues,
    { setStatus, resetForm }: FormikHelpers<TrackFormValues>
  ) => {
    setStatus();
    try {
      const reparationsCollectionReference = typedDb.combinedReparations;
      const reparationQuery = query(
        reparationsCollectionReference,
        where('reparation_token', '==', values.token),
        where('user_mail', '==', values.mail),
        limit(1)
      );
      const reparationQuerySnapshot = await getDocs(reparationQuery);

      if (reparationQuerySnapshot.size === 0) {
        setStatus({
          status: 'ERROR',
          message: 'We konden geen reparatie vinden met deze volgnummer.',
        });
        return;
      }

      resetForm();
      setStatus({
        status: 'SUCCESS',
        message: 'Even geduld, we sturen u door naar de tracking pagina.',
      });
      push(`/track/reparation?id=${reparationQuerySnapshot.docs[0].id}`);
    } catch (error) {
      const code = error instanceof FirebaseError ? error.code : 'unknown';

      console.error(error);
      setStatus({
        status: 'ERROR',
        message: `Oeps, er liep iets mis. Probeer later opnieuw. (${code})`,
      });
    }
  };

  return (
    <Box w="100%">
      <Formik
        initialValues={{
          mail: '',
          token: '',
        }}
        onSubmit={(values, actions) => handleSubmit(values, actions)}
      >
        {(props: FormikProps<TrackFormValues>) => (
          <Form>
            <VStack w="100%" spacing={10} marginY={10}>
              <VStack w="100%" spacing={4}>
                <Field name="mail" validate={validateMail}>
                  {({
                    field,
                    form,
                  }: FieldProps<ChakraInputProps, TrackFormValues>) => (
                    <FormControl
                      isInvalid={!!form.errors.mail && !!form.touched.mail}
                    >
                      <FormLabel>E-mailadres</FormLabel>
                      <Input
                        {...field}
                        type="email"
                        placeholder="jan.peeters@telenet.be"
                        autoComplete="email"
                      />
                      <FormHelperText>
                        Het e-mailadres dat je bij de registratie opgaf.
                      </FormHelperText>
                      <FormErrorMessage>{form.errors.mail}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="token" validate={validateToken}>
                  {({
                    field,
                    form,
                  }: FieldProps<ChakraInputProps, TrackFormValues>) => (
                    <FormControl
                      isInvalid={!!form.errors.token && !!form.touched.token}
                    >
                      <FormLabel>Volgnummer</FormLabel>
                      <HStack>
                        <Input {...field} type="text" />
                      </HStack>
                      <FormHelperText>
                        De volgnummer die je bij afgifte ontving.
                      </FormHelperText>
                      <FormErrorMessage>{form.errors.token}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </VStack>

              <FormControl isInvalid={props.status?.status === 'ERROR'}>
                <Button w="100%" isLoading={props.isSubmitting} type="submit">
                  Zoeken
                </Button>
                {props.status?.status === 'ERROR' ? (
                  <FormErrorMessage>{props.status?.message}</FormErrorMessage>
                ) : (
                  <Text mt={2}>{props.status?.message}</Text>
                )}
              </FormControl>
            </VStack>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export { RegistrationFormComponent, TrackFormComponent };
