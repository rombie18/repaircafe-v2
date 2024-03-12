import { Box, Button, Flex, Heading, Image } from '@chakra-ui/react';
import Link from 'next/link';

const Page = () => {
  return (
    <Flex minHeight="70vh" direction="column" justifyContent="center">
      <Box width={{ base: '100%', sm: '70%', md: '60%' }} margin="0 auto">
        <Image
          src="/404 Error-pana.svg"
          alt="Error 404 not found Illustration"
        />
      </Box>

      <Box marginY={4}>
        <Heading textAlign="center" size="lg">
          Pagina niet gevonden
        </Heading>

        <Box textAlign="center" marginTop={6}>
          <Button as={Link} href="/">
            Naar homepagina
          </Button>
        </Box>
      </Box>
    </Flex>
  );
};

export default Page;
