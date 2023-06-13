const TokenType = {
    NUMBER: 'number',
    PLUS: 'plus',
    MINUS: 'minus',
    MULTIPLY: 'multiply',
    DIVIDE: 'divide',
    POWER: 'power',
    LPAREN: 'lparen',
    RPAREN: 'rparen',
    IDENTIFIER: 'identifier',    
    EOF: 'eof',
    EQUAL: 'equal',
}

const MathLookup = {
    // mapping to glsl
    sin: 'sin',
    cos: 'cos',
    tan: 'tan',
    asin: 'asin',
    acos: 'acos',
    atan: 'atan',
    atan2: 'atan',
    pow: 'pow',
    exp: 'exp',
    log: 'log',
    sqrt: 'sqrt',
    abs: 'abs',
}

const VSHADER_START = `attribute vec4 a_position;\nuniform mat4 u_view;\nvoid main() {
    vec4 result = a_position;
    
    // [START CODEGEN]

    `;

const VSHADER_END = `

    // [END CODEGEN]
    gl_Position = u_view*result;
}`;

export const scan = (input) => {
    const tokens = [];
    
    let i = 0;
    while(i<input.length){
        if(input[i] === ' '){
            i++;
            continue;
        }else if(input[i] === '+'){
            tokens.push({type: TokenType.PLUS});
            i++;
            continue;
        }else if(input[i] === '-'){
            tokens.push({type: TokenType.MINUS});
            i++;
            continue;
        }else if(input[i] === '*'){
            i++;
            if(i < input.length && input[i] === '*'){
                tokens.push({type: TokenType.POWER});
                i++;
            }else{
                tokens.push({type: TokenType.MULTIPLY});
            }
            continue;
        }else if(input[i] === '/'){
            tokens.push({type: TokenType.DIVIDE});
            i++;
            continue;
        }else if(input[i] === '^'){
            tokens.push({type: TokenType.POWER});
            i++;
            continue;
        }else if(input[i] === '('){
            tokens.push({type: TokenType.LPAREN});
            i++;
            continue;
        }else if(input[i] === ')'){
            tokens.push({type: TokenType.RPAREN});
            i++;
            continue;
        }else if(input[i] === '='){
            tokens.push({type: TokenType.EQUAL});
            i++;
            continue;
        }else if(/^[A-Z]$/i.test(input[i])){
            let identifier = input[i];
            i++;
            while(i<input.length && /^[A-Z]$/i.test(input[i])){
                identifier += input[i];
                i++;
            }
            tokens.push({type: TokenType.IDENTIFIER, value: identifier});
            continue;
        }else if(/^[0-9]$/i.test(input[i])){
            let number = input[i];
            let dot = false;

            i++;
            while(i<input.length && /^[0-9\.]$/i.test(input[i])){
                if(dot && input[i] === '.')
                    throw new Error('Invalid number: ' + number + input[i]);
                
                if(input[i] === '.') dot = true;
                number += input[i];
                i++;
            }
            tokens.push({type: TokenType.NUMBER, value: number});
            continue;
        }else{
            throw new Error('Invalid character: ' + input[i]);
        }
    }
    tokens.push({type: TokenType.EOF});
    
    return tokens;
}

