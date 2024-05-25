import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { ToastContainer, toast as notify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Button,
  Image,
  Text,
  Link,
  SimpleGrid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
  Grid,
} from '@chakra-ui/react';

import Footer from '../Footer/Footer';
import nftMintAbi from './nftMintAbi.json';

const NFTMINT_CONTRACT_ADDRESS = '0x215a9993D8126deE0c85C96779Ad3C3536CF15Ca'; // live bsc
const RPC_PROVIDER = 'https://bsc-dataseed.binance.org/';
const EXPLORER_LINK = 'https://bscscan.com/';
const METADATA_BASE_URL = 'https://ipfs.io/ipfs/QmaYwhSQcBoVvddQNVvHVQ56A9AjpojGc2SEgbZy7RsnNA/';
const MAX_TOKEN_ID = 1000; // Adjust this to a reasonable maximum token ID

const getExplorerLink = (tokenId: number) => `${EXPLORER_LINK}token/${NFTMINT_CONTRACT_ADDRESS}?a=${tokenId}`;
const getMarketplaceLink = (tokenId: number) => `https://element.market/assets/bsc/${NFTMINT_CONTRACT_ADDRESS}/${tokenId}`;

const addNftToWallet = async (tokenId: number) => {
  try {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error('Ethereum object not found');
    }

    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC721',
        options: {
          address: NFTMINT_CONTRACT_ADDRESS,
          tokenId: tokenId.toString(),
          symbol: 'DBZFS',
          image: `${METADATA_BASE_URL}${tokenId}`,
        },
      },
    });

    if (wasAdded) {
      console.log('Asset added');
    } else {
      console.log('Asset addition rejected');
    }
  } catch (error) {
    console.error('Error adding NFT to wallet', error);
  }
};

const fetchMetadata = async (tokenId: number) => {
  try {
    console.log(`Fetching metadata for token ID: ${tokenId}`);
    const response = await fetch(`${METADATA_BASE_URL}${tokenId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata for tokenId: ${tokenId}`);
    }
    const metadata = await response.json();
    console.log(`Metadata fetched for token ID: ${tokenId}`, metadata);

    const imageUrl = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    return imageUrl;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return 'https://via.placeholder.com/150';
  }
};

interface Nft {
  tokenId: number;
  imageUrl: string;
}

