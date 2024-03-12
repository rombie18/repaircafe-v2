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
import { onSnapshot } from 'firebase/firestore';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import ReparationStepsComponent from '~/lib/components/ReparationSteps';
import { AutoReparationTagComponent } from '~/lib/components/ReparationTag';
import type { ExtendedReparation, Reparation } from '~/lib/models/reparation';
import { typedDb } from '~/lib/utils/db';

interface PageProps {
  params: {
    id: string;
  };
}

const Page = ({ params }: PageProps) => {
  const toast = useToast();
  const { id } = params;
  const [reparation, setReparation] = useState<Reparation>();

  useEffect(() => {
    const getData = (
      setData: Dispatch<SetStateAction<Reparation | undefined>>
    ) => {
      onSnapshot(
        typedDb.reparation(id),
        (snapshot) => {
          if (!snapshot.exists()) {
            throw Error();
          }
          const result: ExtendedReparation = {
            id: snapshot.id,
            ...snapshot.data(),
          };
          setData(result);
        },
        (error) => {
          const code = error instanceof FirebaseError ? error.code : 'unknown';

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

    getData(setReparation);
  }, [id, toast]);

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
  }

  // TODO update loading indicator
  return <Text>Laden...</Text>;
};

export default Page;
