import {atom} from 'recoil';

export const formulaState = atom({
    key: 'formulaState',
    default: '', 
});

export const mathExpressionsState = atom({
    key: 'mathExpressionsState',
    default: [''],
});