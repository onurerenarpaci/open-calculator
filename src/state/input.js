import {atom} from 'recoil';

export const inputFocusState = atom({
    key: 'inputFocusState',
    default: false, 
});

export const zoomState = atom({
    key: 'zoomState',
    default: 50,
});

export const xOffsetState = atom({
    key: 'xOffsetState',
    default: 0,
});

export const yOffsetState = atom({
    key: 'yOffsetState',
    default: 0,
});
