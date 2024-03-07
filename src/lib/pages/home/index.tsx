'use client';

import { ArrowForwardIcon } from '@chakra-ui/icons';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Flex,
  Heading,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';

function OnboardingCard({
  heading,
  text,
  button_text,
  href,
}: {
  heading: string;
  text: string;
  button_text: string;
  href: string;
}) {
  return (
    <LinkBox
      rounded="md"
      flex="0 0 50%"
      _hover={{ border: '1px', borderColor: 'gray.600' }}
    >
      <Card>
        <CardBody>
          <Heading size="md">{heading}</Heading>
          <Text>{text}</Text>
        </CardBody>
        <CardFooter>
          <LinkOverlay href={href}>
            <Button>
              {button_text}
              <ArrowForwardIcon ml={2} />
            </Button>
          </LinkOverlay>
        </CardFooter>
      </Card>
    </LinkBox>
  );
}

const Home = () => {
  return (
    <>
      <VStack paddingY={6} align="start">
        <Heading>Repair Café</Heading>
        <Text>
          Welkom bij het Repair Café, georganiseerd door Thomas More Geel en KU
          Leuven. Ten voordele van het goede doel X organiseren we een
          &quot;reparatiedag&quot; waarbij we uw stuk of niet goed werkend
          toestel proberen te herstellen. Een team van vrijwillig geëngageerde
          studenten en docenten zal uw toestel onder handen nemen en proberen te
          repareren.
        </Text>
      </VStack>

      <Flex
        direction="row"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={4}
        mb={8}
      >
        <OnboardingCard
          heading="Toestel stuk?"
          text="Heb je een toestel dan stuk is of niet meer naar behoren werk?
                Registreer je toestel en laat een gemotiveerd team van studenten
                en docenten je toestel onder handen nemen."
          button_text="Toestel registreren"
          href="register"
        />
        <OnboardingCard
          heading="Al geregistreerd?"
          text="Als je je toestel reeds hebt geregistreerd, dan kan je in
          real-time de reparatie opvolgen. Blijf op de hoogte wanneer we
          starten met jouw toestel en wanneer de reparatie klaar is."
          button_text="Reparatie volgen"
          href="track"
        />
      </Flex>
    </>
  );
};

export default Home;
