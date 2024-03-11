'use client';

import { CheckIcon, SettingsIcon } from '@chakra-ui/icons';
import { Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '~/lib/firebase/config';
import { Reparation } from '~/lib/models/reparation';
import {
  TokenGridComponent,
  TokenMarqueeComponent,
} from '~/lib/components/Tokens';

const Home = () => {
  const [reparations, setReparations] = useState<Reparation[]>([]);

  const getReparations = (setReparations: any) => {
    try {
      const unsub = onSnapshot(collection(db, 'reparations'), (doc) => {
        const documents: Reparation[] = [];
        doc.forEach((document: any) => {
          documents.push({ _id: document.id, ...document.data() });
        });
        setReparations(documents);
      });
    } catch (err) {
      console.error(err);
      setReparations([]);
    }
  };

  useEffect(() => getReparations(setReparations), []);

  return (
    <Box display="flex" flexDirection="column">
      <Box flex="1" display="flex" gap={6}>
        <Box flex="1" py="4">
          <TokenGridComponent
            reparations={reparations.filter(
              (reparation) => reparation.state_cycle === 'PENDING'
            )}
            heading="Reparatie bezig"
            icon={<SettingsIcon />}
            color="yellow.400"
          />
        </Box>

        <Box flex="1" py="4">
          <TokenGridComponent
            reparations={reparations.filter(
              (reparation) => reparation.state_cycle === 'FINISHED'
            )}
            heading="Reparatie voltooid"
            icon={<CheckIcon />}
            color="green.400"
          />
        </Box>
      </Box>

      <Box pt="4">
        <TokenMarqueeComponent
          reparations={reparations.filter(
            (reparation) => reparation.state_cycle === 'QUEUED'
          )}
          heading="Wachtrij:"
          color="gray.400"
        />
      </Box>
    </Box>
  );
};

export default Home;
