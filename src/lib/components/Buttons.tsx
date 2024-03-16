import {
  CheckIcon,
  CloseIcon,
  DeleteIcon,
  EditIcon,
  MinusIcon,
  QuestionIcon,
  WarningTwoIcon,
} from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
  useRadioGroup,
  useToast,
} from '@chakra-ui/react';
import { FirebaseError } from 'firebase/app';
import {
  arrayUnion,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import NextLink from 'next/link';
import { useRef, useState } from 'react';

import { db } from '../utils/firebase';
import type { ExtendedReparation } from '../models/reparation';
import { typedDb } from '../utils/db';
import { generateRandomToken } from '../utils/functions';

import { RadioReparationTagComponent } from './ReparationTag';

function EditButtonComponent() {
  return (
    <NextLink href="/admin/reparation" passHref>
      <IconButton
        as="a"
        isRound
        variant="outline"
        colorScheme="yellow"
        size="sm"
        aria-label="Reparatie wijzigen"
        icon={<EditIcon />}
      />
    </NextLink>
  );
}

function DeleteButtonComponent({
  reparation,
}: {
  reparation: ExtendedReparation;
}) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  const deleteReparation = async () => {
    await runTransaction(db, async (transaction) => {
      await transaction.delete(typedDb.item(reparation.item_id));
      await transaction.delete(typedDb.reparation(reparation.id));
    }).catch((error) => {
      const code = error instanceof FirebaseError ? error.code : 'unknown';

      console.error(error);
      toast({
        title: `Oeps!`,
        description: `Er liep iets mis bij het updaten van een item. (${code})`,
        status: 'error',
        isClosable: true,
        duration: 10000,
      });
    });
    onClose();
  };

  return (
    <>
      <IconButton
        onClick={onOpen}
        isRound
        variant="outline"
        colorScheme="red"
        size="sm"
        aria-label="Reparatie verwijderen"
        icon={<DeleteIcon />}
      />

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Reparatie verwijderen
            </AlertDialogHeader>

            <AlertDialogBody>
              Opgelet! Verwijder enkel een reparatie als deze foutief werd
              toegevoegd. Als u doorgaat wordt het item permanent verwijderd en
              is het alsof het nooit heeft bestaan.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Annuleren
              </Button>
              <Button
                leftIcon={<WarningTwoIcon />}
                colorScheme="red"
                onClick={deleteReparation}
                ml={3}
              >
                Permanent verwijderen
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

function SetPendingActionButtonComponent({
  reparation,
  colorScheme,
  icon,
  text,
}: {
  reparation: ExtendedReparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = typedDb.reparation(reparation.id);
      await transaction.update(documentReference, {
        state_cycle: 'PENDING',
        events: arrayUnion({
          state_cycle: 'PENDING',
          timestamp: new Date(),
        }),
      });
    })
      .catch((error) => {
        const code = error instanceof FirebaseError ? error.code : 'unknown';

        console.error(error);
        toast({
          title: `Oeps!`,
          description: `Er liep iets mis bij het updaten van een item. (${code})`,
          status: 'error',
          isClosable: true,
          duration: 10000,
        });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Button
      w="100%"
      leftIcon={icon}
      colorScheme={colorScheme}
      variant="solid"
      size="sm"
      onClick={updateReparation}
      isLoading={isLoading}
    >
      {text}
    </Button>
  );
}

function SetQueuedActionButtonComponent({
  reparation,
  colorScheme,
  icon,
  text,
}: {
  reparation: ExtendedReparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = typedDb.reparation(reparation.id);
      await transaction.update(documentReference, {
        state_cycle: 'QUEUED',
        events: arrayUnion({
          state_cycle: 'QUEUED',
          timestamp: new Date(),
        }),
      });
    })
      .catch((error) => {
        const code = error instanceof FirebaseError ? error.code : 'unknown';

        console.error(error);
        toast({
          title: `Oeps!`,
          description: `Er liep iets mis bij het updaten van een item. (${code})`,
          status: 'error',
          isClosable: true,
          duration: 10000,
        });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Button
      w="100%"
      leftIcon={icon}
      colorScheme={colorScheme}
      variant="solid"
      size="sm"
      onClick={updateReparation}
      isLoading={isLoading}
    >
      {text}
    </Button>
  );
}

function SetDepositedActionButtonComponent({
  reparation,
  colorScheme,
  icon,
  text,
}: {
  reparation: ExtendedReparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const reservedTokens: Set<string> = new Set();

      const collectionReference = typedDb.reparations;
      const tokensQuery = query(
        collectionReference,
        where('state_token', '==', 'RESERVED')
      );
      const tokensQuerySnapshot = await getDocs(tokensQuery);
      tokensQuerySnapshot.forEach((doc) => {
        reservedTokens.add(doc.data().token);
      });

      const generatedtoken = generateRandomToken(reservedTokens);

      const documentReference = typedDb.reparation(reparation.id);
      await transaction.update(documentReference, {
        token: generatedtoken,
        state_cycle: 'DEPOSITED',
        state_token: 'RESERVED',
        events: arrayUnion({
          state_cycle: 'DEPOSITED',
          timestamp: new Date(),
        }),
      });
      // TODO send mail with track link
    })
      .catch((error) => {
        const code = error instanceof FirebaseError ? error.code : 'unknown';

        console.error(error);
        toast({
          title: `Oeps!`,
          description: `Er liep iets mis bij het updaten van een item. (${code})`,
          status: 'error',
          isClosable: true,
          duration: 10000,
        });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Button
      w="100%"
      leftIcon={icon}
      colorScheme={colorScheme}
      variant="solid"
      size="sm"
      onClick={updateReparation}
      isLoading={isLoading}
    >
      {text}
    </Button>
  );
}

function SetReleasedActionButtonComponent({
  reparation,
  colorScheme,
  icon,
  text,
}: {
  reparation: ExtendedReparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = typedDb.reparation(reparation.id);
      await transaction.update(documentReference, {
        state_token: 'RELEASED',
      });
    })
      .catch((error) => {
        const code = error instanceof FirebaseError ? error.code : 'unknown';

        console.error(error);
        toast({
          title: `Oeps!`,
          description: `Er liep iets mis bij het updaten van een item. (${code})`,
          status: 'error',
          isClosable: true,
          duration: 10000,
        });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Button
      w="100%"
      leftIcon={icon}
      colorScheme={colorScheme}
      variant="solid"
      size="sm"
      onClick={updateReparation}
      isLoading={isLoading}
    >
      {text}
    </Button>
  );
}

function SetCollectedActionButtonComponent({
  reparation,
  colorScheme,
  icon,
  text,
}: {
  reparation: ExtendedReparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = typedDb.reparation(reparation.id);
      await transaction.update(documentReference, {
        state_cycle: 'COLLECTED',
        events: arrayUnion({
          state_cycle: 'COLLECTED',
          timestamp: new Date(),
        }),
      });
    })
      .catch((error) => {
        const code = error instanceof FirebaseError ? error.code : 'unknown';

        console.error(error);
        toast({
          title: `Oeps!`,
          description: `Er liep iets mis bij het updaten van een item. (${code})`,
          status: 'error',
          isClosable: true,
          duration: 10000,
        });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Button
      w="100%"
      leftIcon={icon}
      colorScheme={colorScheme}
      variant="solid"
      size="sm"
      onClick={updateReparation}
      isLoading={isLoading}
    >
      {text}
    </Button>
  );
}

function SetFinishedActionButtonComponent({
  reparation,
  colorScheme,
  icon,
  text,
}: {
  reparation: ExtendedReparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const radios = [
    {
      key: 'SUCCESS',
      text: 'Reparatie gelukt',
      colorScheme: 'green',
      icon: <CheckIcon />,
    },
    {
      key: 'PARTIAL',
      text: 'Reparatie gedeeltelijk gelukt',
      colorScheme: 'yellow',
      icon: <MinusIcon />,
    },
    {
      key: 'FAIL',
      text: 'Reparatie niet gelukt',
      colorScheme: 'red',
      icon: <CloseIcon />,
    },
    {
      key: 'UNKNOWN',
      text: 'Status onbekend',
      colorScheme: 'gray',
      icon: <QuestionIcon />,
    },
  ];

  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { value, getRadioProps } = useRadioGroup();
  const [remarks, setRemarks] = useState<string>('');

  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = typedDb.reparation(reparation.id);
      await transaction.update(documentReference, {
        state_cycle: 'FINISHED',
        state_reparation: value,
        remarks,
        events: arrayUnion({
          state_cycle: 'FINISHED',
          timestamp: new Date(),
        }),
      });
      // TODO send email to user
    })
      .catch((error) => {
        const code = error instanceof FirebaseError ? error.code : 'unknown';

        console.error(error);
        toast({
          title: `Oeps!`,
          description: `Er liep iets mis bij het updaten van een item. (${code})`,
          status: 'error',
          isClosable: true,
          duration: 10000,
        });
      })
      .finally(() => setIsLoading(false));
    onClose();
  };

  return (
    <>
      <Button
        w="100%"
        leftIcon={icon}
        colorScheme={colorScheme}
        variant="solid"
        size="sm"
        onClick={onOpen}
        isLoading={isLoading}
      >
        {text}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reparatie voltooien</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4}>
              <FormLabel>Reparatiestatus</FormLabel>
              <HStack wrap="wrap">
                {radios.map((radio) => {
                  return (
                    <RadioReparationTagComponent
                      key={radio.key}
                      text={radio.text}
                      colorScheme={radio.colorScheme}
                      icon={radio.icon}
                      {...getRadioProps({ value: radio.key })}
                    />
                  );
                })}
              </HStack>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Opmerkingen van technieker</FormLabel>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
              <FormHelperText>
                De eigenaar van het toestel kan deze opmerkingen lezen.
              </FormHelperText>
            </FormControl>

            <FormControl mt={8}>
              Opgelet, de eigenaar wordt opgeroepen via mail en op de
              infoschermen om zich naar de balie te begeven.
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>Annuleren</Button>
            <Button onClick={updateReparation} colorScheme="green" ml={3}>
              Reparatie voltooien
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export {
  DeleteButtonComponent,
  EditButtonComponent,
  SetCollectedActionButtonComponent,
  SetDepositedActionButtonComponent,
  SetFinishedActionButtonComponent,
  SetPendingActionButtonComponent,
  SetQueuedActionButtonComponent,
  SetReleasedActionButtonComponent,
};
