import { ArrowForwardIcon } from '@chakra-ui/icons';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Heading,
  LinkBox,
  LinkOverlay,
  Text,
} from '@chakra-ui/react';

export default function OnboardingCardComponent({
  heading,
  text,
  button_text,
  href,
}: {
  heading: string;
  text: string;
  button_text: string;
  href: string;
}) {
  return (
    <LinkBox
      rounded="md"
      minWidth={{ base: '100%', md: 'unset' }}
      maxWidth={{ base: 'unset', md: '40%' }}
      flex="0 0 50%"
      _hover={{
        boxShadow: '0px 0px 8px 4px rgba(255, 255, 255, 0.3)',
      }}
    >
      <Card>
        <CardBody>
          <Heading size="md">{heading}</Heading>
          <Text>{text}</Text>
        </CardBody>
        <CardFooter>
          <LinkOverlay href={href}>
            <Button>
              {button_text}
              <ArrowForwardIcon ml={2} />
            </Button>
          </LinkOverlay>
        </CardFooter>
      </Card>
    </LinkBox>
  );
}
