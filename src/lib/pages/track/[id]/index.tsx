'use client';

import {
  CheckIcon,
  CloseIcon,
  MinusIcon,
  QuestionIcon,
} from '@chakra-ui/icons';
import {
  Box,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Tag,
  TagLabel,
  Text,
  Textarea,
  VStack,
  useSteps,
} from '@chakra-ui/react';

const steps = [
  {
    title: 'Registratie',
    description:
      'Je toestel is geregistreerd en kan worden binnengebracht tijdens het evenement.',
  },
  {
    title: 'Afgifte',
    description:
      'Het toestel is ontvangen en je kreeg een volgnummer toegewezen.',
  },
  {
    title: 'Wachtrij',
    description:
      'Er zijn momenteel geen student-techniekers vrij. Je reparatie start zodadelijk.',
  },
  {
    title: 'In reparatie',
    description:
      'Een student-technieker is bezig met de reparatie van je toestel.',
  },
  {
    title: 'Voltooid',
    description:
      'De reparatie is afgelopen. Je kan je toestel terug komen ophalen.',
  },
];

const Home = () => {
  const { activeStep } = useSteps({
    index: 1,
    count: steps.length,
  });

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
          <Stepper
            h="50dvh"
            w="100%"
            size="lg"
            orientation="vertical"
            index={activeStep}
          >
            {steps.map((step) => (
              <Step>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box flexShrink="0">
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>

          <FormControl>
            <FormLabel>Toestand herstelling</FormLabel>
            <HStack spacing={4} wrap="wrap">
              <Tag size="lg" colorScheme="green" borderRadius="full">
                <CheckIcon mr={2} />
                <TagLabel>Reparatie gelukt</TagLabel>
              </Tag>
              <Tag size="lg" colorScheme="yellow" borderRadius="full">
                <MinusIcon mr={2} />
                <TagLabel>Reparatie gedeeltelijk gelukt</TagLabel>
              </Tag>
              <Tag size="lg" colorScheme="red" borderRadius="full">
                <CloseIcon mr={2} />
                <TagLabel>Reparatie niet gelukt</TagLabel>
              </Tag>
              <Tag size="lg" colorScheme="gray" borderRadius="full">
                <QuestionIcon mr={2} />
                <TagLabel>Status onbekend</TagLabel>
              </Tag>
            </HStack>
          </FormControl>

          <FormControl>
            <FormLabel>Opmerkingen</FormLabel>
            <Textarea isDisabled />
            <FormHelperText>
              Als de technieker of een medewerker opmerkingen heeft
              achtergelaten, kan je deze in bovenstaand vak lezen.
            </FormHelperText>
          </FormControl>
        </VStack>
      </Flex>
    </>
  );
};

export default Home;
