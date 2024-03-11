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
  Text,
  VStack,
} from '@chakra-ui/react';
import { Formik, FormikProps, Form, Field } from 'formik';
import {
  runTransaction,
  collection,
  where,
  query,
  getDocs,
} from 'firebase/firestore';
import { db } from '~/lib/firebase/config';
import { useRouter } from 'next/navigation';

const Home = () => {
  return (
    <>
      <VStack paddingY={6} align="start">
        <Heading>Volg je toestel</Heading>
        <Text>
          Nadat je je toestel hebt binnengebracht bij onze stand, kan je in
          real-time de reparatie volgen. Dit kan eenvoudig door in onderstaand
          formulier je gegevens in te vullen die je bij afgifte achter liet.
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
        <TrackFormComponent />
      </Flex>
    </>
  );
};

function TrackFormComponent() {
  const { push } = useRouter();

  async function track(form_data: { mail: string; token: string }) {
    try {
      await runTransaction(db, async (transaction) => {
        let userId: string = '';
        let reparations: Record<string, string> = {};

        const itemIds_from_token: string[] = [];
        const itemIds_from_user: string[] = [];

        const reparationsCollectionReference = collection(db, 'reparations');
        const tokensQuery = query(
          reparationsCollectionReference,
          where('token', '==', form_data.token)
        );
        const tokensQuerySnapshot = await getDocs(tokensQuery);
        tokensQuerySnapshot.forEach((doc: any) => {
          itemIds_from_token.push(doc.data().item_id);
          reparations[doc.data().item_id] = doc.id;
        });

        const usersCollectionReference = collection(db, 'users');
        const userQuery = query(
          usersCollectionReference,
          where('mail', '==', form_data.mail)
        );
        const userQuerySnapshot = await getDocs(userQuery);
        userQuerySnapshot.forEach((doc: any) => {
          userId = doc.id;
        });

        const itemsCollectionReference = collection(db, 'items');
        const itemsQuery = query(
          itemsCollectionReference,
          where('user_id', '==', userId)
        );
        const itemsQuerySnapshot = await getDocs(itemsQuery);
        itemsQuerySnapshot.forEach((doc: any) => {
          itemIds_from_user.push(doc.id);
        });

        const intersectedItemIds = itemIds_from_token.filter((value) =>
          itemIds_from_user.includes(value)
        );

        push('/track/' + reparations[intersectedItemIds[0]]);
      });
    } catch (err) {
      //TODO handle error
      console.error(err);
    }
  }

  function generateRandomToken(reservedTokens: Set<string>): string {
    //FIXME this will cause infinite loop if no tokens are available
    let randomToken;
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

  function validateToken(value: string) {
    if (!value) {
      return 'Volgnummer is vereist';
    } else if (!String(value).match(/^[a-zA-Z][0-9]{2}$/)) {
      return 'Geef een geldig volgnummer op a.u.b.';
    }
  }

  return (
    <Box w="100%">
      <Formik
        initialValues={{
          mail: '',
          token: '',
        }}
        onSubmit={(values, actions) => track(values)}
      >
        {(props: FormikProps<any>) => (
          <Form>
            <VStack w="100%" spacing={10} marginY={10}>
              <VStack w="100%" spacing={4}>
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
                        Het e-mailadres dat je bij de registratie opgaf.
                      </FormHelperText>
                      <FormErrorMessage>{form.errors.mail}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="token" validate={validateToken}>
                  {({ field, form }: any) => (
                    <FormControl
                      isInvalid={form.errors.token && form.touched.token}
                    >
                      <FormLabel>Volgnummer</FormLabel>
                      <HStack>
                        <Input {...field} type="text" />
                        {/* <PinInput
                          onChange={(value) => setPinInput(value)}
                          value={pinInput}
                          type="alphanumeric"
                        >
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                        </PinInput> */}
                      </HStack>
                      <FormHelperText>
                        De volgnummer die je bij afgifte ontving.
                      </FormHelperText>
                      <FormErrorMessage>{form.errors.token}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </VStack>

              <Button w="100%" isLoading={props.isSubmitting} type="submit">
                Zoeken
              </Button>
            </VStack>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export default Home;
