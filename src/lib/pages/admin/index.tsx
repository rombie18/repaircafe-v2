'use client';

import {
  BellIcon,
  CheckIcon,
  CloseIcon,
  DownloadIcon,
  MinusIcon,
  QuestionIcon,
  SettingsIcon,
  SpinnerIcon,
  UnlockIcon,
} from '@chakra-ui/icons';
import { Badge, Box, Button, HStack, useToast } from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { FirebaseError } from 'firebase/app';
import { getDoc, onSnapshot } from 'firebase/firestore';
import { DateTime } from 'luxon';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import {
  DeleteButtonComponent,
  EditButtonComponent,
  SetCollectedActionButtonComponent,
  SetDepositedActionButtonComponent,
  SetFinishedActionButtonComponent,
  SetPendingActionButtonComponent,
  SetQueuedActionButtonComponent,
  SetReleasedActionButtonComponent,
} from '~/lib/components/Buttons';
import { ExpandableReparationTagComponent } from '~/lib/components/ReparationTag';
import type { ExtendedItem, Item } from '~/lib/models/item';
import type { ExtendedReparation } from '~/lib/models/reparation';
import type { ExtendedUser } from '~/lib/models/user';
import { typedDb } from '~/lib/utils/db';

import { DataTable } from './DataTable';

interface Document {
  item: Item;
  reparation: ExtendedReparation;
  user: ExtendedUser;
}

const columnHelper = createColumnHelper<Document>();

const columns = [
  columnHelper.accessor('reparation.state_reparation', {
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
  columnHelper.accessor('reparation.token', {
    id: 'token',
    cell: (info) => {
      return <Badge fontSize="1rem">{info.getValue()}</Badge>;
    },
    header: 'Volgnummer',
  }),
  columnHelper.accessor('item.name', {
    id: 'name',
    cell: (info) => {
      return info.getValue();
    },
    header: 'Toestel',
  }),
  columnHelper.accessor('user.name', {
    id: 'user',
    cell: (info) => {
      return info.getValue();
    },
    header: 'Eigenaar',
  }),
  columnHelper.accessor('reparation.events', {
    id: 'events',
    cell: (info) => {
      const event = info
        .getValue()
        .filter((item) => item.state_cycle === 'DEPOSITED')[0];
      if (event) {
        return DateTime.fromJSDate(event.timestamp.toDate())
          .setLocale('nl')
          .toFormat("d MMM',' H'u'mm");
      }
      return '';
    },
    header: 'Aangemeld',
  }),
  columnHelper.accessor('reparation.state_cycle', {
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
      const { reparation } = props.row.original;

      switch (reparation.state_cycle) {
        case 'REGISTERED':
          return (
            <HStack>
              <SetDepositedActionButtonComponent
                reparation={reparation}
                icon={<DownloadIcon />}
                colorScheme="gray"
                text="In ontvangst nemen"
              />
              <EditButtonComponent />
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );
        case 'DEPOSITED':
          return (
            <HStack>
              <SetQueuedActionButtonComponent
                reparation={reparation}
                icon={<SpinnerIcon />}
                colorScheme="red"
                text="In wachtrij zetten"
              />
              <EditButtonComponent />
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );
        case 'QUEUED':
          return (
            <HStack>
              <SetPendingActionButtonComponent
                reparation={reparation}
                icon={<SettingsIcon />}
                colorScheme="yellow"
                text="Reparatie starten"
              />
              <EditButtonComponent />
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );
        case 'PENDING':
          return (
            <HStack>
              <SetFinishedActionButtonComponent
                reparation={reparation}
                icon={<BellIcon />}
                colorScheme="green"
                text="Eigenaar oproepen"
              />
              <EditButtonComponent />
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );
        case 'FINISHED':
          return (
            <HStack>
              <SetCollectedActionButtonComponent
                reparation={reparation}
                icon={<CheckIcon />}
                colorScheme="green"
                text="Als opgehaald markeren"
              />
              <EditButtonComponent />
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );
        case 'COLLECTED':
          if (reparation.state_token === 'RESERVED') {
            return (
              <HStack>
                <SetReleasedActionButtonComponent
                  reparation={reparation}
                  icon={<UnlockIcon />}
                  colorScheme="gray"
                  text="Volgnummer vrijgeven"
                />
                <EditButtonComponent />
                <DeleteButtonComponent reparation={reparation} />
              </HStack>
            );
          }
          return (
            <HStack>
              <Button
                w="100%"
                colorScheme="gray"
                variant="solid"
                size="sm"
                isDisabled
              >
                Afgehandeld!
              </Button>
              <EditButtonComponent />
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );

        case 'UNKNOWN':
        default:
          return (
            <HStack>
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );
      }
    },
    header: 'Acties',
  }),
];

// TODO deduplicate firebase requests and enable caching
const Page = () => {
  const toast = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const getData = (setData: Dispatch<SetStateAction<Document[]>>) => {
      onSnapshot(
        typedDb.reparations,
        async (snapshot) => {
          const result: Document[] = [];

          await Promise.all(
            snapshot.docs.map(async (document) => {
              const reparation: ExtendedReparation = {
                id: document.id,
                ...document.data(),
              };

              const itemSnapshot = await getDoc(
                typedDb.item(reparation.item_id)
              );
              if (!itemSnapshot.exists()) {
                throw Error();
              }

              const item: ExtendedItem = {
                id: itemSnapshot.id,
                ...itemSnapshot.data(),
              };

              const userSnapshot = await getDoc(typedDb.user(item.user_id));
              if (!userSnapshot.exists()) {
                throw Error();
              }

              const user: ExtendedUser = {
                id: userSnapshot.id,
                name: `${userSnapshot.data().first_name} ${userSnapshot.data().last_name}`,
                ...userSnapshot.data(),
              };

              result.push({
                item,
                reparation,
                user,
              });
            })
          );

          setData(result);
        },
        (error) => {
          const code = error instanceof FirebaseError ? error.code : 'unknown';

          console.error(error);
          toast({
            title: `Oeps!`,
            description: `Er liep iets mis bij het ophalen van gegevens. (${code})`,
            status: 'error',
            isClosable: true,
            duration: 10000,
          });
        }
      );
    };
    getData(setDocuments);
  }, [toast]);

  return (
    <Box overflowX="auto">
      <DataTable columns={columns} data={documents} />
    </Box>
  );
};

export default Page;
