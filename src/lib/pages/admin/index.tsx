import {
  CheckIcon,
  MinusIcon,
  CloseIcon,
  QuestionIcon,
  DownloadIcon,
  SpinnerIcon,
  SettingsIcon,
  BellIcon,
  UnlockIcon,
} from '@chakra-ui/icons';
import { Badge, Box, Button, HStack, VStack, useToast } from '@chakra-ui/react';
import type { SortingState } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { FirebaseError } from 'firebase/app';
import { onSnapshot } from 'firebase/firestore';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import {
  SetDepositedActionButtonComponent,
  DeleteButtonComponent,
  SetQueuedActionButtonComponent,
  SetPendingActionButtonComponent,
  SetFinishedActionButtonComponent,
  SetCollectedActionButtonComponent,
  SetReleasedActionButtonComponent,
  InfoButtonComponent,
} from '~/lib/components/Buttons';
import DebouncedInputComponent from '~/lib/components/DebouncedInput';
import { ExpandableReparationTagComponent } from '~/lib/components/ReparationTag';
import { typedDb } from '~/lib/utils/db';
import type { ExtendedCombinedReparation } from '~/lib/utils/models';

import { DataTable } from './DataTable';

const initialSortingState = [
  {
    id: 'deposited_timestamp',
    desc: false,
  },
];

const columnHelper = createColumnHelper<ExtendedCombinedReparation>();

