import m4 from './util/m4.js';
import vshader from './shader/vshader';
import fshader from './shader/fshader';
import phfshader from './shader/phong/fshader';
import phvshader from './shader/phong/vshader';
import { createProgramFromSources } from './util/shader';
import { Surface, Axis } from './component.js';
import { scan, parse, interpret } from './util/codegen.js';

class Controller {
  #gl;
  #program;
  #cameraMatrix;
  #surfaces = [];
  #axisX;
  #axisY;
  #axisZ;
  #cameraRotationSpeed = [0.0, 0.0, 0.0];
  #rotationMatrix;

  constructor() {}

  init(context) {
    function degToRad(d) {
      return (d * Math.PI) / 180;
    }

    this.#gl = context;
    this.#gl.enable(this.#gl.DEPTH_TEST);

    this.#program = createProgramFromSources(context, vshader, fshader);
    this.#gl.useProgram(this.#program);

    this.#cameraMatrix = m4.lookAt([0.75, 0.0, 0.0], [0, 0, 0], [0, 0, 1])
    this.#rotationMatrix = m4.identity();
    this.#cameraRotationSpeed = [0.0, 0.0, 0.0];

    this.#rotationMatrix = m4.multiply(
      m4.zRotation(degToRad(-30)),
      this.#rotationMatrix
    );

    this.#cameraMatrix = m4.multiply(
      m4.yRotation(degToRad(-20)),
      this.#cameraMatrix
    );

    const gl = this.#gl;
    const program = this.#program;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    const offsetLocColor = gl.getUniformLocation(program, 'u_color');
    gl.uniform4fv(offsetLocColor, [1, 0, 0, 1]);

    const projection = m4.perspective(Math.PI / 2, 1, 0.1, 100);
    const viewMatrix = m4.multiply(projection, this.#cameraMatrix);

    const offsetLoc = gl.getUniformLocation(program, 'u_view');
    gl.uniformMatrix4fv(offsetLoc, false, viewMatrix);

    //axis = new Axis(gl, program);
    this.#axisX = new Axis(gl, program, 'x', [1, 0, 0, 1]);
    this.#axisY = new Axis(gl, program, 'y', [0, 1, 0, 1]);
    this.#axisZ = new Axis(gl, program, 'z', [0, 0, 1, 1]);
  }

  #drawScene() {
    // Clear the canvas
    const gl = this.#gl;
    const program = this.#program;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const projection = m4.perspective(Math.PI / 2, 1, 0.1, 100);
    const viewMatrix = m4.multiply(
      projection, m4.multiply(m4.inverse(this.#cameraMatrix), this.#rotationMatrix));

    const offsetLoc = gl.getUniformLocation(program, 'u_view');
    gl.uniformMatrix4fv(offsetLoc, false, viewMatrix);

    this.#surfaces.forEach(s => s.draw(gl, program));
    this.#axisX.draw(gl, program);
    this.#axisY.draw(gl, program);
    this.#axisZ.draw(gl, program);
  }

  #surfaceAt(index, color) {
    if (this.#surfaces[index]) {
      let options = this.#surfaces[index].options;
      options.color = color;
      this.#surfaces[index].options = options;
      return this.#surfaces[index];
    }

    this.#surfaces.push(new Surface(this.#gl, this.#program, {
      width: 1.1,
      height: 1.1,
      resolution: 0.01,
      color: color,
    }));

    return this.#surfaces[index];
  }

  sample(zoom, expressions, xOffset, yOffset) {
    // distance from camera to origin from all sides
    expressions.forEach((expression, index) => {
      const tokens = scan(expression.formula === '' ? '0' : expression.formula);
      const ast = parse(tokens);

      const normalizedColor = [expression.color.r / 255.0, expression.color.g / 255.0, expression.color.b / 255.0, 1];
      const points = this.#surfaceAt(index, normalizedColor).points;

      const z = Math.max(20 * (1 - zoom / 100.0), 0.01);
      for (let i = 0; i < points.length; i += 4) {
        points[i + 2] =
          (1 / z) *
          interpret(ast, z * points[i] + xOffset, z * points[i + 1] + yOffset);
      }
    });

    //remove unused surfaces
    this.#surfaces = this.#surfaces.slice(0, expressions.length);

    this.render();
  }

  rotateCamera(x, y) {
    function degToRad(d) {
      return (d * Math.PI) / 180;
    }

    this.#cameraRotationSpeed = [degToRad(x) * 0.05, degToRad(y) * 0.05, 0];

    this.render();
  }

  keyNavigate(key) {
    function degToRad(d) {
      return (d * Math.PI) / 180;
    }

    switch (key) {
      case 'ArrowLeft': // Left
      {
        this.#rotationMatrix = m4.multiply(
          m4.zRotation(degToRad(-10)),
          this.#rotationMatrix
        );
        break;
      }
      case 'ArrowUp':
      { // Up
        this.#cameraMatrix = m4.multiply(
          m4.yRotation(degToRad(10)),
          this.#cameraMatrix
        );
        break;
      }
      case 'ArrowRight':
      { // Right
        this.#rotationMatrix = m4.multiply(
          m4.zRotation(degToRad(10)),
          this.#rotationMatrix 
        );
        break;
      }
      case 'ArrowDown':
      { // Down
        this.#cameraMatrix = m4.multiply(
          m4.yRotation(degToRad(-10)),
          this.#cameraMatrix
        );
        break;
      }
    }

    this.render();
  }

  render() {
    if (!this.#gl) throw new Error('Controller not initialized.');

    const gl = this.#gl;

    this.#cameraMatrix = m4.multiply(
      m4.yRotation(-this.#cameraRotationSpeed[0]),
      this.#cameraMatrix
    );

    this.#cameraMatrix = m4.multiply(
      m4.xRotation(this.#cameraRotationSpeed[1]),
      this.#cameraMatrix
    );

    this.#drawScene();
  }
}

export default Controller;
