import React from "react";
import {
    ChakraProvider,
    Box,
    Text,
    Link,
    VStack,
    Code,
    Grid,
    theme,
    Stack,
    Input,
    Flex,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    Heading,
    Icon,
    IconButton,
} from "@chakra-ui/react";
import { BsTrash } from "react-icons/bs";
import SliderComponent from "./input/slider";
import { mathExpressionsState } from "../state/formula";
import {
    zoomState,
    xOffsetState,
    yOffsetState,
    inputFocusState,
} from "../state/input";
import { useRecoilState } from "recoil";
import { CirclePicker } from "react-color";
import { MathComponent } from "mathjax-react";

const Sidebar = () => {
    const [inputFocus, setInputFocus] = useRecoilState(inputFocusState);
    const [mathExpressions, setMathExpressions] =
        useRecoilState(mathExpressionsState);

    const addExpression = () => {
        setMathExpressions([...mathExpressions, ""]);
    };

    const onExpressionChange = (e, index) => {
        const newMathExpressions = [...mathExpressions];
        newMathExpressions[index] = e.target.value;
        setMathExpressions(newMathExpressions);
    };

    return (
        <Box p={5} pr={0} flex="1" maxH={"100vh"} overflowY={"scroll"}>
            <Heading>OpenCalculator</Heading>
            <Heading size="lg">3D Graphing Calculator</Heading>
            <Box pr={5} margin={3}>
                <SliderComponent state={zoomState} title="Zoom" />
                <SliderComponent state={xOffsetState} title="X Offset" />
                <SliderComponent state={yOffsetState} title="Y Offset" />
            </Box>
            <Stack p={2} pr={0}>
                {mathExpressions.map((expression, index) => (
                    <Flex alignItems="center">
                        <Box p={1}>
                            <Popover>
                                <PopoverTrigger>
                                    <Button
                                        backgroundColor="#234233"
                                        borderRadius={50}
                                    ></Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverBody>
                                        <CirclePicker />
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </Box>
                        <Box w="100%">
                            {index + 1 == inputFocus || expression == "" ? (
                                <Input
                                    key={index}
                                    value={expression}
                                    onChange={(e) =>
                                        onExpressionChange(e, index)
                                    }
                                    placeholder="Enter an expression"
                                    size="lg"
                                    variant="filled"
                                    width="100%"
                                    maxWidth="500px"
                                    margin="auto"
                                    marginTop="5"
                                    marginBottom="5"
                                    onFocus={() => setInputFocus(index + 1)}
                                    onBlur={() => setInputFocus(false)}
                                    autoFocus={
                                        mathExpressions.length - 1 === index
                                    }
                                />
                            ) : (
                                <Box
                                    onClick={() => setInputFocus(index + 1)}
                                    p={2}
                                >
                                    <MathComponent
                                        tex={expression}
                                        display={{}}
                                    />
                                </Box>
                            )}
                        </Box>
                        <Box p={2}>
                            <IconButton
                                variant="ghost"
                                colorScheme="red"
                                aria-label="Delete expression"
                                onClick={() => {}}
                                icon={<Icon as={BsTrash} />}
                            />
                        </Box>
                    </Flex>
                ))}
                <Flex alignItems="center" opacity={0.7} onClick={addExpression}>
                    <Box p={1}>
                        <Button
                            backgroundColor="blue"
                            borderRadius={50}
                        ></Button>
                    </Box>
                    <Box w="100%">
                        <Input
                            placeholder="Enter an expression"
                            size="lg"
                            variant="filled"
                            width="100%"
                            maxWidth="500px"
                            margin="auto"
                            marginTop="5"
                            marginBottom="5"
                        ></Input>
                    </Box>
                </Flex>
            </Stack>
        </Box>
    );
};

export default Sidebar;
