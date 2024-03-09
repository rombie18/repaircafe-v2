'use client';

import {
  CheckIcon,
  CloseIcon,
  MinusIcon,
  QuestionIcon,
  DeleteIcon,
  BellIcon,
  SettingsIcon,
  SpinnerIcon,
  DownloadIcon,
  ViewOffIcon,
  UnlockIcon,
} from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Collapse,
  HStack,
  IconButton,
  Tag,
  useDisclosure,
} from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { DateTime } from 'luxon';
import React from 'react';

const data: Reparation[] = [
  {
    _id: '0',
    events: [
      {
        state_cycle: 'REGISTERED',
        timestamp: new Date('2024-03-09T16:00:00'),
      },
    ],
    item_id: '',
    remarks: '',
    state_cycle: 'REGISTERED',
    state_reparation: 'UNKNOWN',
    state_token: 'RELEASED',
    token: '',
  },
  {
    _id: '1',
    events: [
      {
        state_cycle: 'REGISTERED',
        timestamp: new Date('2024-03-09T16:00:00'),
      },
      {
        state_cycle: 'DEPOSITED',
        timestamp: new Date('2024-03-09T16:10:00'),
      },
    ],
    item_id: '',
    remarks: '',
    state_cycle: 'DEPOSITED',
    state_reparation: 'UNKNOWN',
    state_token: 'RESERVED',
    token: 'A12',
  },
  {
    _id: '2',
    events: [
      {
        state_cycle: 'REGISTERED',
        timestamp: new Date('2024-03-09T16:00:00'),
      },
      {
        state_cycle: 'DEPOSITED',
        timestamp: new Date('2024-03-09T16:10:00'),
      },
      {
        state_cycle: 'QUEUED',
        timestamp: new Date('2024-03-09T16:20:00'),
      },
    ],
    item_id: '',
    remarks: '',
    state_cycle: 'QUEUED',
    state_reparation: 'UNKNOWN',
    state_token: 'RESERVED',
    token: 'A12',
  },
  {
    _id: '3',
    events: [
      {
        state_cycle: 'REGISTERED',
        timestamp: new Date('2024-03-09T16:00:00'),
      },
      {
        state_cycle: 'DEPOSITED',
        timestamp: new Date('2024-03-09T16:10:00'),
      },
      {
        state_cycle: 'QUEUED',
        timestamp: new Date('2024-03-09T16:20:00'),
      },
      {
        state_cycle: 'PENDING',
        timestamp: new Date('2024-03-09T16:30:00'),
      },
    ],
    item_id: '',
    remarks: '',
    state_cycle: 'PENDING',
    state_reparation: 'UNKNOWN',
    state_token: 'RESERVED',
    token: 'A12',
  },
  {
    _id: '4',
    events: [
      {
        state_cycle: 'REGISTERED',
        timestamp: new Date('2024-03-09T16:00:00'),
      },
      {
        state_cycle: 'DEPOSITED',
        timestamp: new Date('2024-03-09T16:10:00'),
      },
      {
        state_cycle: 'QUEUED',
        timestamp: new Date('2024-03-09T16:20:00'),
      },
      {
        state_cycle: 'PENDING',
        timestamp: new Date('2024-03-09T16:30:00'),
      },
      {
        state_cycle: 'FINISHED',
        timestamp: new Date('2024-03-09T16:40:00'),
      },
    ],
    item_id: '',
    remarks: '',
    state_cycle: 'FINISHED',
    state_reparation: 'PARTIAL',
    state_token: 'RESERVED',
    token: 'A12',
  },
  {
    _id: '5',
    events: [
      {
        state_cycle: 'REGISTERED',
        timestamp: new Date('2024-03-09T16:00:00'),
      },
      {
        state_cycle: 'DEPOSITED',
        timestamp: new Date('2024-03-09T16:10:00'),
      },
      {
        state_cycle: 'QUEUED',
        timestamp: new Date('2024-03-09T16:20:00'),
      },
      {
        state_cycle: 'PENDING',
        timestamp: new Date('2024-03-09T16:30:00'),
      },
      {
        state_cycle: 'FINISHED',
        timestamp: new Date('2024-03-09T16:40:00'),
      },
      {
        state_cycle: 'COLLECTED',
        timestamp: new Date('2024-03-09T16:50:00'),
      },
    ],
    item_id: '',
    remarks: '',
    state_cycle: 'COLLECTED',
    state_reparation: 'PARTIAL',
    state_token: 'RELEASED',
    token: 'A12',
  },
];

const columnHelper = createColumnHelper<Reparation>();

