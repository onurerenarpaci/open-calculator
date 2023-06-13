import React from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  HStack,
  Flex,
} from '@chakra-ui/react';
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { Logo } from './Logo';
import Canvas from './component/Canvas.js';
import Formula from './component/input/_formula.js';
import SliderComponent from './component/input/slider.js';
import { zoomState, xOffsetState, yOffsetState } from './state/input';
import Sidebar from './component/Sidebar.js';

function App(props) {
  return (
    <ChakraProvider theme={theme}>
      <RecoilRoot>
        <Flex spacing={'24px'} direction="row" flex="3" flexWrap={"wrap"}>
          <Sidebar />
          <Box flex="3" h={"100vh"}>
            <Canvas />
          </Box>
        </Flex>
      </RecoilRoot>
    </ChakraProvider>
  );
}

export default App;
