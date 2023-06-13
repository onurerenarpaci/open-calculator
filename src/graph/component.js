import m4 from './util/m4.js';

class Component {
    #gl;
    #program;
    #options;
    #points;
    #indexes;
    #transform;
    
    constructor(context, program, {
        primitive,
        points = [],
        indexes = [],
        color = [1, 0, 0, 1],
        elementMode = true
    }) {
        this.#gl = context;
        this.#program = program;
        
        this.#points = points;
        this.#indexes = indexes;
        this.#transform = m4.identity();
        
        this.#options = {
            primitive: primitive,
            color: color,
            elementMode: elementMode
        };
    }
    
    get points(){
        return this.#points;
    }

    get indexes(){
        return this.#indexes;
    }

    set points(points){
        this.#points = points;
    }

    set indexes(indexes){
        this.#indexes = indexes;
    }

    set transform(matrix){
        this.#transform = matrix;
    }

    get options(){
        return this.#options;
    }

    set options(options){
        this.#options = options;
    }
        
    get transform(){
        return this.#transform;
    }

    draw(gl, program){
        if(this.points.length === 0 || (this.#options.elementMode && this.#indexes.length === 0))
            throw new Error("Component: No points to draw");

        if(this.#options.elementMode){
            this.#drawElementMode(gl, program);
        }else{
            this.#drawArrayMode(gl, program);
        }
    }

    #drawElementMode(gl, program){
        // const gl = this.#gl;
        // const program = this.#program;
        const points = this.#points;
        const indexes = this.#indexes;

        const {primitive, color} = this.#options;

        const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionAttributeLocation);
        
        const size = 4;          // 2 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        const count = this.indexes.length;
        
        const modelLoc = gl.getUniformLocation(program, 'u_model');
        gl.uniformMatrix4fv(modelLoc, false, this.#transform);
        
        const colorLoc = gl.getUniformLocation(program, 'u_color');
        gl.uniform4fv(colorLoc, color);
        
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(primitive, count, gl.UNSIGNED_SHORT, offset);
    }

    #drawArrayMode(gl, program){
        throw new Error("Not implemented: Array Mode");
    }

}

class Surface extends Component {
    #width;
    #height;
    #resolution;
    
    constructor(gl, program, {height, width, primitive, resolution, color}) {
        super(gl, program, {
            primitive: primitive || gl.LINES, 
            color
        });
        
        this.#height = height;
        this.#width = width;
        this.#resolution = resolution;

        // uses setters from Component
        this.points = this.#createPoints();
        this.indexes = (primitive === gl.LINES) ? this.#createLineIndexes() : this.#createIndexes();
    }

    #createPoints() {
        const width = this.#width;
        const height = this.#height;
        const resolution = this.#resolution;

        let points = [];
        for (let i = 0; i < height; i += resolution) {
            for (let j = 0; j < width; j += resolution) {
                points.push(i - height/2);
                points.push(j - width/2);
                points.push(0);
                points.push(1);
            }
        }
        return points;
    }

    #createIndexes() {
        const width = this.#width;
        const height = this.#height;
        const resolution = this.#resolution;

        let indexes = [];
        const row_size = width/resolution;
        for (let i = 0; i < height/resolution -1; i++){
            for (let j = 0; j < width/resolution -1; j++) {
                indexes.push(i * row_size + j);
                indexes.push(i * row_size + j + 1);
                indexes.push((i + 1) * row_size + j);
                indexes.push((i + 1) * row_size + j);
                indexes.push(i * row_size + j + 1);
                indexes.push((i + 1) * row_size + j + 1);
            }
        }
        return indexes;
    }

    #createLineIndexes() {
        const indexes = this.#createIndexes();

        let line_indexes = [];
        for (let i = 0; i < indexes.length; i += 3) {
            line_indexes.push(indexes[i]);
            line_indexes.push(indexes[i + 1]);
            line_indexes.push(indexes[i + 1]);
            line_indexes.push(indexes[i + 2]);
            line_indexes.push(indexes[i + 2]);
            line_indexes.push(indexes[i]);
        }
        return line_indexes;
    }
}

class Axis extends Component {
    constructor(gl, program, axe, color) {
        super(gl, program, {
            primitive: gl.TRIANGLES, 
            color: color || [0, 1, 0, 1],
            elementMode: true
        });

        this.axe = axe;
        this.points = this.#createPoints();
        this.indexes = this.#createIndexes();
        // const sc = 0.1
        // this.transform = m4.scaling(axe=='x'? 1 : sc, axe=='y'? 1 : sc, axe=='z'? 1 : sc);
    }

    #createPoints() {
        const sc = 0.003;
        const initial_points = [
            sc, 0, 0, 1,
            sc*Math.cos(Math.PI/4),sc*Math.sin(Math.PI/4), 0, 1,
            0, sc, 0, 1,
            -sc*Math.cos(Math.PI/4), sc*Math.sin(Math.PI/4), 0, 1,
            -sc, 0, 0, 1,
            -sc*Math.cos(Math.PI/4), -sc*Math.sin(Math.PI/4), 0, 1,
            0, -sc, 0, 1,
            sc*Math.cos(Math.PI/4), -sc*Math.sin(Math.PI/4), 0, 1,
        ];

        const distance = 5;
        
        const far_points = []
        for (let i = 0; i < initial_points.length; i += 4) {
            far_points.push(initial_points[i]);
            far_points.push(initial_points[i + 1]);
            far_points.push(distance);
            far_points.push(initial_points[i + 2]);
        }

        const points = initial_points.concat(far_points);

        const transformed_points = [];
        if (this.axe === 'x') {
            for (let i = 0; i < points.length; i += 4) {
                transformed_points.push(points[i + 2]);
                transformed_points.push(points[i + 1]);
                transformed_points.push(points[i]);
                transformed_points.push(points[i + 3]);
            }
        } else if (this.axe === 'y') {
            for (let i = 0; i < points.length; i += 4) {
                transformed_points.push(points[i]);
                transformed_points.push(points[i + 2]);
                transformed_points.push(points[i + 1]);
                transformed_points.push(points[i + 3]);
            }
        }
        else if (this.axe === 'z') {
            return points;
        }
            
        return transformed_points;
    }

    #createIndexes() {
        const indexes = [];
        for (let i = 0; i < 7; i++) {
            indexes.push(i);
            indexes.push(i + 1);
            indexes.push(i + 8);
            indexes.push(i + 1);
            indexes.push(i + 8);
            indexes.push(i + 9);
        }
        return indexes;
    }
    
}

export {Component, Surface, Axis};