'use client';

import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Input,
  PinInput,
  PinInputField,
  Text,
  VStack,
} from '@chakra-ui/react';

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
        <VStack w="100%" spacing={10} marginY={10}>
          <VStack w="100%" spacing={4}>
            <FormControl>
              <FormLabel>E-mailadres</FormLabel>
              <Input type="email" placeholder="jan.peeters@telenet.be" />
              <FormHelperText>
                Het e-mailadres dat je bij de registratie opgaf.
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Volgnummer</FormLabel>
              <HStack>
                <PinInput type="alphanumeric">
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                </PinInput>
              </HStack>
              <FormHelperText>
                De volgnummer die je bij afgifte ontving.
              </FormHelperText>
            </FormControl>
          </VStack>

          <Button w="100%">Zoeken</Button>
        </VStack>
      </Flex>
    </>
  );
};

export default Home;
