import React from 'react';
import {
  Box,
  Link as ChakraLink,
  Flex,
  SimpleGrid,
  VStack,
  Image,
} from "@chakra-ui/react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#000', color: 'white', textAlign: 'center', padding: '20px 0' }}>
      <Flex direction="column" alignItems="center">


        <ChakraLink href="https://dragonballzbsc.com/" isExternal>
          <Image src="/images/dbz.png" alt="DBZ Logo" width="80px" />
        </ChakraLink>
        <span>&copy; {currentYear} DragonballZBSC DBZ Funko NFT Collection.</span>

        <Box
          bg="rgba(0,0,0,0)"
          padding="20px"
          width="100%"
          mx="auto"
          marginTop="120px"
        />
      </Flex>
    </footer>
  );
};

export default Footer;
