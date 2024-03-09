'use client';

import { Box, Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import Footer from './Footer';
import Header from './Header';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box
      h="100dvh"
      marginX={{ base: 0, md: 0, lg: 24, xl: 52 }}
      transition="0.5s ease-out"
    >
      <Box padding="8" h="100%">
        <Flex h="100%" direction="column" justifyContent="space-between">
          <Header />
          <Box as="main" marginY={22} flex={1}>
            {children}
          </Box>
          <Footer />
        </Flex>
      </Box>
    </Box>
  );
};

export default Layout;
