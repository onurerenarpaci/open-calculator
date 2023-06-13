import { Input } from '@chakra-ui/react'
import { formulaState } from '../../state/formula';
import { inputFocusState } from '../../state/input';
import { useRecoilState } from 'recoil';

const Formula = (props) => {
    const [formula, setFormula] = useRecoilState(formulaState);
    const [inputFocus, setInputFocus] = useRecoilState(inputFocusState);

    const onChange = (event) => {
        setFormula(event.target.value);
    };

    return (
        <Input
        value={formula}
        onChange={onChange}
        placeholder="Enter formula"
        size="lg"
        variant="filled"
        width="100%"
        maxWidth="500px"
        margin="auto"
        marginTop="5"
        marginBottom="5"
        onFocus={() => setInputFocus(true)}
        onBlur={() => setInputFocus(false)}
        />
    );
    }

export default Formula;