function MyNfts() {
  const { address, isConnected } = useAccount();
  const toast = useToast();
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchNFTs = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.providers.JsonRpcProvider(RPC_PROVIDER);
      const contract = new ethers.Contract(NFTMINT_CONTRACT_ADDRESS, nftMintAbi, provider);
      const nftList: Nft[] = [];

      const tokenFetchPromises = [];
      for (let i = 0; i < MAX_TOKEN_ID; i++) {
        tokenFetchPromises.push(
          (async () => {
            try {
              const owner = await contract.ownerOf(i);
              if (owner.toLowerCase() === address?.toLowerCase()) {
                const imageUrl = await fetchMetadata(i);
                nftList.push({ tokenId: i, imageUrl });
              }
            } catch (err) {
            }
          })()
        );
      }

      await Promise.all(tokenFetchPromises);

      setNfts(nftList);
      console.log('NFTs fetched:', nftList);
    } catch (error) {
      toast({
        title: 'Error Fetching NFTs',
        description: 'There was an issue fetching NFTs from the contract.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchNFTs();
    }
  }, [isConnected]);

  return (
    <>
      <Box
        flex={1}
        p={0}
        m={0}
        display="flex"
        flexDirection="column"
        bg="rgba(0, 0, 0, 1)"
        bgImage="url('/images/bg3.png')"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
      >
        <Box
          flex={1}
          p={0}
          m={0}
          display="flex"
          flexDirection="column"
          bg="rgba(0, 0, 0, 0.2)"
          bgPosition="center"
          bgRepeat="no-repeat"
          bgSize="cover"
        >
          <VStack spacing="10px" p="10px" alignItems="center">
            <Image src="/images/dbz.png" alt="Header Logo" boxSize="190px" />
            <ConnectButton />
          </VStack>
          <Box
            marginBottom="40px"
            bg="rgba(0,0,0,0.6)"
            borderRadius="2xl"
            padding="20px"
            maxW="90%"
            mx="auto"
            my="20px"
          >

            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bolder',
                fontSize: '30px'
              }}
            >
              Your DragonBallz Funko Collection
            </Text>
            {loading ? (
              <Text
                className="totalSupply"
                style={{
                  marginBottom: '40px',
                  color: 'white',
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                Please be patient while Loading...
              </Text>
            ) : nfts.length === 0 ? (
              <Text
                className="totalSupply"
                style={{
                  color: 'white',
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                No DBZ Funko's.
              </Text>
            ) : (
              <Wrap spacing="10px" justify="center">
                {nfts.map(({ tokenId, imageUrl }) => (
                  <WrapItem key={tokenId} flexBasis={{ base: '100%', sm: '48%', md: '31%', lg: '23%', xl: '19%' }}>
                    <Box
                      bg="rgba(0, 0, 0, 0)"
                      p="4"
                      borderRadius="2xl"
                      position="relative"
                      overflow="hidden"
                      _hover={{
                        '.overlay': {
                          opacity: 1,
                        }
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt={`NFT ${tokenId}`}
                        width="100%"
                        height="100%"
                        borderRadius="2xl"
                        objectFit="cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://via.placeholder.com/250';
                        }}
                        onClick={() => {
                          setSelectedImage(imageUrl);
                          onOpen();
                        }}
                      />
                      <Box
                        className="overlay"
                        position="absolute"
                        top="0"
                        left="0"
                        width="100%"
                        height="100%"
                        bg="rgba(0, 0, 0, 0.7)"
                        opacity="0"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        transition="opacity 0.3s ease-in-out"
                      >
                        <Text mt="2" color="white" textAlign="center">
                          DBZFS TokenId {tokenId}
                        </Text>
                        <Link href={getMarketplaceLink(tokenId)} isExternal>
                          <Button
                            mt="2"
                            width="160px"
                            bg="#964cbc"
                            textColor="white"
                            _hover={{ bg: '#bc458d' }}
                          >
                            Element Market
                          </Button>
                        </Link>
                        <Button
                          mt="2"
                          width="160px"
                          bg="#964cbc"
                          textColor="white"
                          _hover={{ bg: '#bc458d' }}
                          onClick={() => addNftToWallet(tokenId)}
                        >
                          Add to Wallet
                        </Button>
                        <Button
                          mt="2"
                          width="160px"
                          bg="#964cbc"
                          textColor="white"
                          _hover={{ bg: '#bc458d' }}
                          onClick={() => {
                            setSelectedImage(imageUrl);
                            onOpen();
                          }}
                        >
                          Full Screen
                        </Button>

                        <Link
                          style={{
                            marginTop: '40px',
                            color: 'white',
                            padding: '10px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                          }}
                          href={getExplorerLink(tokenId)}
                          isExternal
                          mt="2"
                          color="white"
                          textAlign="center"
                        >
                          View on BSCScan
                        </Link>
                      </Box>
                    </Box>
                  </WrapItem>
                ))}
              </Wrap>
            )}

          </Box>
          <Box
            marginBottom="40px"
            bg="rgba(0,0,0,0.6)"
            borderRadius="2xl"
            padding="20px"
            maxW="90%"
            mx="auto"
            my="20px"
          >
                      <VStack spacing="10px" p="10px" alignItems="center">
                        <Link href="https://dragonballzbsc.com/" isExternal>
                          <Text color="white" fontWeight="bold" fontSize="lg" textDecoration="underline">Mint another DBZ Funko NFT</Text>
                        </Link>
                      </VStack>
          </Box>

          <Box
            bg="rgba(0,0,0,0)"
            padding="20px"
            width="100%"
            mx="auto"
            marginTop="10px"
          >
            <Image
              marginBottom="40px"
              src="/images/character.png"
              mx="auto"
              alt="DBZ Funko"
              width="400px"
            />

          </Box>

        </Box>
        <Footer />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton color="white" />
          <ModalBody
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="black"
          >
            {selectedImage && (
              <Image src={selectedImage} alt="NFT Fullscreen" maxH="90vh" />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default MyNfts;
