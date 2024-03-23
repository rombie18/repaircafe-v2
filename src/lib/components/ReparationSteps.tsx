import {
  Box,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Text,
} from '@chakra-ui/react';
import { useEffect, useMemo } from 'react';

import type {
  CombinedReparation,
  ExtendedCombinedReparation,
} from '../utils/models';

export default function ReparationStepsComponent({
  reparation,
}: {
  reparation: CombinedReparation | ExtendedCombinedReparation;
}) {
  const steps = useMemo(
    () => [
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
    ],
    []
  );

  const { activeStep, setActiveStep } = useSteps({
    count: steps.length,
  });

  useEffect(() => {
    const newIndex = steps.findIndex(
      (step) => step.state_cycle === reparation.reparation_state_cycle
    );
    setActiveStep(newIndex);
  }, [reparation, steps, setActiveStep]);

  return (
    <Stepper
      h="75dvh"
      w="100%"
      size="lg"
      orientation="vertical"
      index={activeStep}
    >
      {steps.map((step) => (
        <Step key={step.state_cycle}>
          <StepIndicator>
            <StepStatus
              complete={<StepIcon />}
              incomplete={<StepNumber />}
              active={<StepNumber />}
            />
          </StepIndicator>

          <Box>
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>
              <Text overflowWrap="break-word">{step.description}</Text>
            </StepDescription>
          </Box>

          <StepSeparator />
        </Step>
      ))}
    </Stepper>
  );
}
