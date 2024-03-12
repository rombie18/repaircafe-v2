'use client';

import { Flex, Heading, Text, VStack } from '@chakra-ui/react';

import { TrackFormComponent } from '~/lib/components/Forms';

const Page = () => {
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

export default Page;
