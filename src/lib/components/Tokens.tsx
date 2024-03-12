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
import { cloneElement, useEffect, useRef, useState } from 'react';
import Marquee from 'react-fast-marquee';

import type { ExtendedReparation, Reparation } from '../models/reparation';

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

function TokenGridComponent({
  reparations,
  icon,
  color,
  heading,
}: {
  reparations: ExtendedReparation[];
  icon: JSX.Element;
  color: string;
  heading: string;
}) {
  const gridRef = useRef<HTMLInputElement>(null);
  const [, setScrollInterval] = useState<NodeJS.Timeout>();
  const [scrollActive, setScrollActive] = useState(true);

  useEffect(() => {
    const scrollGrid = () => {
      if (!gridRef.current) {
        return;
      }
      const isScrolledToTop = gridRef.current.scrollTop === 0;
      const isScrolledToBottom =
        gridRef.current.scrollHeight - gridRef.current.scrollTop ===
        gridRef.current.clientHeight;

      if (isScrolledToBottom) {
        setScrollActive(false);
        setTimeout(() => {
          setScrollActive(true);
          if (gridRef.current) {
            gridRef.current.scrollTop = 0;
          }
        }, 3000);
      } else if (isScrolledToTop && scrollActive) {
        setScrollActive(false);
        setTimeout(() => {
          if (gridRef.current) {
            gridRef.current.scrollTop += 1;
          }
          setScrollActive(true);
        }, 5000);
      } else if (scrollActive) {
        gridRef.current.scrollTop += 1;
      }
    };

    const intervalId = setInterval(scrollGrid, 50);
    setScrollInterval(intervalId);

    return () => {
      clearInterval(intervalId);
    };
  }, [scrollActive]);

  return (
    <Flex flexDirection="column" flex="1">
      <VStack mb={4}>
        {cloneElement(icon, { color, boxSize: 8 })}
        <Heading color={color}>{heading}</Heading>
      </VStack>
      <Box overflowY="auto" maxH="50vh" ref={gridRef}>
        <SimpleGrid minChildWidth="5rem" spacing={4}>
          {reparations.map((reparation) => (
            <TokenComponent
              key={reparation.id}
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
  reparations: ExtendedReparation[];
  color: string;
  heading: string;
}) {
  return (
    <HStack w="100%" spacing={6}>
      <Heading color={color}>{heading}</Heading>
      <Marquee>
        {reparations.map((reparation) => (
          <Box mx={1} key={reparation.id}>
            <TokenComponent reparation={reparation} color={color} />
          </Box>
        ))}
      </Marquee>
    </HStack>
  );
}

export { TokenComponent, TokenGridComponent, TokenMarqueeComponent };
