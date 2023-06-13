import {atom} from 'recoil';

export const formulaState = atom({
    key: 'formulaState',
    default: '', 
});

export const mathExpressionsState = atom({
    key: 'mathExpressionsState',
    default: [{formula:'', color:{ r: 173, g: 255, b: 47 }}],
});