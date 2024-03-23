import {
  CheckIcon,
  CloseIcon,
  MinusIcon,
  QuestionIcon,
} from '@chakra-ui/icons';
import type { RadioProps } from '@chakra-ui/react';
import {
  Box,
  Collapse,
  HStack,
  Tag,
  TagLabel,
  chakra,
  useDisclosure,
  useRadio,
} from '@chakra-ui/react';

import type {
  CombinedReparation,
  ExtendedCombinedReparation,
} from '../utils/models';

function ExpandableReparationTagComponent({
  colorScheme,
  icon,
  text,
}: {
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <HStack>
      <Tag
        onMouseEnter={onToggle}
        onMouseLeave={onToggle}
        colorScheme={colorScheme}
        borderRadius="full"
      >
        {icon}
        <Collapse in={isOpen} animateOpacity>
          <Box ml={2}>{text}</Box>
        </Collapse>
      </Tag>
    </HStack>
  );
}

function ReparationTagComponent({
  text,
  colorScheme,
  icon,
}: {
  text: string;
  colorScheme: string;
  icon: JSX.Element;
}) {
  return (
    <Tag size="lg" colorScheme={colorScheme} borderRadius="full">
      {icon}
      <TagLabel ml={2}>{text}</TagLabel>
    </Tag>
  );
}

function AutoReparationTagComponent({
  reparation,
}: {
  reparation: CombinedReparation | ExtendedCombinedReparation;
}) {
  switch (reparation.reparation_state_reparation) {
    case 'SUCCESS':
      return (
        <ReparationTagComponent
          text="Reparatie gelukt"
          colorScheme="green"
          icon={<CheckIcon />}
        />
      );
    case 'PARTIAL':
      return (
        <ReparationTagComponent
          text="Reparatie gedeeltelijk gelukt"
          colorScheme="yellow"
          icon={<MinusIcon />}
        />
      );
    case 'FAIL':
      return (
        <ReparationTagComponent
          text="Reparatie niet gelukt"
          colorScheme="red"
          icon={<CloseIcon />}
        />
      );
    case 'UNKNOWN':
    default:
      return (
        <ReparationTagComponent
          text="Status onbekend"
          colorScheme="gray"
          icon={<QuestionIcon />}
        />
      );
  }
}

function RadioReparationTagComponent(
  props: { text: string; colorScheme: string; icon: JSX.Element } & RadioProps
) {
  const { text, colorScheme, icon, ...radioProps } = props;
  const { state, getInputProps, getRadioProps, htmlProps, getLabelProps } =
    useRadio(radioProps);

  return (
    <chakra.label {...htmlProps} cursor="pointer">
      <input {...getInputProps({})} hidden />
      <Box
        {...getRadioProps()}
        shadow={
          state.isChecked ? '0 0 5px 0px var(--chakra-colors-gray-500)' : 'none'
        }
        borderWidth={state.isChecked ? '1px' : 'none'}
        borderColor="white"
        rounded="full"
      >
        <ReparationTagComponent
          text={text}
          colorScheme={colorScheme}
          icon={icon}
          {...getLabelProps()}
        />
      </Box>
    </chakra.label>
  );
}

export {
  AutoReparationTagComponent,
  ExpandableReparationTagComponent,
  RadioReparationTagComponent,
  ReparationTagComponent,
};
