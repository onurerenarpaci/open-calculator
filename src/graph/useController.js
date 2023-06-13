import { useRef } from 'react';
import  Controller  from './render';

export function useController() {
    const controllerRef = useRef();
    if (!controllerRef.current) {
        controllerRef.current = new Controller();
    }
    return controllerRef.current;
}