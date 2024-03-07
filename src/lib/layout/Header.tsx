import { Box, Flex, Image, HStack } from '@chakra-ui/react';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <Flex as="header" width="full" align="center">
      <HStack spacing="16px" ml={0.5}>
        <Image src="/logo-thomas-more.avif" alt="Logo Thomas More" h="2em" />
        <Image src="/logo-ku-leuven.png" alt="Logo KU Leuven" h="2em" />
      </HStack>
      <Box marginLeft="auto">
        <ThemeToggle />
      </Box>
    </Flex>
  );
};

export default Header;
