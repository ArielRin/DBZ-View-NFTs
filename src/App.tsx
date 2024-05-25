import React, { useEffect, useState } from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Viewer from './Components/NFTViewer/NFTViewer';
// import Embed from './Components/NftMint0/Embed';


import { ConnectButton } from '@rainbow-me/rainbowkit';

import {
  Box,
  Container,
  Link,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  useToast,
  Button,
  Input,
} from '@chakra-ui/react';




import Web3 from 'web3';
import { ethers } from 'ethers';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Viewer />} />
          <Route path="/viewnfts" element={<Viewer />} />

      </Routes>
    </Router>
  );
}

export default App;
