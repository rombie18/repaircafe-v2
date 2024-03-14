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
import { onSnapshot } from 'firebase/firestore';
import { notFound, useSearchParams } from 'next/navigation';
import type { Dispatch, SetStateAction } from 'react';
import { Suspense, useEffect, useState } from 'react';

import ReparationStepsComponent from '~/lib/components/ReparationSteps';
import { AutoReparationTagComponent } from '~/lib/components/ReparationTag';
import {
  LoadingWidgetComponent,
  ErrorWidgetComponent,
} from '~/lib/components/Widgets';
import type { ExtendedReparation } from '~/lib/models/reparation';
import { typedDb } from '~/lib/utils/db';

interface ReparationResult {
  status: string;
  reparation: ExtendedReparation | undefined;
}

const Page = () => {
  const toast = useToast();
  const [reparationResult, setReparationResult] = useState<ReparationResult>();

  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';

  useEffect(() => {
    const getData = (
      setData: Dispatch<SetStateAction<ReparationResult | undefined>>
    ) => {
      onSnapshot(
        typedDb.reparation(id),
        (snapshot) => {
          if (!snapshot.exists()) {
            setData({
              status: 'NOT_FOUND',
              reparation: undefined,
            });
            return;
          }
          const result: ExtendedReparation = {
            id: snapshot.id,
            ...snapshot.data(),
          };
          setData({
            status: 'SUCCESS',
            reparation: result,
          });
        },
        (error) => {
          console.error(error);
          setData({
            status: 'ERROR',
            reparation: undefined,
          });
        }
      );
    };

    getData(setReparationResult);
  }, [id, toast]);

  if (!reparationResult) {
    return <LoadingWidgetComponent />;
  }

  if (reparationResult.status === 'NOT_FOUND') {
    return notFound();
  }

  if (reparationResult.status === 'ERROR' || !reparationResult.reparation) {
    return <ErrorWidgetComponent />;
  }

  if (reparationResult.status === 'SUCCESS') {
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
            <ReparationStepsComponent
              reparation={reparationResult.reparation}
            />

            <FormControl>
              <FormLabel>Toestand herstelling</FormLabel>
              <AutoReparationTagComponent
                reparation={reparationResult.reparation}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Opmerkingen</FormLabel>
              <Textarea
                isDisabled
                value={reparationResult.reparation.remarks}
              />
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

  return <ErrorWidgetComponent />;
};

function Wrapper() {
  return (
    <Suspense fallback={<LoadingWidgetComponent />}>
      <Page />
    </Suspense>
  );
}

export default Wrapper;
