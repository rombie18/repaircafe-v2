import { Box, Flex, HStack, Image, Link } from '@chakra-ui/react';

import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <Flex as="header" width="full" align="center">
      <Link href="/">
        <HStack spacing="16px" ml={0.5}>
          <Image src="/logo-thomas-more.png" alt="Logo Thomas More" h="2em" />
          <Image src="/logo-ku-leuven.png" alt="Logo KU Leuven" h="2em" />
        </HStack>
      </Link>
      <Box marginLeft="auto">
        <ThemeToggle />
      </Box>
    </Flex>
  );
};

export default Header;
