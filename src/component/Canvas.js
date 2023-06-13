import React, { useRef, useLayoutEffect, useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { inputFocusState, zoomState, xOffsetState, yOffsetState } from '../state/input';
import { mathExpressionsState } from '../state/formula';
import { useController } from '../graph/useController';

const Canvas = () => {
  const controller = useController();
  const [inputFocus, setInputFocus] = useRecoilState(inputFocusState);
  const [zoom, setZoom] = useRecoilState(zoomState);
  const [xOffset, setXOffset] = useRecoilState(xOffsetState);
  const [yOffset, setYOffset] = useRecoilState(yOffsetState);
  const [mathExpressions, setMathExpressions] = useRecoilState(mathExpressionsState);

  useEffect(() => {
    try {
      controller?.sample(zoom, mathExpressions, xOffset, yOffset);
    } catch (e) {
      console.log(e);
    }
  }, [zoom,mathExpressions,xOffset,yOffset]);

  const displayWidth = 739;
  const displayHeight = 739;
  const scale = 2;
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    canvas.width = displayWidth * scale;
    canvas.height = displayHeight * scale;
    const gl = canvas?.getContext('webgl', {});

    if (!gl) console.log('WebGL is not supported for your device!');
    controller.init(gl);
    /*
    var dragging = false;
    var lastX = -1,
      lastY = -1;
    canvas.onmousedown = function (ev) {
      var x = ev.clientX,
        y = ev.clientY;
      var rect = ev.target.getBoundingClientRect();
      if (
        rect.left <= x &&
        x < rect.right &&
        rect.top <= y &&
        y < rect.bottom
      ) {
        lastX = x;
        lastY = y;
        dragging = true;
      }
    };
    canvas.onmouseup = function (ev) {
      dragging = false;
      controller.rotateCamera(0, 0);
    };
    canvas.onmousemove = function (ev) {
      var x = ev.clientX,
        y = ev.clientY;
      if (dragging) {
        var factor = 100 / canvas.height;
        var dx = factor * (x - lastX);
        var dy = factor * (y - lastY);
        //currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
        //currentAngle[1] = currentAngle[1] + dx;
        //controller.rotateCamera(...currentAngle);
      }
      lastX = x;
      lastY = y;
    };*/
    /*
    setInterval(() => {
      controller?.render();
    }, 10);*/

    controller.render();
    controller?.sample(zoom, mathExpressions, xOffset, yOffset);
  }, []);

  const checkKeyPress = useCallback(
    e => {
      if (inputFocus) return;
      controller?.keyNavigate(e.key);
    },
    [inputFocus]
  );

  useEffect(() => {
    window.addEventListener('keydown', checkKeyPress);
    return () => {
      window.removeEventListener('keydown', checkKeyPress);
    };
  }, [checkKeyPress]);

  return (
    <canvas
      ref={ref}
      style={{
        background: '#000',
        width: '100%',
        height: '100%',
      }}
    ></canvas>
  );
};

export default Canvas;
