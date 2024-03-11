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
import { useState } from 'react';
import { FirebaseError } from 'firebase/app';

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

  const handleSubmit = async (
    values: { mail: string; token: string },
    { setStatus, resetForm }: { setStatus: Function; resetForm: Function }
  ) => {
    setStatus();
    await runTransaction(db, async (transaction) => {
      let userId: string = '';
      let reparations: Record<string, string> = {};

      const itemIdsFromToken: string[] = [];
      const itemIdsFromUser: string[] = [];

      const reparationsCollectionReference = collection(db, 'reparations');
      const tokensQuery = query(
        reparationsCollectionReference,
        where('token', '==', values.token)
      );
      const tokensQuerySnapshot = await getDocs(tokensQuery);
      tokensQuerySnapshot.forEach((doc: any) => {
        itemIdsFromToken.push(doc.data().item_id);
        reparations[doc.data().item_id] = doc.id;
      });
      if (itemIdsFromToken.length == 0) {
        setStatus({
          status: 'ERROR',
          message:
            'We konden geen reparatie vinden met deze combinatie van e-mailadres en volgnummer.',
        });
        return;
      }

      const usersCollectionReference = collection(db, 'users');
      const userQuery = query(
        usersCollectionReference,
        where('mail', '==', values.mail)
      );
      const userQuerySnapshot = await getDocs(userQuery);
      userQuerySnapshot.forEach((doc: any) => {
        userId = doc.id;
      });
      if (!userId) {
        setStatus({
          status: 'ERROR',
          message:
            'We konden geen reparatie vinden met deze combinatie van e-mailadres en volgnummer.',
        });
        return;
      }

      const itemsCollectionReference = collection(db, 'items');
      const itemsQuery = query(
        itemsCollectionReference,
        where('user_id', '==', userId)
      );
      const itemsQuerySnapshot = await getDocs(itemsQuery);
      itemsQuerySnapshot.forEach((doc: any) => {
        itemIdsFromUser.push(doc.id);
      });

      const intersectedItemIds = itemIdsFromToken.filter((value) =>
        itemIdsFromUser.includes(value)
      );

      if (intersectedItemIds.length == 0) {
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
      push('/track/' + reparations[intersectedItemIds[0]]);
    }).catch((error) => {
      let code = 'unknown';
      error instanceof FirebaseError && (code = error.code);

      console.error(error);
      setStatus({
        status: 'ERROR',
        message: `Oeps, er liep iets mis. Probeer later opnieuw. (${code})`,
      });
    });
  };

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
    } else if (String(value).match(/^[a-z][0-9]*$/)) {
      return 'Enkel hoofdletters zijn toegelaten.';
    } else if (!String(value).match(/^[A-Z][0-9]{2}$/)) {
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
        onSubmit={(values, actions) => handleSubmit(values, actions)}
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

export default Home;
