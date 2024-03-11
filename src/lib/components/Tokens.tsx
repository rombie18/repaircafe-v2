import {
  Flex,
  VStack,
  Heading,
  SimpleGrid,
  HStack,
  Center,
  Badge,
  Box,
} from '@chakra-ui/react';
import { useRef, useState, useEffect, cloneElement } from 'react';
import Marquee from 'react-fast-marquee';
import { Reparation } from '../models/reparation';

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
        {cloneElement(icon, { color: color, boxSize: 8 })}
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

export { TokenGridComponent, TokenMarqueeComponent, TokenComponent };
