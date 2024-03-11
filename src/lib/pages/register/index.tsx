'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
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
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import { Field, Form, Formik, FormikProps } from 'formik';
import { db } from '~/lib/firebase/config';

const Home = () => {
  return (
    <>
      <VStack paddingY={6} align="start">
        <Heading>Registreer je toestel</Heading>
        <Text>
          Heb je een stuk of niet goed werkend toestel en wil je dit graag laten
          repareren door een gemotiveerd team van studenten en docenten?
          Registreer hier je toestel en breng het naar ons herstelpunt op X.
        </Text>
      </VStack>

      <Flex
        direction="row"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={4}
        mb={8}
        flex={1}
      >
        <RegistrationFormComponent />
      </Flex>
    </>
  );
};

function RegistrationFormComponent() {
  const handleSubmit = async (
    values: {
      first_name: string;
      last_name: string;
      mail: string;
      phone: string;
      title: string;
      description: string;
      state: string;
    },
    { setStatus, resetForm }: { setStatus: Function; resetForm: Function }
  ) => {
    setStatus();

    await runTransaction(db, async (transaction) => {
      let userId: string | undefined;

      const collectionReference = collection(db, 'users');
      const usersQuery = query(
        collectionReference,
        where('mail', '==', values.mail)
      );
      const usersQuerySnapshot = await getDocs(usersQuery);
      usersQuerySnapshot.forEach((doc: any) => {
        userId = doc.id;
      });

      console.log(userId);

      let userDocumentReference;
      if (!userId) {
        userDocumentReference = doc(collection(db, 'users'));
      } else {
        userDocumentReference = doc(collection(db, 'users'), userId);
      }

      await transaction.set(userDocumentReference, {
        first_name: values.first_name,
        last_name: values.last_name,
        mail: values.mail,
        phone: values.phone,
      });
      const itemDocumentReference = doc(collection(db, 'items'));
      await transaction.set(itemDocumentReference, {
        name: values.title,
        description: values.description,
        state: values.state,
        user_id: userDocumentReference.id,
      });
      const reparationDocumentReference = doc(collection(db, 'reparations'));
      await transaction.set(reparationDocumentReference, {
        events: [
          {
            state_cycle: 'REGISTERED',
            timestamp: new Date(),
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
        let code = 'unknown';
        error instanceof FirebaseError && (code = error.code);

        console.error(error);
        setStatus({
          status: 'ERROR',
          message: `Oeps, er liep iets mis. Probeer later opnieuw. (${code})`,
        });
      });
  };

  function validateFirstName(value: string) {
    if (!value) {
      return 'Voornaam is vereist';
    }
  }

  function validateLastName(value: string) {
    if (!value) {
      return 'Achternaam is vereist';
    }
  }

  function validateMail(value: string) {
    if (!value) {
      return 'E-mailadres is vereist';
    } else if (
      !String(value).match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      return 'Geef een geldig e-mailadres op a.u.b.';
    }
  }

  function validatePhone(value: string) {
    if (!value) {
      return 'Telefoonnummer is vereist';
    } else if (
      !String(value).match(
        /^(((\+|00)32[ ]?(?:\(0\)[ ]?)?)|0){1}(4(60|[789]\d)\/?(\s?\d{2}\.?){2}(\s?\d{2})|(\d\/?\s?\d{3}|\d{2}\/?\s?\d{2})(\.?\s?\d{2}){2})$/
      )
    ) {
      return 'Geef een geldig telefoonnummer op a.u.b.';
    }
  }

  function validateTitle(value: string) {
    if (!value) {
      return 'Omschrijving toestel is vereist';
    }
  }

  function validateDescription(value: string) {
    if (!value) {
      return 'Omschrijving probleem is vereist';
    }
  }

  function validateState(value: string) {
    if (!value) {
      return 'Kies een toestand waarin het toestel zich bevind';
    }
  }

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
        {(props: FormikProps<any>) => (
          <Form>
            <VStack w="100%" spacing={10} marginY={10}>
              <VStack w="100%" spacing={4}>
                <HStack w="100%" alignItems={'flex-start'}>
                  <Field name="first_name" validate={validateFirstName}>
                    {({ field, form }: any) => (
                      <FormControl
                        isInvalid={
                          form.errors.first_name && form.touched.first_name
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
                    {({ field, form }: any) => (
                      <FormControl
                        isInvalid={
                          form.errors.last_name && form.touched.last_name
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
                  {({ field, form }: any) => (
                    <FormControl
                      isInvalid={form.errors.mail && form.touched.mail}
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
                  {({ field, form }: any) => (
                    <FormControl
                      isInvalid={form.errors.phone && form.touched.phone}
                    >
                      <FormLabel>Telefoonnummer</FormLabel>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="470 12 34 56"
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
                  {({ field, form }: any) => (
                    <FormControl
                      isInvalid={form.errors.title && form.touched.title}
                    >
                      <FormLabel>Omschrijving toestel</FormLabel>
                      <Input {...field} placeholder="Stofzuiger" />
                      <FormErrorMessage>{form.errors.title}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="description" validate={validateDescription}>
                  {({ field, form }: any) => (
                    <FormControl
                      isInvalid={
                        form.errors.description && form.touched.description
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
                  {({ field, form }: any) => (
                    <FormControl
                      isInvalid={form.errors.state && form.touched.state}
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

export default Home;