export const parse = (tokens) => {
    let i = 0;
    const peek = () => tokens[i];
    const consume = () => tokens[i++];
    
    const parsePrimary = () => {
        const token = peek();
        if(token.type === TokenType.NUMBER){
            consume();
            return {type: 'number', value: token.value};
        }else if(token.type === TokenType.IDENTIFIER){
            consume();

            if(peek().type === TokenType.LPAREN){
                consume();
                const node = {type: 'call', name: token.value, args: []};
                while(peek().type !== TokenType.RPAREN){
                    node.args.push(parseExpression());
                    if(peek().type === TokenType.COMMA)
                        consume();
                }
                if(peek().type !== TokenType.RPAREN)
                    throw new Error('Expecting )');
                consume();
                return node;
            }

            return {type: 'identifier', value: token.value};
        }else if(token.type === TokenType.LPAREN){
            consume();
            const node = parseExpression();
            if(peek().type !== TokenType.RPAREN)
                throw new Error('Expecting )');

            consume();
            return node;
        }else{
            throw new Error('Expecting number or identifier');
        }
    }

    const parseFactor = () => {
        let node = parsePrimary();
        while(peek().type === TokenType.POWER){
            consume();
            node = {type: 'power', left: node, right: parsePrimary()};
        }
        return node;
    }

    const parseTerm = () => {
        let node = parseFactor();

        while(peek().type === TokenType.MULTIPLY || peek().type === TokenType.DIVIDE ){
            const token = consume();
          
            node = {type: token.type === TokenType.DIVIDE ? 'divide': 'multiply' , left: node, right: parseFactor()};
        }

        return node;
    }

    const parseExpression = () => {
        let node = parseTerm();

        while(peek().type === TokenType.PLUS || peek().type === TokenType.MINUS){
            const token = consume();
            node = {type: token.type === TokenType.PLUS ? 'plus' : 'minus', left: node, right: parseTerm()};
        }

        return node;
    }

    const parseStatement = () => {
        const node = parseExpression();

        if(peek().type === TokenType.EQUAL){
            consume();
            return {type: 'assign', name: node.value, value: parseExpression()};
        }

        return node;
    }

    const parseProgram = () => {
        const node = parseStatement();

        if(peek().type !== TokenType.EOF)
            throw new Error('Unexpected token: ' + peek().type);

        return node;
    }

    return parseProgram();
}

export const codegen = (node) => {

    const gen = (node) => {
        if(node.type === 'number'){
            if(!node.value.includes('.'))
                return node.value + '.0';

            return node.value;
        }else if(node.type === 'identifier'){
            if(node.value === 'x')
                return 'a_position.x';
            else if(node.value === 'y')
                return 'a_position.y';
    
            throw new Error('Unknown identifier: ' + node.value);
        }else if(node.type === 'call'){
            let args = '';
            for(let i=0; i<node.args.length; i++){
                args += gen(node.args[i]);
                if(i !== node.args.length-1)
                    args += ', ';
            }
            return node.name + '(' + args + ')';
        }else if(node.type === 'plus'){
            return gen(node.left) + ' + ' + gen(node.right);
        }else if(node.type === 'minus'){
            return gen(node.left) + ' - ' + gen(node.right);
        }else if(node.type === 'multiply'){
            return gen(node.left) + ' * ' + gen(node.right);
        }else if(node.type === 'divide'){
            return gen(node.left) + ' / ' + gen(node.right);
        }else if(node.type === 'power'){
            return MathLookup.pow + '(' + gen(node.left) + ', ' + gen(node.right) + ')';
        }else if(node.type === 'call'){
            let args = '';
            for(let i=0; i<node.args.length; i++){
                args += gen(node.args[i]);
                if(i !== node.args.length-1)
                    args += ', ';
            }
            return node.name + '(' + args + ')';
        }
    }

    return VSHADER_START + 'result.z = ' + gen(node) + ';' + VSHADER_END;
}

export const interpret = (node, x, y) => {

    const interp = (node) => {
        if(node.type === 'number'){
            return parseFloat(node.value);
        }else if(node.type === 'identifier'){
            if(node.value === 'x')
                return x;
            else if(node.value === 'y')
                return y;
            throw new Error('Unknown identifier: ' + node.value);
        }else if(node.type === 'call'){
            let args = [];
            for(let i=0; i<node.args.length; i++){
                args.push(interp(node.args[i]));
            }
            return Math[node.name](...args);
        }else if(node.type === 'plus'){
            return interp(node.left) + interp(node.right);
        }else if(node.type === 'minus'){
            return interp(node.left) - interp(node.right);
        }else if(node.type === 'multiply'){
            return interp(node.left) * interp(node.right);
        }else if(node.type === 'divide'){
            return interp(node.left) / interp(node.right);
        }else if(node.type === 'power'){
            return Math.pow(interp(node.left), interp(node.right));
        }else if(node.type === 'assign'){
            if(node.name !== 'z')
                throw new Error('You should either define a custom function or use z!' + node.name);

            return interp(node.value);
        }
    }

    return interp(node);
}