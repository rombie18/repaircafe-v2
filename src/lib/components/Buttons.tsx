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
  Timestamp,
  arrayUnion,
  deleteDoc,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import NextLink from 'next/link';
import { useRef, useState } from 'react';

import { typedDb } from '../utils/db';
import { db } from '../utils/firebase';
import { generateRandomToken } from '../utils/functions';
import {
  sendReparationDepositedMail,
  sendReparationFinishedMail,
} from '../utils/mailer';
import type { ExtendedCombinedReparation } from '../utils/models';

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
  combinedReparation,
}: {
  combinedReparation: ExtendedCombinedReparation;
}) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  const deleteReparation = async () => {
    await deleteDoc(typedDb.combinedReparation(combinedReparation.id)).catch(
      (error) => {
        const code = error instanceof FirebaseError ? error.code : 'unknown';

        console.error(error);
        toast({
          title: `Oeps!`,
          description: `Er liep iets mis bij het updaten van een item. (${code})`,
          status: 'error',
          isClosable: true,
          duration: 10000,
        });
      }
    );
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

function SetDepositedActionButtonComponent({
  combinedReparation,
  colorScheme,
  icon,
  text,
}: {
  combinedReparation: ExtendedCombinedReparation;
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

      const collectionReference = typedDb.combinedReparations;
      const tokensQuery = query(
        collectionReference,
        where('reparation_state_token', '==', 'RESERVED')
      );
      const tokensQuerySnapshot = await getDocs(tokensQuery);
      tokensQuerySnapshot.forEach((doc) => {
        reservedTokens.add(doc.data().reparation_token);
      });

      const generatedtoken = generateRandomToken(reservedTokens);

      const documentReference = typedDb.combinedReparation(
        combinedReparation.id
      );
      await transaction.update(documentReference, {
        reparation_token: generatedtoken,
        reparation_state_cycle: 'DEPOSITED',
        reparation_state_token: 'RESERVED',
        reparation_events: arrayUnion({
          state_cycle: 'DEPOSITED',
          timestamp: new Date(),
        }),
      });

      const newCombinedReparation: ExtendedCombinedReparation = {
        ...combinedReparation,
        ...{
          reparation_token: generatedtoken,
          reparation_state_cycle: 'DEPOSITED',
          reparation_state_token: 'RESERVED',
        },
      };
      newCombinedReparation.reparation_events.push({
        state_cycle: 'DEPOSITED',
        timestamp: Timestamp.fromDate(new Date()),
      });
      await sendReparationDepositedMail(newCombinedReparation);
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
  combinedReparation,
  colorScheme,
  icon,
  text,
}: {
  combinedReparation: ExtendedCombinedReparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = typedDb.combinedReparation(
        combinedReparation.id
      );
      await transaction.update(documentReference, {
        reparation_state_cycle: 'QUEUED',
        reparation_events: arrayUnion({
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

function SetPendingActionButtonComponent({
  combinedReparation,
  colorScheme,
  icon,
  text,
}: {
  combinedReparation: ExtendedCombinedReparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = typedDb.combinedReparation(
        combinedReparation.id
      );
      await transaction.update(documentReference, {
        reparation_state_cycle: 'PENDING',
        reparation_events: arrayUnion({
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
function SetFinishedActionButtonComponent({
  combinedReparation,
  colorScheme,
  icon,
  text,
}: {
  combinedReparation: ExtendedCombinedReparation;
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

    const documentReference = typedDb.combinedReparation(combinedReparation.id);
    await runTransaction(db, async (transaction) => {
      await transaction.update(documentReference, {
        reparation_state_cycle: 'FINISHED',
        reparation_state_reparation: value,
        reparation_remarks: remarks,
        reparation_events: arrayUnion({
          state_cycle: 'FINISHED',
          timestamp: new Date(),
        }),
      });

      const newCombinedReparation: ExtendedCombinedReparation = {
        ...combinedReparation,
        ...{
          reparation_state_cycle: 'FINISHED',
          reparation_state_reparation: value.toString(),
          reparation_remarks: remarks,
        },
      };
      newCombinedReparation.reparation_events.push({
        state_cycle: 'FINISHED',
        timestamp: Timestamp.fromDate(new Date()),
      });
      await sendReparationFinishedMail(newCombinedReparation);
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
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
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
            <Button
              isLoading={isLoading}
              onClick={updateReparation}
              colorScheme="green"
              ml={3}
            >
              Reparatie voltooien
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function SetCollectedActionButtonComponent({
  combinedReparation,
  colorScheme,
  icon,
  text,
}: {
  combinedReparation: ExtendedCombinedReparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = typedDb.combinedReparation(
        combinedReparation.id
      );
      await transaction.update(documentReference, {
        reparation_state_cycle: 'COLLECTED',
        reparation_events: arrayUnion({
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

function SetReleasedActionButtonComponent({
  combinedReparation,
  colorScheme,
  icon,
  text,
}: {
  combinedReparation: ExtendedCombinedReparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = typedDb.combinedReparation(
        combinedReparation.id
      );
      await transaction.update(documentReference, {
        reparation_state_token: 'RELEASED',
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

export {
  DeleteButtonComponent,
  EditButtonComponent,
  SetDepositedActionButtonComponent,
  SetQueuedActionButtonComponent,
  SetPendingActionButtonComponent,
  SetFinishedActionButtonComponent,
  SetCollectedActionButtonComponent,
  SetReleasedActionButtonComponent,
};
