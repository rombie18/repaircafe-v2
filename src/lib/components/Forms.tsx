import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
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
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import type { FieldProps, FormikHelpers, FormikProps } from 'formik';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';

import { db } from '../utils/firebase';
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

    await runTransaction(db, async (transaction) => {
      let userId: string | undefined;

      const collectionReference = typedDb.users;
      const usersQuery = query(
        collectionReference,
        where('mail', '==', values.mail)
      );
      const usersQuerySnapshot = await getDocs(usersQuery);
      usersQuerySnapshot.forEach((doc) => {
        userId = doc.id;
      });

      let userDocumentReference;
      if (!userId) {
        userDocumentReference = typedDb.user();
      } else {
        userDocumentReference = typedDb.user(userId);
      }

      await transaction.set(userDocumentReference, {
        first_name: values.first_name,
        last_name: values.last_name,
        mail: values.mail,
        phone: values.phone,
      });

      const itemDocumentReference = typedDb.item();
      await transaction.set(itemDocumentReference, {
        name: values.title,
        description: values.description,
        state: values.state,
        user_id: userDocumentReference.id,
      });

      const reparationDocumentReference = typedDb.reparation();
      await transaction.set(reparationDocumentReference, {
        events: [
          {
            state_cycle: 'REGISTERED',
            timestamp: Timestamp.fromDate(new Date()),
          },
        ],
        item_id: itemDocumentReference.id,
        remarks: '',
        state_cycle: 'REGISTERED',
        state_reparation: 'UNKNOWN',
        state_token: 'RELEASED',
        token: '',
      });
    })
      .then(() => {
        resetForm();
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
                <Field name="mail" validate={validateMail}>
                  {({
                    field,
                    form,
                  }: FieldProps<ChakraInputProps, RegisterFormValues>) => (
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
                        Je zal op dit e-mailadres een melding ontvangen wanneer
                        je toestel gerepareerd is.
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
                      <FormLabel>Telefoonnummer</FormLabel>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="0470 12 34 56"
                        autoComplete="tel"
                      />
                      <FormHelperText>
                        Moesten er zich toch problemen voordoen, bereiken we je
                        via dit nummer.
                      </FormHelperText>
                      <FormErrorMessage>{form.errors.phone}</FormErrorMessage>
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
                      <FormLabel>Omschrijving probleem</FormLabel>
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
                <Button w="100%" isLoading={props.isSubmitting} type="submit">
                  Registreren
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

function TrackFormComponent() {
  const { push } = useRouter();

  const handleSubmit = async (
    values: TrackFormValues,
    { setStatus, resetForm }: FormikHelpers<TrackFormValues>
  ) => {
    setStatus();
    try {
      let userId: string = '';
      const reparations: Record<string, string> = {};

      const itemIdsFromToken: string[] = [];
      const itemIdsFromUser: string[] = [];

      const reparationsCollectionReference = typedDb.reparations;
      const tokensQuery = query(
        reparationsCollectionReference,
        where('token', '==', values.token)
      );
      const tokensQuerySnapshot = await getDocs(tokensQuery);
      tokensQuerySnapshot.forEach((doc) => {
        itemIdsFromToken.push(doc.data().item_id);
        reparations[doc.data().item_id] = doc.id;
      });
      if (itemIdsFromToken.length === 0) {
        setStatus({
          status: 'ERROR',
          message: 'We konden geen reparatie vinden met deze volgnummer.',
        });
        return;
      }

      const usersCollectionReference = typedDb.users;
      const userQuery = query(
        usersCollectionReference,
        where('mail', '==', values.mail)
      );
      const userQuerySnapshot = await getDocs(userQuery);
      userQuerySnapshot.forEach((doc) => {
        userId = doc.id;
      });
      if (!userId) {
        setStatus({
          status: 'ERROR',
          message: 'We konden geen gebruiker vinden met dit e-mailadres.',
        });
        return;
      }

      const itemsCollectionReference = typedDb.items;
      const itemsQuery = query(
        itemsCollectionReference,
        where('user_id', '==', userId)
      );
      const itemsQuerySnapshot = await getDocs(itemsQuery);
      itemsQuerySnapshot.forEach((doc) => {
        itemIdsFromUser.push(doc.id);
      });

      const intersectedItemIds = itemIdsFromToken.filter((value) =>
        itemIdsFromUser.includes(value)
      );

      if (intersectedItemIds.length === 0) {
        setStatus({
          status: 'ERROR',
          message:
            'We konden geen reparatie vinden met deze combinatie van e-mailadres en volgnummer.',
        });
        return;
      }

      resetForm();
      setStatus({
        status: 'SUCCESS',
        message: 'Even geduld, we sturen u door naar de tracking pagina.',
      });
      push(`/track/reparation?id=${reparations[intersectedItemIds[0]]}`);
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
