'use client';

import {
  CheckIcon,
  CloseIcon,
  MinusIcon,
  QuestionIcon,
  BellIcon,
  SettingsIcon,
  SpinnerIcon,
  DownloadIcon,
  UnlockIcon,
} from '@chakra-ui/icons';
import { Badge, Box, Button, HStack, useToast } from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { onSnapshot, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '~/lib/firebase/config';
import { Reparation } from '~/lib/models/reparation';
import { FirebaseError } from 'firebase/app';
import {
  SetDepositedActionButtonComponent,
  SetQueuedActionButtonComponent,
  SetPendingActionButtonComponent,
  SetFinishedActionButtonComponent,
  SetCollectedActionButtonComponent,
  DeleteButtonComponent,
  EditButtonComponent,
  SetReleasedActionButtonComponent,
} from '~/lib/components/Buttons';
import { ExpandableReparationTagComponent } from '~/lib/components/ReparationTag';

const columnHelper = createColumnHelper<{
  item: Item;
  reparation: Reparation;
  user: User;
}>();

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
        .filter((event) => event.state_cycle === 'DEPOSITED')[0];
      if (event) {
        return DateTime.fromJSDate(event.timestamp.toDate())
          .setLocale('nl')
          .toFormat("d MMM',' H'u'mm");
      } else {
        return '';
      }
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
      const reparation: Reparation = props.row.original.reparation;

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
          } else {
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
          }
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

//TODO deduplicate firebase requests and enable caching
const Home = () => {
  const toast = useToast();
  const [data, setData] = useState<
    { item: Item; reparation: Reparation; user: User }[]
  >([]);

  const getData = (setData: any) => {
    onSnapshot(
      collection(db, 'reparations'),
      async (docs) => {
        const documents: { item: Item; reparation: Reparation; user: User }[] =
          [];

        await Promise.all(
          docs.docs.map(async (document: any) => {
            const reparation: Reparation = {
              _id: document.id,
              ...document.data(),
            };
            const itemSnapshot = await getDoc(
              doc(db, 'items', reparation.item_id)
            );
            const itemData: any = itemSnapshot.data();
            const item: Item = { _id: itemSnapshot.id, ...itemData };
            const userSnapshot = await getDoc(doc(db, 'users', item.user_id));
            const userData: any = userSnapshot.data();
            const user: User = {
              _id: userSnapshot.id,
              ...userData,
              name: `${userData.first_name} ${userData.last_name}`,
            };

            documents.push({
              item: item,
              reparation: reparation,
              user: user,
            });
          })
        );

        setData(documents);
      },
      (error) => {
        let code = 'unknown';
        error instanceof FirebaseError && (code = error.code);

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

  useEffect(() => getData(setData), []);

  return (
    <Box overflowX={'auto'}>
      <DataTable columns={columns} data={data} />
    </Box>
  );
};

export default Home;
