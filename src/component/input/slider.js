import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Text,
  Container,
} from '@chakra-ui/react';
import { useRecoilState } from 'recoil';

const SliderComponent = props => {
  const [value, setValue] = useRecoilState(props.state);
  return (
    <Container>
        <Text fontSize='lg' align={'left'}>{props.title}</Text>
      <Slider
        aria-label="slider-ex-1"
        defaultValue={30}
        onChange={setValue}
        value={value}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Container>
  );
};

export default SliderComponent;
