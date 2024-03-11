'use client';

import { CheckIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Center,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  VStack,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '~/lib/firebase/config';
import { Reparation } from '~/lib/models/reparation';

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

function TokenGridComponent({
  reparations,
  icon,
  color,
  heading,
}: {
  reparations: Reparation[];
  icon: JSX.Element;
  color: string;
  heading: string;
}) {
  const gridRef = useRef<HTMLInputElement>(null);
  const [scrollInterval, setScrollInterval] = useState<NodeJS.Timeout>();
  const [scrollActive, setScrollActive] = useState(true);

  useEffect(() => {
    const scrollGrid = () => {
      if (gridRef.current) {
        const isScrolledToTop = gridRef.current.scrollTop === 0;
        const isScrolledToBottom =
          gridRef.current.scrollHeight - gridRef.current.scrollTop ===
          gridRef.current.clientHeight;

        if (isScrolledToBottom) {
          setScrollActive(false);
          setTimeout(() => {
            setScrollActive(true);
            gridRef.current && (gridRef.current.scrollTop = 0);
          }, 3000);
        } else if (isScrolledToTop && scrollActive) {
          setScrollActive(false);
          setTimeout(() => {
            gridRef.current && (gridRef.current.scrollTop += 1);
            setScrollActive(true);
          }, 5000);
        } else if (scrollActive) {
          gridRef.current.scrollTop += 1;
        }
      }
    };

    const intervalId = setInterval(scrollGrid, 50);
    setScrollInterval(intervalId);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <Flex flexDirection="column" flex="1">
      <VStack mb={4}>
        {React.cloneElement(icon, { color: color, boxSize: 8 })}
        <Heading color={color}>{heading}</Heading>
      </VStack>
      <Box overflowY="auto" maxH="50vh" ref={gridRef}>
        <SimpleGrid minChildWidth="5rem" spacing={4}>
          {reparations.map((reparation) => (
            <TokenComponent
              key={reparation._id}
              reparation={reparation}
              color={color}
            />
          ))}
        </SimpleGrid>
      </Box>
    </Flex>
  );
}

function TokenMarqueeComponent({
  reparations,
  color,
  heading,
}: {
  reparations: Reparation[];
  color: string;
  heading: string;
}) {
  return (
    <HStack w="100%" spacing={6}>
      <Heading color={color}>{heading}</Heading>
      <Marquee>
        {reparations.map((reparation) => (
          <Box mx={1} key={reparation._id}>
            <TokenComponent reparation={reparation} color={color} />
          </Box>
        ))}
      </Marquee>
    </HStack>
  );
}

function TokenComponent({
  reparation,
  color,
}: {
  reparation: Reparation;
  color: string;
}) {
  return (
    <Box bg={color} p={3}>
      <Center>
        <Badge fontSize="2rem" colorScheme="black">
          {reparation.token}
        </Badge>
      </Center>
    </Box>
  );
}

export default Home;