const columns = [
  columnHelper.accessor('reparation_state_reparation', {
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
  columnHelper.accessor('reparation_token', {
    id: 'token',
    cell: (info) => {
      return <Badge fontSize="1rem">{info.getValue()}</Badge>;
    },
    header: 'Volgnummer',
  }),
  columnHelper.accessor('item_name', {
    id: 'name',
    cell: (info) => {
      return info.getValue();
    },
    header: 'Toestel',
  }),
  columnHelper.accessor('user_full_name', {
    id: 'user',
    cell: (info) => {
      return info.getValue();
    },
    header: 'Eigenaar',
  }),
  columnHelper.accessor('reparation_events', {
    id: 'deposited_timestamp',
    sortingFn: (rowA, rowB) => {
      const eventA = rowA.original.reparation_events.filter(
        (item) => item.state_cycle === 'DEPOSITED'
      )[0];
      const eventB = rowB.original.reparation_events.filter(
        (item) => item.state_cycle === 'DEPOSITED'
      )[0];

      if (!eventA || !eventB) {
        return 1;
      }
      if (
        rowA.original.reparation_state_token === 'RELEASED' &&
        rowA.original.reparation_state_cycle === 'COLLECTED'
      ) {
        return 1;
      }
      if (
        rowB.original.reparation_state_token === 'RELEASED' &&
        rowB.original.reparation_state_cycle === 'COLLECTED'
      ) {
        return 1;
      }
      if (eventA.timestamp.toMillis() - eventB.timestamp.toMillis() > 0) {
        return 1;
      }
      if (eventA.timestamp.toMillis() - eventB.timestamp.toMillis() < 0) {
        return -1;
      }
      return 0;
    },
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
  columnHelper.accessor('reparation_state_cycle', {
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
      const combinedReparation: ExtendedCombinedReparation = props.row.original;

      switch (combinedReparation.reparation_state_cycle) {
        case 'REGISTERED':
          return (
            <HStack>
              <SetDepositedActionButtonComponent
                combinedReparation={combinedReparation}
                icon={<DownloadIcon />}
                colorScheme="gray"
                text="In ontvangst nemen"
              />
              <InfoButtonComponent combinedReparation={combinedReparation} />
              <DeleteButtonComponent combinedReparation={combinedReparation} />
            </HStack>
          );
        case 'DEPOSITED':
          return (
            <HStack>
              <SetQueuedActionButtonComponent
                combinedReparation={combinedReparation}
                icon={<SpinnerIcon />}
                colorScheme="red"
                text="In wachtrij zetten"
              />
              <InfoButtonComponent combinedReparation={combinedReparation} />
              <DeleteButtonComponent combinedReparation={combinedReparation} />
            </HStack>
          );
        case 'QUEUED':
          return (
            <HStack>
              <SetPendingActionButtonComponent
                combinedReparation={combinedReparation}
                icon={<SettingsIcon />}
                colorScheme="yellow"
                text="Reparatie starten"
              />
              <InfoButtonComponent combinedReparation={combinedReparation} />
              <DeleteButtonComponent combinedReparation={combinedReparation} />
            </HStack>
          );
        case 'PENDING':
          return (
            <HStack>
              <SetFinishedActionButtonComponent
                combinedReparation={combinedReparation}
                icon={<BellIcon />}
                colorScheme="green"
                text="Eigenaar oproepen"
              />
              <InfoButtonComponent combinedReparation={combinedReparation} />
              <DeleteButtonComponent combinedReparation={combinedReparation} />
            </HStack>
          );
        case 'FINISHED':
          return (
            <HStack>
              <SetCollectedActionButtonComponent
                combinedReparation={combinedReparation}
                icon={<CheckIcon />}
                colorScheme="green"
                text="Als opgehaald markeren"
              />
              <InfoButtonComponent combinedReparation={combinedReparation} />
              <DeleteButtonComponent combinedReparation={combinedReparation} />
            </HStack>
          );
        case 'COLLECTED':
          if (combinedReparation.reparation_state_token === 'RESERVED') {
            return (
              <HStack>
                <SetReleasedActionButtonComponent
                  combinedReparation={combinedReparation}
                  icon={<UnlockIcon />}
                  colorScheme="gray"
                  text="Volgnummer vrijgeven"
                />
                <InfoButtonComponent combinedReparation={combinedReparation} />
                <DeleteButtonComponent
                  combinedReparation={combinedReparation}
                />
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
              <InfoButtonComponent combinedReparation={combinedReparation} />
              <DeleteButtonComponent combinedReparation={combinedReparation} />
            </HStack>
          );

        case 'UNKNOWN':
        default:
          return (
            <HStack>
              <InfoButtonComponent combinedReparation={combinedReparation} />
              <DeleteButtonComponent combinedReparation={combinedReparation} />
            </HStack>
          );
      }
    },
    header: 'Acties',
  }),
];

const Page = () => {
  const toast = useToast();
  const [documents, setDocuments] = useState<ExtendedCombinedReparation[]>([]);

  useEffect(() => {
    const getData = (
      setData: Dispatch<SetStateAction<ExtendedCombinedReparation[]>>
    ) => {
      onSnapshot(
        typedDb.combinedReparations,
        async (snapshot) => {
          const result: ExtendedCombinedReparation[] = [];

          snapshot.docs.map(async (document) => {
            const reparation: ExtendedCombinedReparation = {
              id: document.id,
              user_full_name: `${document.data().user_first_name} ${document.data().user_last_name}`,
              ...document.data(),
            };
            result.push(reparation);
          });

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

  const { push } = useRouter();
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>(initialSortingState);

  return (
    <VStack spacing={6}>
      <HStack w="100%">
        <Box minWidth="65%" flex={1}>
          <DebouncedInputComponent
            placeholder="Typ om te zoeken..."
            value={globalFilter ?? ''}
            onChange={(value) => setGlobalFilter(String(value))}
          />
        </Box>
        <Box overflowX="auto" style={{ textWrap: 'nowrap' }}>
          <Button mr={1} onClick={() => push(`/register`)}>
            Item registreren
          </Button>
          <Button onClick={() => push(`/kiosk`)}>Kiosk openen</Button>
        </Box>
      </HStack>
      <Box width="100%" overflowX="auto">
        <DataTable
          columns={columns}
          data={documents}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          sorting={sorting}
          setSorting={setSorting}
        />
      </Box>
    </VStack>
  );
};

export default Page;
