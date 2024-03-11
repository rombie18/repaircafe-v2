'use client';

import {
  CheckIcon,
  CloseIcon,
  MinusIcon,
  QuestionIcon,
  DeleteIcon,
  BellIcon,
  SettingsIcon,
  SpinnerIcon,
  DownloadIcon,
  UnlockIcon,
  WarningTwoIcon,
  EditIcon,
} from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Collapse,
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
  Tag,
  TagLabel,
  Textarea,
  chakra,
  useDisclosure,
  useRadio,
  useRadioGroup,
  useToast,
} from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import {
  onSnapshot,
  collection,
  doc,
  getDoc,
  runTransaction,
  arrayUnion,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '~/lib/firebase/config';
import { Reparation } from '~/lib/models/reparation';
import { FirebaseError } from 'firebase/app';

const columnHelper = createColumnHelper<{
  item: Item;
  reparation: Reparation;
  user: User;
}>();

const columns = [
  columnHelper.accessor('reparation.state_reparation', {
    id: 'state_reparation',
    cell: (info) => {
      switch (info.getValue()) {
        case 'SUCCESS':
          return (
            <ExpandableReparationTagComponent
              colorScheme="green"
              icon={<CheckIcon />}
              text="Reparatie gelukt"
            />
          );
        case 'PARTIAL':
          return (
            <ExpandableReparationTagComponent
              colorScheme="yellow"
              icon={<MinusIcon />}
              text="Reparatie gedeeltelijk gelukt"
            />
          );
        case 'FAIL':
          return (
            <ExpandableReparationTagComponent
              colorScheme="red"
              icon={<CloseIcon />}
              text="Reparatie mislukt"
            />
          );
        case 'UNKNOWN':
        default:
          return (
            <ExpandableReparationTagComponent
              colorScheme="gray"
              icon={<QuestionIcon />}
              text="Status onbekend"
            />
          );
      }
    },
    header: '',
  }),
  columnHelper.accessor('reparation.token', {
    id: 'token',
    cell: (info) => {
      return <Badge fontSize="1rem">{info.getValue()}</Badge>;
    },
    header: 'Volgnummer',
  }),
  columnHelper.accessor('item.name', {
    id: 'name',
    cell: (info) => {
      return info.getValue();
    },
    header: 'Toestel',
  }),
  columnHelper.accessor('user.name', {
    id: 'user',
    cell: (info) => {
      return info.getValue();
    },
    header: 'Eigenaar',
  }),
  columnHelper.accessor('reparation.events', {
    id: 'events',
    cell: (info) => {
      const event = info
        .getValue()
        .filter((event) => event.state_cycle === 'DEPOSITED')[0];
      if (event) {
        return DateTime.fromJSDate(event.timestamp.toDate())
          .setLocale('nl')
          .toFormat("d MMM',' H'u'mm");
      } else {
        return '';
      }
    },
    header: 'Aangemeld',
  }),
  columnHelper.accessor('reparation.state_cycle', {
    id: 'state_cycle',
    cell: (info) => {
      switch (info.getValue()) {
        case 'REGISTERED':
          return (
            <Badge variant="outline" colorScheme="gray">
              Geregistreerd
            </Badge>
          );
        case 'DEPOSITED':
          return (
            <Badge variant="outline" colorScheme="red">
              Aangemeld
            </Badge>
          );
        case 'QUEUED':
          return (
            <Badge variant="outline" colorScheme="red">
              In wachtrij
            </Badge>
          );
        case 'PENDING':
          return (
            <Badge variant="outline" colorScheme="yellow">
              In reparatie
            </Badge>
          );
        case 'FINISHED':
          return (
            <Badge variant="outline" colorScheme="green">
              Reparatie voltooid
            </Badge>
          );
        case 'COLLECTED':
          return (
            <Badge variant="outline" colorScheme="gray">
              Item opgehaald
            </Badge>
          );
        case 'UNKNOWN':
        default:
          return (
            <Badge variant="outline" colorScheme="gray">
              Status onbekend
            </Badge>
          );
      }
    },
    header: 'Itemstatus',
  }),
  columnHelper.display({
    id: 'actions',
    cell: (props) => {
      const reparation: Reparation = props.row.original.reparation;

      switch (reparation.state_cycle) {
        case 'REGISTERED':
          return (
            <HStack>
              <SetDepositedActionButtonComponent
                reparation={reparation}
                icon={<DownloadIcon />}
                colorScheme="gray"
                text="In ontvangst nemen"
              />
              <EditButtonComponent />
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );
        case 'DEPOSITED':
          return (
            <HStack>
              <SetQueuedActionButtonComponent
                reparation={reparation}
                icon={<SpinnerIcon />}
                colorScheme="red"
                text="In wachtrij zetten"
              />
              <EditButtonComponent />
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );
        case 'QUEUED':
          return (
            <HStack>
              <SetPendingActionButtonComponent
                reparation={reparation}
                icon={<SettingsIcon />}
                colorScheme="yellow"
                text="Reparatie starten"
              />
              <EditButtonComponent />
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );
        case 'PENDING':
          return (
            <HStack>
              <SetFinishedActionButtonComponent
                reparation={reparation}
                icon={<BellIcon />}
                colorScheme="green"
                text="Eigenaar oproepen"
              />
              <EditButtonComponent />
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );
        case 'FINISHED':
          return (
            <HStack>
              <SetCollectedActionButtonComponent
                reparation={reparation}
                icon={<CheckIcon />}
                colorScheme="green"
                text="Als opgehaald markeren"
              />
              <EditButtonComponent />
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );
        case 'COLLECTED':
          if (reparation.state_token === 'RESERVED') {
            return (
              <HStack>
                <SetReleasedActionButtonComponent
                  reparation={reparation}
                  icon={<UnlockIcon />}
                  colorScheme="gray"
                  text="Volgnummer vrijgeven"
                />
                <EditButtonComponent />
                <DeleteButtonComponent reparation={reparation} />
              </HStack>
            );
          } else {
            return (
              <HStack>
                <Button
                  w="100%"
                  colorScheme="gray"
                  variant="solid"
                  size="sm"
                  isDisabled
                >
                  Afgehandeld!
                </Button>
                <EditButtonComponent />
                <DeleteButtonComponent reparation={reparation} />
              </HStack>
            );
          }
        case 'UNKNOWN':
        default:
          return (
            <HStack>
              <DeleteButtonComponent reparation={reparation} />
            </HStack>
          );
      }
    },
    header: 'Acties',
  }),
];

//TODO deduplicate firebase requests and enable caching
const Home = () => {
  const toast = useToast();
  const [data, setData] = useState<
    { item: Item; reparation: Reparation; user: User }[]
  >([]);

  const getData = (setData: any) => {
    onSnapshot(
      collection(db, 'reparations'),
      async (docs) => {
        const documents: { item: Item; reparation: Reparation; user: User }[] =
          [];

        await Promise.all(
          docs.docs.map(async (document: any) => {
            const reparation: Reparation = {
              _id: document.id,
              ...document.data(),
            };
            const itemSnapshot = await getDoc(
              doc(db, 'items', reparation.item_id)
            );
            const itemData: any = itemSnapshot.data();
            const item: Item = { _id: itemSnapshot.id, ...itemData };
            const userSnapshot = await getDoc(doc(db, 'users', item.user_id));
            const userData: any = userSnapshot.data();
            const user: User = {
              _id: userSnapshot.id,
              ...userData,
              name: `${userData.first_name} ${userData.last_name}`,
            };

            documents.push({
              item: item,
              reparation: reparation,
              user: user,
            });
          })
        );

        setData(documents);
      },
      (error) => {
        let code = 'unknown';
        error instanceof FirebaseError && (code = error.code);

        console.error(error);
        toast({
          title: `Oeps!`,
          description: `Er liep iets mis bij het ophalen van gegevens. (${code})`,
          status: 'error',
          isClosable: true,
          duration: 10000,
        });
      }
    );
  };

  useEffect(() => getData(setData), []);

  return (
    <Box overflowX={'auto'}>
      <DataTable columns={columns} data={data} />
    </Box>
  );
};

function SetPendingActionButtonComponent({
  reparation,
  colorScheme,
  icon,
  text,
}: {
  reparation: Reparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = doc(db, 'reparations', reparation._id);
      await transaction.update(documentReference, {
        state_cycle: 'PENDING',
        events: arrayUnion({
          state_cycle: 'PENDING',
          timestamp: new Date(),
        }),
      });
    })
      .catch((error) => {
        let code = 'unknown';
        error instanceof FirebaseError && (code = error.code);

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
  reparation: Reparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = doc(db, 'reparations', reparation._id);
      await transaction.update(documentReference, {
        state_cycle: 'QUEUED',
        events: arrayUnion({
          state_cycle: 'QUEUED',
          timestamp: new Date(),
        }),
      });
    })
      .catch((error) => {
        let code = 'unknown';
        error instanceof FirebaseError && (code = error.code);

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
  reparation: Reparation;
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

      const collectionReference = collection(db, 'reparations');
      const tokensQuery = query(
        collectionReference,
        where('state_token', '==', 'RESERVED')
      );
      const tokensQuerySnapshot = await getDocs(tokensQuery);
      tokensQuerySnapshot.forEach((doc: any) => {
        reservedTokens.add(doc.data().token);
      });

      const generatedtoken = generateRandomToken(reservedTokens);

      const documentReference = doc(db, 'reparations', reparation._id);
      await transaction.update(documentReference, {
        token: generatedtoken,
        state_cycle: 'DEPOSITED',
        state_token: 'RESERVED',
        events: arrayUnion({
          state_cycle: 'DEPOSITED',
          timestamp: new Date(),
        }),
      });
      //TODO send mail with track link
    })
      .catch((error) => {
        let code = 'unknown';
        error instanceof FirebaseError && (code = error.code);

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
  reparation: Reparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = doc(db, 'reparations', reparation._id);
      await transaction.update(documentReference, {
        state_token: 'RELEASED',
      });
    })
      .catch((error) => {
        let code = 'unknown';
        error instanceof FirebaseError && (code = error.code);

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
  reparation: Reparation;
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = doc(db, 'reparations', reparation._id);
      await transaction.update(documentReference, {
        state_cycle: 'COLLECTED',
        events: arrayUnion({
          state_cycle: 'COLLECTED',
          timestamp: new Date(),
        }),
      });
    })
      .catch((error) => {
        let code = 'unknown';
        error instanceof FirebaseError && (code = error.code);

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
  reparation: Reparation;
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
  const { value, getRadioProps, getRootProps } = useRadioGroup();
  const [remarks, setRemarks] = useState<string>('');

  const updateReparation = async () => {
    setIsLoading(true);
    await runTransaction(db, async (transaction) => {
      const documentReference = doc(db, 'reparations', reparation._id);
      await transaction.update(documentReference, {
        state_cycle: 'FINISHED',
        state_reparation: value,
        remarks: remarks,
        events: arrayUnion({
          state_cycle: 'FINISHED',
          timestamp: new Date(),
        }),
      });
      //TODO send email to user
    })
      .catch((error) => {
        let code = 'unknown';
        error instanceof FirebaseError && (code = error.code);

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

      <Modal isOpen={isOpen} onClose={onClose} size={'lg'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reparatie voltooien</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4}>
              <FormLabel>Reparatiestatus</FormLabel>
              <HStack wrap={'wrap'}>
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
              Opgelet, de eigenaar wordt opgeroepen via mail en op de schermen
              om zich naar de balie te begeven.
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

function generateRandomToken(reservedTokens: Set<string>): string {
  let randomToken;

  if (reservedTokens.size == 2600) {
    throw new FirebaseError(
      'no-tokens-available',
      'Er zijn geen vrije volgnummers beschikbaar. Alle 2600 nummers zijn in gebruik.'
    );
  }

  do {
    const randomLetter = String.fromCharCode(
      65 + Math.floor(Math.random() * 26)
    );
    const randomDigits = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');
    randomToken = `${randomLetter}${randomDigits}`;
  } while (reservedTokens.has(randomToken));

  return randomToken;
}

function RadioReparationTagComponent(props: any) {
  const { text, colorScheme, icon, ...radioProps } = props;
  const { state, getInputProps, getRadioProps, htmlProps, getLabelProps } =
    useRadio(radioProps);

  return (
    <chakra.label {...htmlProps} cursor="pointer">
      <input {...getInputProps({})} hidden />
      <Box
        {...getRadioProps()}
        shadow={
          state.isChecked ? '0 0 5px 0px var(--chakra-colors-gray-500)' : 'none'
        }
        borderWidth={state.isChecked ? '1px' : 'none'}
        borderColor={'white'}
        rounded="full"
      >
        <ReparationTagComponent
          text={text}
          colorScheme={colorScheme}
          icon={icon}
          {...getLabelProps()}
        />
      </Box>
    </chakra.label>
  );
}

function ReparationTagComponent({
  text,
  colorScheme,
  icon,
}: {
  text: string;
  colorScheme: string;
  icon: JSX.Element;
}) {
  return (
    <Tag size="lg" colorScheme={colorScheme} borderRadius="full">
      {icon}
      <TagLabel ml={2}>{text}</TagLabel>
    </Tag>
  );
}

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

function DeleteButtonComponent({ reparation }: { reparation: Reparation }) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const deleteReparation = async () => {
    await runTransaction(db, async (transaction) => {
      await transaction.delete(doc(db, 'items', reparation.item_id));
      await transaction.delete(doc(db, 'reparations', reparation._id));
    }).catch((error) => {
      let code = 'unknown';
      error instanceof FirebaseError && (code = error.code);

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

function ExpandableReparationTagComponent({
  colorScheme,
  icon,
  text,
}: {
  colorScheme: string;
  icon: JSX.Element;
  text: string;
}) {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <HStack>
      <Tag
        onMouseEnter={onToggle}
        onMouseLeave={onToggle}
        colorScheme={colorScheme}
        borderRadius="full"
      >
        {icon}
        <Collapse in={isOpen} animateOpacity>
          <Box ml={2}>{text}</Box>
        </Collapse>
      </Tag>
    </HStack>
  );
}

export default Home;
