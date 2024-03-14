import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Center,
  Flex,
  Text,
} from '@chakra-ui/react';

function LoadingWidgetComponent() {
  return (
    <Center>
      <Text>Laden...</Text>
    </Center>
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