const columns = [
  columnHelper.accessor('_id', {
    id: '_id',
    cell: (info) => info.getValue(),
    header: 'ID',
  }),
  columnHelper.accessor('token', {
    id: 'token',
    cell: (info) => {
      return <Badge fontSize="1rem">{info.getValue()}</Badge>;
    },
    header: 'Volgnummer',
  }),
  columnHelper.accessor('events', {
    id: 'events',
    cell: (info) => {
      const event = info
        .getValue()
        .filter((event) => event.state_cycle === 'DEPOSITED')[0];
      if (event) {
        return DateTime.fromJSDate(event.timestamp).toFormat("H'u'mm");
      } else {
        return '';
      }
    },
    header: 'Aangemeld',
  }),
  columnHelper.accessor('state_cycle', {
    id: 'state_cycle',
    cell: (info) => {
      switch (info.getValue()) {
        case 'REGISTERED':
          return (
            <Badge variant="outline" colorScheme="gray">
              Geregistreerd
            </Badge>
          );
        case 'DEPOSITED':
          return (
            <Badge variant="outline" colorScheme="red">
              Aangemeld
            </Badge>
          );
        case 'QUEUED':
          return (
            <Badge variant="outline" colorScheme="yellow">
              In wachtrij
            </Badge>
          );
        case 'PENDING':
          return (
            <Badge variant="outline" colorScheme="yellow">
              In reparatie
            </Badge>
          );
        case 'FINISHED':
          return (
            <Badge variant="outline" colorScheme="green">
              Reparatie voltooid
            </Badge>
          );
        case 'COLLECTED':
          return (
            <Badge variant="outline" colorScheme="gray">
              Item opgehaald
            </Badge>
          );
        case 'UNKNOWN':
        default:
          return (
            <Badge variant="outline" colorScheme="gray">
              Status onbekend
            </Badge>
          );
      }
    },
    header: 'Itemstatus',
  }),
  columnHelper.accessor('state_reparation', {
    id: 'state_reparation',
    cell: (info) => {
      switch (info.getValue()) {
        case 'SUCCESS':
          return (
            <ExpandableTag
              colorScheme="green"
              icon={<CheckIcon />}
              text="Reparatie gelukt"
            />
          );
        case 'PARTIAL':
          return (
            <ExpandableTag
              colorScheme="yellow"
              icon={<MinusIcon />}
              text="Reparatie gedeeltelijk gelukt"
            />
          );
        case 'FAIL':
          return (
            <ExpandableTag
              colorScheme="red"
              icon={<CloseIcon />}
              text="Reparatie mislukt"
            />
          );
        case 'UNKNOWN':
        default:
          return (
            <ExpandableTag
              colorScheme="gray"
              icon={<QuestionIcon />}
              text="Status onbekend"
            />
          );
      }
    },
    header: 'Gerepareerd?',
  }),
  columnHelper.display({
    id: 'actions',
    cell: (props) => {
      const state_cycle: string = props.row.getValue('state_cycle');
      const _id: string = props.row.getValue('_id');

      switch (state_cycle) {
        case 'REGISTERED':
          return (
            <HStack>
              <Button
                leftIcon={<DownloadIcon />}
                colorScheme="gray"
                variant="solid"
                size="sm"
              >
                In ontvangst nemen
              </Button>
              <IconButton
                isRound={true}
                variant="outline"
                colorScheme="red"
                size="sm"
                aria-label="Reparatie verwijderen"
                icon={<DeleteIcon />}
              />
            </HStack>
          );
        case 'DEPOSITED':
          return (
            <HStack>
              <Button
                leftIcon={<SpinnerIcon />}
                colorScheme="yellow"
                variant="solid"
                size="sm"
              >
                In wachtrij zetten
              </Button>
              <IconButton
                isRound={true}
                variant="outline"
                colorScheme="red"
                size="sm"
                aria-label="Reparatie verwijderen"
                icon={<DeleteIcon />}
              />
            </HStack>
          );
        case 'QUEUED':
          return (
            <HStack>
              <Button
                leftIcon={<SettingsIcon />}
                colorScheme="yellow"
                variant="solid"
                size="sm"
              >
                Reparatie starten
              </Button>
              <IconButton
                isRound={true}
                variant="outline"
                colorScheme="red"
                size="sm"
                aria-label="Reparatie verwijderen"
                icon={<DeleteIcon />}
              />
            </HStack>
          );
        case 'PENDING':
          return (
            <HStack>
              <Button
                leftIcon={<BellIcon />}
                colorScheme="green"
                variant="solid"
                size="sm"
              >
                Eigenaar oproepen
              </Button>
              <IconButton
                isRound={true}
                variant="outline"
                colorScheme="red"
                size="sm"
                aria-label="Reparatie verwijderen"
                icon={<DeleteIcon />}
              />
            </HStack>
          );
        case 'FINISHED':
          return (
            <HStack>
              <Button
                leftIcon={<CheckIcon />}
                colorScheme="green"
                variant="solid"
                size="sm"
              >
                Als opgehaald markeren
              </Button>
              <IconButton
                isRound={true}
                variant="outline"
                colorScheme="red"
                size="sm"
                aria-label="Reparatie verwijderen"
                icon={<DeleteIcon />}
              />
            </HStack>
          );
        case 'COLLECTED':
          return (
            <HStack>
              <Button
                leftIcon={<UnlockIcon />}
                colorScheme="gray"
                variant="solid"
                size="sm"
              >
                Volgnummer vrijgeven
              </Button>
              <IconButton
                isRound={true}
                variant="outline"
                colorScheme="red"
                size="sm"
                aria-label="Reparatie verwijderen"
                icon={<DeleteIcon />}
              />
            </HStack>
          );
        case 'UNKNOWN':
        default:
          return (
            <HStack>
              <IconButton
                isRound={true}
                variant="outline"
                colorScheme="red"
                size="sm"
                aria-label="Reparatie verwijderen"
                icon={<DeleteIcon />}
              />
            </HStack>
          );
      }
    },
    header: 'Acties',
  }),
];

const Home = () => {
  return (
    <Box overflowX={'auto'}>
      <DataTable columns={columns} data={data} />
    </Box>
  );
};

function ExpandableTag({
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

export default Home;
