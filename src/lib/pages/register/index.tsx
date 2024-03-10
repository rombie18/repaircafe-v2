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
  InputGroup,
  InputLeftAddon,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';

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
  return (
    <VStack w="100%" spacing={10} marginY={10}>
      <VStack w="100%" spacing={4}>
        <FormControl>
          <FormLabel>Voor- en achternaam</FormLabel>
          <HStack>
            <Input placeholder="Jan" />
            <Input placeholder="Peeters" />
          </HStack>
        </FormControl>

        <FormControl>
          <FormLabel>E-mailadres</FormLabel>
          <Input type="email" placeholder="jan.peeters@telenet.be" />
          <FormHelperText>
            Je zal op dit e-mailadres een melding ontvangen wanneer je toestel
            gerepareerd is.
          </FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Telefoonnummer</FormLabel>
          <InputGroup>
            <InputLeftAddon>+32</InputLeftAddon>
            <Input type="tel" placeholder="470 12 34 56" />
          </InputGroup>
          <FormHelperText>
            Moesten er zich toch problemen voordoen, bereiken we je via dit
            nummer.
          </FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Omschrijving toestel</FormLabel>
          <Input placeholder="Stofzuiger" />
        </FormControl>

        <FormControl>
          <FormLabel>Omschrijving probleem</FormLabel>
          <Textarea placeholder="Wanneer ik het toestel inschakel gebeurt er niets. Ik hoor een zoemend geluid." />
          <FormHelperText>
            Een goede omschrijving help onze techniekers om snel een goede
            oplossing te vinden.
          </FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Toestand toestel</FormLabel>
          <RadioGroup>
            <Stack direction="row">
              <Radio value="BROKEN">Defect</Radio>
              <Radio value="FAULTY">Niet goed werkend</Radio>
              <Radio value="OTHER">Anders</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
      </VStack>

      <Button w="100%">Registreren</Button>
    </VStack>
  );
}

export default Home;
