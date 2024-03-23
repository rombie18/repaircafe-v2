import { Flex, Heading, Text, VStack } from '@chakra-ui/react';

import { RegistrationFormComponent } from '~/lib/components/Forms';

const Page = () => {
  return (
    <>
      <VStack paddingY={6} align="start">
        <Heading>Registreer je toestel</Heading>
        <Text>
          Heb je een stuk of niet goed werkend toestel en wil je dit graag laten
          repareren door een gemotiveerd team van studenten en docenten?
          Registreer hier je toestel en breng het naar ons herstelpunt op
          <b> 27 maart </b>in de <b>Agora van Thomas More campus Geel</b>.
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

export default Page;
