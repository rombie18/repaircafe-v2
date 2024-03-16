'use client';

import { CheckIcon, SettingsIcon } from '@chakra-ui/icons';
import { Box, useToast } from '@chakra-ui/react';
import { FirebaseError } from 'firebase/app';
import { onSnapshot } from 'firebase/firestore';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import {
  TokenGridComponent,
  TokenMarqueeComponent,
} from '~/lib/components/Tokens';
import type { ExtendedReparation } from '~/lib/models/reparation';
import { typedDb } from '~/lib/utils/db';
import { sortReparationsOnEvent } from '~/lib/utils/functions';

const Page = () => {
  const toast = useToast();
  const [reparations, setReparations] = useState<ExtendedReparation[]>([]);

  useEffect(() => {
    const getData = (
      setData: Dispatch<SetStateAction<ExtendedReparation[]>>
    ) => {
      onSnapshot(
        typedDb.reparations,
        (snapshot) => {
          const documents: ExtendedReparation[] = [];
          snapshot.forEach((document) => {
            if (!document.exists()) {
              throw Error();
            }

            const reparation: ExtendedReparation = {
              id: document.id,
              ...document.data(),
            };
            documents.push(reparation);
          });
          setData(documents);
        },
        (error) => {
          const code = error instanceof FirebaseError ? error.code : 'unknown';

          console.error(error);
          toast({
            title: `Oeps!`,
            description: `Er liep iets mis bij het updaten van een item. (${code})`,
            status: 'error',
            isClosable: true,
            duration: 10000,
          });
        }
      );
    };
    getData(setReparations);
  }, [toast]);

  return (
    <Box display="flex" flexDirection="column" h="100%">
      <Box flex="1" display="flex" gap={6}>
        <Box flex="1" py="4">
          <TokenGridComponent
            reparations={reparations
              .filter((reparation) => reparation.state_cycle === 'PENDING')
              .sort((a, b) => sortReparationsOnEvent(a, b, 'PENDING'))}
            heading="Reparatie bezig"
            icon={<SettingsIcon />}
            color="yellow.400"
          />
        </Box>

        <Box flex="1" py="4">
          <TokenGridComponent
            reparations={reparations
              .filter((reparation) => reparation.state_cycle === 'FINISHED')
              .sort((a, b) => sortReparationsOnEvent(a, b, 'FINISHED'))}
            heading="Reparatie voltooid"
            icon={<CheckIcon />}
            color="green.400"
          />
        </Box>
      </Box>

      <Box pt="4" paddingTop="0 auto">
        <TokenMarqueeComponent
          reparations={reparations
            .filter((reparation) => reparation.state_cycle === 'QUEUED')
            .sort((a, b) => sortReparationsOnEvent(a, b, 'QUEUED'))}
          heading="Wachtrij:"
          color="gray.400"
        />
      </Box>
    </Box>
  );
};

export default Page;
