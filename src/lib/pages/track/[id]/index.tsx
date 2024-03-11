'use client';

import {
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Text,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { FirebaseError } from 'firebase/app';
import { onSnapshot, doc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import ReparationStepsComponent from '~/lib/components/ReparationSteps';
import { AutoReparationTagComponent } from '~/lib/components/ReparationTag';
import { db } from '~/lib/firebase/config';
import { Reparation } from '~/lib/models/reparation';

const Home = ({ params }: any) => {
  const toast = useToast();
  const { id } = params;
  const [reparation, setReparation] = useState<Reparation>();

  const getReparation = (setReparation: any) => {
    onSnapshot(
      doc(db, 'reparations', id),
      (doc: any) => {
        const document: Reparation = { _id: doc.id, ...doc.data() };
        setReparation(document);
      },
      (error) => {
        let code = 'unknown';
        error instanceof FirebaseError && (code = error.code);

        console.error(error);
        toast({
          title: `Oeps!`,
          description: `Er liep iets mis bij het ophalen van gegevens. (${code})`,
          status: 'error',
          isClosable: true,
          duration: 10000,
        });
      }
    );
  };

  useEffect(() => getReparation(setReparation), []);

  if (reparation) {
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
          <VStack w="100%" spacing={10} marginY={10}>
            <ReparationStepsComponent reparation={reparation} />

            <FormControl>
              <FormLabel>Toestand herstelling</FormLabel>
              <AutoReparationTagComponent reparation={reparation} />
            </FormControl>

            <FormControl>
              <FormLabel>Opmerkingen</FormLabel>
              <Textarea isDisabled value={reparation.remarks} />
              <FormHelperText>
                Als de technieker of een medewerker opmerkingen heeft
                achtergelaten, kan je deze in bovenstaand vak lezen.
              </FormHelperText>
            </FormControl>
          </VStack>
        </Flex>
      </>
    );
  } else {
    <Text>Laden...</Text>;
  }
};

export default Home;
