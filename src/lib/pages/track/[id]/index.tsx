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
import { REPARATIONS } from '~/lib/firebase/sample_data';

const Home = () => {
  const reparation = REPARATIONS[2];

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
            <ReparationTagComponent reparation={reparation} />
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
};

function ReparationStepsComponent({ reparation }: { reparation: Reparation }) {
  const steps = [
    {
      state_cycle: 'REGISTERED',
      title: 'Registratie',
      description:
        'Je toestel is geregistreerd en kan worden binnengebracht tijdens het evenement.',
    },
    {
      state_cycle: 'DEPOSITED',
      title: 'Afgifte',
      description:
        'Het toestel is ontvangen en je kreeg een volgnummer toegewezen.',
    },
    {
      state_cycle: 'QUEUED',
      title: 'Wachtrij',
      description:
        'Er zijn momenteel geen student-techniekers vrij. Je reparatie start zodadelijk.',
    },
    {
      state_cycle: 'PENDING',
      title: 'In reparatie',
      description:
        'Een student-technieker is bezig met de reparatie van je toestel.',
    },
    {
      state_cycle: 'FINISHED',
      title: 'Voltooid',
      description:
        'De reparatie is afgelopen. Je kan je toestel terug komen ophalen.',
    },
    {
      state_cycle: 'COLLECTED',
      title: 'Opgehaald',
      description: 'Je hebt je toestel terug opgehaald. Tot volgend jaar!',
    },
  ];

  const { activeStep } = useSteps({
    index: steps.findIndex(
      (step) => step.state_cycle === reparation.state_cycle
    ),
    count: steps.length,
  });

  return (
    <Stepper
      h="75dvh"
      w="100%"
      size="lg"
      orientation="vertical"
      index={activeStep}
    >
      {steps.map((step, index) => (
        <Step key={index}>
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
  );
}

function ReparationTagComponent({ reparation }: { reparation: Reparation }) {
  switch (reparation.state_reparation) {
    case 'SUCCESS':
      return (
        <Tag size="lg" colorScheme="green" borderRadius="full">
          <CheckIcon mr={2} />
          <TagLabel>Reparatie gelukt</TagLabel>
        </Tag>
      );
    case 'PARTIAL':
      return (
        <Tag size="lg" colorScheme="yellow" borderRadius="full">
          <MinusIcon mr={2} />
          <TagLabel>Reparatie gedeeltelijk gelukt</TagLabel>
        </Tag>
      );
    case 'FAIL':
      return (
        <Tag size="lg" colorScheme="red" borderRadius="full">
          <CloseIcon mr={2} />
          <TagLabel>Reparatie niet gelukt</TagLabel>
        </Tag>
      );
    case 'UNKNOWN':
    default:
      return (
        <Tag size="lg" colorScheme="gray" borderRadius="full">
          <QuestionIcon mr={2} />
          <TagLabel>Status onbekend</TagLabel>
        </Tag>
      );
  }
}

export default Home;
