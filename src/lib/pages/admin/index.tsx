'use client';

import {
  ArrowUpIcon,
  AttachmentIcon,
  BellIcon,
  CheckIcon,
  CloseIcon,
  EditIcon,
  MinusIcon,
  QuestionIcon,
  SettingsIcon,
  SpinnerIcon,
} from '@chakra-ui/icons';
import {
  Badge,
  HStack,
  Kbd,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  TableCaption,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';

const Home = () => {
  return (
    <>
      <HStack wrap={'wrap'}>
        <Tag colorScheme="gray" borderRadius="full">
          <EditIcon mr={2} />
          <TagLabel>Geregistreerd</TagLabel>
        </Tag>
        <Tag colorScheme="red" borderRadius="full">
          <AttachmentIcon mr={2} />
          <TagLabel>Aangemeld</TagLabel>
        </Tag>
        <Tag colorScheme="yellow" borderRadius="full">
          <SpinnerIcon mr={2} />
          <TagLabel>In wachtrij</TagLabel>
        </Tag>
        <Tag colorScheme="yellow" borderRadius="full">
          <SettingsIcon mr={2} />
          <TagLabel>In reparatie</TagLabel>
        </Tag>
        <Tag colorScheme="green" borderRadius="full">
          <BellIcon mr={2} />
          <TagLabel>Reparatie voltooid</TagLabel>
        </Tag>
        <Tag colorScheme="gray" borderRadius="full">
          <CheckIcon mr={2} />
          <TagLabel>Item opgehaald</TagLabel>
        </Tag>
      </HStack>
      <TableContainer>
        <Table variant="striped" colorScheme="gray">
          <TableCaption>Imperial to metric conversion factors</TableCaption>
          <Thead>
            <Tr>
              <Th>Volgnummer</Th>
              <Th>Aangemeld</Th>
              <Th>Itemstatus</Th>
              <Th>Reparatiestatus</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                <Badge fontSize="1em">A23</Badge>
              </Td>
              <Td>23u14</Td>
              <Td>
                <Tag colorScheme="blue" borderRadius="full">
                  <CheckIcon mr={2} />
                  <TagLabel>Reparatie voltooid</TagLabel>
                </Tag>
              </Td>
              <Td>
                <Tag colorScheme="yellow" borderRadius="full">
                  <MinusIcon mr={2} />
                  <TagLabel>Reparatie gedeeltelijk gelukt</TagLabel>
                </Tag>
              </Td>
            </Tr>
            <Tr>
              <Td>
                <Badge fontSize="1em">B64</Badge>
              </Td>
              <Td>23u24</Td>
              <Td>
                <Tag colorScheme="green" borderRadius="full">
                  <ArrowUpIcon mr={2} />
                  <TagLabel>Opgehaald</TagLabel>
                </Tag>
              </Td>
              <Td>
                <Tag colorScheme="red" borderRadius="full">
                  <CloseIcon mr={2} />
                  <TagLabel>Reparatie niet gelukt</TagLabel>
                </Tag>
              </Td>
            </Tr>
            <Tr>
              <Td>
                <Badge fontSize="1em">A25</Badge>
              </Td>
              <Td>23u26</Td>
              <Td>
                <Tag colorScheme="blue" borderRadius="full">
                  <CheckIcon mr={2} />
                  <TagLabel>Reparatie voltooid</TagLabel>
                </Tag>
              </Td>
              <Td>
                <Tag colorScheme="gray" borderRadius="full">
                  <QuestionIcon mr={2} />
                  <TagLabel>Status onbekend</TagLabel>
                </Tag>
              </Td>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>Volgnummer</Th>
              <Th>Aangemeld</Th>
              <Th>Itemstatus</Th>
              <Th>Reparatiestatus</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </>
  );
};

export default Home;
