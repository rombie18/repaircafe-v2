import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';

function LoadingWidgetComponent() {
  return (
    <Flex
      h="100%"
      direction="row"
      alignItems="center"
      justifyContent="center"
      gap={4}
      mb={8}
      paddingTop={10}
      flexWrap="wrap"
    >
      <VStack>
        <Spinner size="xl" />
        <Text>Laden...</Text>
      </VStack>
    </Flex>
  );
}

function ErrorWidgetComponent() {
  return (
    <Flex h="100%" alignItems="center">
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        rounded={10}
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Oeps!
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          Er liep iets mis bij het ophalen van de pagina. Probeer later opnieuw.
        </AlertDescription>
      </Alert>
    </Flex>
  );
}

export { LoadingWidgetComponent, ErrorWidgetComponent };
