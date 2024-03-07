import { Flex, Link, Text } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Flex as="footer" width="full" justifyContent="center" paddingY={8}>
      <Text fontSize="sm">
        {new Date().getFullYear()} -{' '}
        <Link
          href="https://be.linkedin.com/in/wout-rombouts"
          isExternal
          rel="noopener noreferrer"
        >
          Wout Rombouts
        </Link>
      </Text>
    </Flex>
  );
};

export default Footer;
