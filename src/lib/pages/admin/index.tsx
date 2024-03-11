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
  Input,
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
  Text,
} from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from './DataTable';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import {
  onSnapshot,
  collection,
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import { db } from '~/lib/firebase/config';
import { Reparation } from '~/lib/models/reparation';

const columnHelper = createColumnHelper<Reparation>();

const columns = [
  columnHelper.accessor('token', {
    id: 'token',
    cell: (info) => {
      return <Badge fontSize="1rem">{info.getValue()}</Badge>;
    },
    header: 'Volgnummer',
  }),
  columnHelper.accessor('events', {
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
  columnHelper.accessor('state_cycle', {
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
      const state_cycle: string = props.row.getValue('state_cycle');
      const reparation: Reparation = props.row.original;

      switch (state_cycle) {
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
  columnHelper.accessor('state_reparation', {
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
];

const Home = () => {
  const [reparations, setReparations] = useState<Reparation[]>([]);

  const getReparations = (setReparations: any) => {
    try {
      const unsub = onSnapshot(collection(db, 'reparations'), (docs) => {
        const documents: Reparation[] = [];
        docs.forEach((document: any) => {
          documents.push({ _id: document.id, ...document.data() });
        });
        setReparations(documents);
      });
    } catch (err) {
      //TODO handle error
      console.error(err);
      setReparations([]);
    }
  };

  useEffect(() => getReparations(setReparations), []);

  return (
    <Box overflowX={'auto'}>
      <DataTable columns={columns} data={reparations} />
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
  const updateReparation = async () => {
    //TODO handle errors
    await runTransaction(db, async (transaction) => {
      const documentReference = doc(db, 'reparations', reparation._id);
      await transaction.update(documentReference, {
        state_cycle: 'PENDING',
      });
      //TODO add event with state_cycle=PENDING and timestamp
    });
  };

  return (
    <Button
      w="100%"
      leftIcon={icon}
      colorScheme={colorScheme}
      variant="solid"
      size="sm"
      onClick={updateReparation}
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
  const updateReparation = async () => {
    //TODO handle errors
    await runTransaction(db, async (transaction) => {
      const documentReference = doc(db, 'reparations', reparation._id);
      await transaction.update(documentReference, {
        state_cycle: 'QUEUED',
      });
      //TODO add event with state_cycle=QUEUED and timestamp
    });
  };

  return (
    <Button
      w="100%"
      leftIcon={icon}
      colorScheme={colorScheme}
      variant="solid"
      size="sm"
      onClick={updateReparation}
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
  const updateReparation = async () => {
    //TODO handle errors
    await runTransaction(db, async (transaction) => {
      const documentReference = doc(db, 'reparations', reparation._id);
      await transaction.update(documentReference, {
        token: 'TTT',
        state_cycle: 'DEPOSITED',
        state_token: 'RESERVED',
      });
      //TODO add event with state_cycle=DEPOSITED and timestamp
      //TODO send mail with track link
    });
  };

  return (
    <Button
      w="100%"
      leftIcon={icon}
      colorScheme={colorScheme}
      variant="solid"
      size="sm"
      onClick={updateReparation}
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
  const updateReparation = async () => {
    //TODO handle errors
    await runTransaction(db, async (transaction) => {
      const documentReference = doc(db, 'reparations', reparation._id);
      await transaction.update(documentReference, {
        state_token: 'RELEASED',
      });
    });
  };

  return (
    <Button
      w="100%"
      leftIcon={icon}
      colorScheme={colorScheme}
      variant="solid"
      size="sm"
      onClick={updateReparation}
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
  const updateReparation = async () => {
    //TODO handle errors
    await runTransaction(db, async (transaction) => {
      const documentReference = doc(db, 'reparations', reparation._id);
      await transaction.update(documentReference, {
        state_cycle: 'COLLECTED',
      });
      //TODO add event with state_cycle=COLLECTED and timestamp
    });
  };

  return (
    <Button
      w="100%"
      leftIcon={icon}
      colorScheme={colorScheme}
      variant="solid"
      size="sm"
      onClick={updateReparation}
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
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const { value, getRadioProps, getRootProps } = useRadioGroup();
  const [remarks, setRemarks] = useState<string>('');

  const updateReparation = async () => {
    //TODO handle errors
    await runTransaction(db, async (transaction) => {
      const documentReference = doc(db, 'reparations', reparation._id);
      await transaction.update(documentReference, {
        state_cycle: 'FINISHED',
        state_reparation: value,
        remarks: remarks,
      });
      //TODO add event with state_cycle=FINISHED and timestamp
      //TODO send email to user
    });
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const deleteReparation = async () => {
    //TODO handle errors
    await runTransaction(db, async (transaction) => {
      await transaction.delete(doc(db, 'items', reparation.item_id));
      await transaction.delete(doc(db, 'reparations', reparation._id));
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
