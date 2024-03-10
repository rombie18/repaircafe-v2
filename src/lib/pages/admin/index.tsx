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
  UnlockIcon,
  WarningTwoIcon,
  EditIcon,
} from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
import NextLink from 'next/link';
import { REPARATIONS } from '~/lib/firebase/sample_data';

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
            <Badge variant="outline" colorScheme="red">
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
  columnHelper.display({
    id: 'actions',
    cell: (props) => {
      const state_cycle: string = props.row.getValue('state_cycle');
      // const id: string = props.row.getValue('_id');

      switch (state_cycle) {
        case 'REGISTERED':
          return (
            <HStack>
              <ActionButtonComponent
                icon={<DownloadIcon />}
                colorScheme="gray"
                text="In ontvangst nemen"
              />
              <EditButtonComponent />
              <DeleteButtonComponent />
            </HStack>
          );
        case 'DEPOSITED':
          return (
            <HStack>
              <ActionButtonComponent
                icon={<SpinnerIcon />}
                colorScheme="red"
                text="In wachtrij zetten"
              />
              <EditButtonComponent />
              <DeleteButtonComponent />
            </HStack>
          );
        case 'QUEUED':
          return (
            <HStack>
              <ActionButtonComponent
                icon={<SettingsIcon />}
                colorScheme="yellow"
                text="Reparatie starten"
              />
              <EditButtonComponent />
              <DeleteButtonComponent />
            </HStack>
          );
        case 'PENDING':
          return (
            <HStack>
              <ActionButtonComponent
                icon={<BellIcon />}
                colorScheme="green"
                text="Eigenaar oproepen"
              />
              <EditButtonComponent />
              <DeleteButtonComponent />
            </HStack>
          );
        case 'FINISHED':
          return (
            <HStack>
              <ActionButtonComponent
                icon={<CheckIcon />}
                colorScheme="green"
                text="Als opgehaald markeren"
              />
              <EditButtonComponent />
              <DeleteButtonComponent />
            </HStack>
          );
        case 'COLLECTED':
          return (
            <HStack>
              <ActionButtonComponent
                icon={<UnlockIcon />}
                colorScheme="gray"
                text="Volgnummer vrijgeven"
              />
              <EditButtonComponent />
              <DeleteButtonComponent />
            </HStack>
          );
        case 'UNKNOWN':
        default:
          return (
            <HStack>
              <DeleteButtonComponent />
            </HStack>
          );
      }
    },
    header: 'Acties',
  }),
  columnHelper.accessor('state_reparation', {
    id: 'state_reparation',
    cell: (info) => {
      switch (info.getValue()) {
        case 'SUCCESS':
          return (
            <ExpandableReparationTagComponent
              colorScheme="green"
              icon={<CheckIcon />}
              text="Reparatie gelukt"
            />
          );
        case 'PARTIAL':
          return (
            <ExpandableReparationTagComponent
              colorScheme="yellow"
              icon={<MinusIcon />}
              text="Reparatie gedeeltelijk gelukt"
            />
          );
        case 'FAIL':
          return (
            <ExpandableReparationTagComponent
              colorScheme="red"
              icon={<CloseIcon />}
              text="Reparatie mislukt"
            />
          );
        case 'UNKNOWN':
        default:
          return (
            <ExpandableReparationTagComponent
              colorScheme="gray"
              icon={<QuestionIcon />}
              text="Status onbekend"
            />
          );
      }
    },
    header: '',
  }),
];

const Home = () => {
  return (
    <Box overflowX={'auto'}>
      <DataTable columns={columns} data={REPARATIONS} />
    </Box>
  );
};

function ActionButtonComponent({
  colorScheme,
  icon,
  text,
}: {
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  return (
    <Button
      w="100%"
      leftIcon={icon}
      colorScheme={colorScheme}
      variant="solid"
      size="sm"
    >
      {text}
    </Button>
  );
}

function EditButtonComponent() {
  return (
    <NextLink href="/admin/reparation" passHref>
      <IconButton
        as="a"
        isRound
        variant="outline"
        colorScheme="yellow"
        size="sm"
        aria-label="Reparatie wijzigen"
        icon={<EditIcon />}
      />
    </NextLink>
  );
}

function DeleteButtonComponent() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  return (
    <>
      <IconButton
        onClick={onOpen}
        isRound
        variant="outline"
        colorScheme="red"
        size="sm"
        aria-label="Reparatie verwijderen"
        icon={<DeleteIcon />}
      />

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Reparatie verwijderen
            </AlertDialogHeader>

            <AlertDialogBody>
              Opgelet! Verwijder enkel een reparatie als deze foutief werd
              toegevoegd. Als u doorgaat wordt het item permanent verwijderd en
              is het alsof het nooit heeft bestaan.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Annuleren
              </Button>
              <Button
                leftIcon={<WarningTwoIcon />}
                colorScheme="red"
                onClick={() => console.error('Not implemented.')}
                ml={3}
              >
                Permanent verwijderen
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

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

export default Home;
