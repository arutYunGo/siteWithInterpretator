class Scope {
    constructor() {
        this.vars = new Map();
    }

    declare(name) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw { message: `Некорректное имя переменной: "${name}"`, node: this, type: 'Scope.declare' };
        }
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
            throw { message: `Некорректное имя переменной: "${name}" (должно начинаться с буквы или '_', далее буквы, цифры, '_')`, node: this, type: 'Scope.declare' };
        }
        if (this.vars.has(name)) {
            throw { message: `Переменная "${name}" уже объявлена`, node: this, type: 'Scope.declare' };
        }
        this.vars.set(name, 0);
    }

    get(name) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw { message: `Некорректное имя переменной: "${name}"`, node: this, type: 'Scope.get' };
        }
        const v = this.vars.get(name);
        if (v === undefined) {
            throw { message: `Переменная "${name}" не найдена`, node: this, type: 'Scope.get' };
        }
        return v;
    }

    set(name, value) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw { message: `Некорректное имя переменной: "${name}"`, node: this, type: 'Scope.set' };
        }
        if (!this.vars.has(name)) {
            throw { message: `Переменная "${name}" не объявлена`, node: this, type: 'Scope.set' };
        }
        this.vars.set(name, value);
    }
}

class Expression {
    evaluate(scope) { throw new Error("Must implement evaluate()"); }
}

class NumberLiteral extends Expression {
    constructor(value, nodeId = null) {
        super();
        this.value = value;
        this.nodeId = nodeId;
    }
    evaluate(scope) { return this.value; }
}

class VariableRef extends Expression {
    constructor(name, nodeId = null) {
        super();
        this.name = name;
        this.nodeId = nodeId;
    }
    evaluate(scope) {
        if (typeof this.name !== 'string' || this.name.trim() === '') {
            throw { message: `Некорректное имя переменной: "${this.name}"`, node: this, type: 'VariableRef' };
        }
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(this.name)) {
            throw { message: `Некорректное имя переменной: "${this.name}" (должно начинаться с буквы или '_', далее буквы, цифры, '_')`, node: this, type: 'VariableRef' };
        }
        try {
            return scope.get(this.name);
        } catch (e) {
            e.message = `Переменная "${this.name}" не найдена`;
            e.node = this;
            e.type = 'VariableRef';
            throw e;
        }
    }
}

class BinaryOp extends Expression {
    constructor(left, op, right, nodeId = null) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
        this.nodeId = nodeId;
    }
    evaluate(scope) {
        const l = this.left.evaluate(scope);
        const r = this.right.evaluate(scope);
        if (!['+', '-', '*', '/', '%'].includes(this.op)) {
            throw { message: `Неизвестная операция: "${this.op}"`, node: this, type: 'BinaryOp' };
        }
        switch (this.op) {
            case '/': if (r === 0) throw { message: `Деление на ноль: ${l} / ${r}`, node: this, type: 'BinaryOp' }; return Math.floor(l / r);
            case '%': if (r === 0) throw { message: `Остаток от деления на ноль: ${l} % ${r}`, node: this, type: 'BinaryOp' }; return l % r;
            case '+': return l + r;
            case '-': return l - r;
            case '*': return l * r;
            default: throw { message: `Неизвестная операция: "${this.op}"`, node: this, type: 'BinaryOp' };
        }
    }
}

class Comparison extends Expression {
    constructor(left, op, right, nodeId = null) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
        this.nodeId = nodeId;
    }
    evaluate(scope) {
        const l = this.left.evaluate(scope);
        const r = this.right.evaluate(scope);
        switch (this.op) {
            case '==': return l === r;
            case '!=': return l !== r;
            case '<': return l < r;
            case '>': return l > r;
            case '<=': return l <= r;
            case '>=': return l >= r;
            default:
                throw { message: `Неизвестный оператор сравнения: "${this.op}"`, node: this, type: 'Comparison' };
        }
    }
}

class Statement {
    execute(scope) { throw new Error("Must implement execute()"); }
}

class AssignStatement extends Statement {
    constructor(variable, expression, nodeId = null) {
        super();
        this.variable = variable;
        this.expression = expression;
        this.nodeId = nodeId;
    }
    execute(scope) {
        try {
            const v = this.expression.evaluate(scope);
            scope.set(this.variable, v);
        } catch (e) {
            if (e.type === 'Scope.set' && e.message.includes('не объявлена')) {
                e.message = `Переменная "${this.variable}" не объявлена`;
                e.node = this;
                e.type = 'AssignStatement';
            }
            throw e;
        }
    }
}

class IfStatement extends Statement {
    constructor(condition, thenBranch, nodeId = null) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.nodeId = nodeId;
    }
    execute(scope) {
        const cond = this.condition.evaluate(scope);
        if (cond) {
            for (const stmt of this.thenBranch) {
                stmt.execute(scope); // ошибка здесь выйдет наружу
            }
        }
    }
}

class DeclareStatement extends Statement {
    constructor(names, nodeId = null) {
        super();
        this.names = names;
        this.nodeId = nodeId;
    }
    execute(scope) {
        for (const n of this.names) {
            try {
                scope.declare(n);
            } catch (e) {
                if (e.type === 'Scope.declare') {
                    let msg;
                    if (e.message.includes('уже объявлена')) {
                        msg = `Переменная "${n}" уже объявлена`;
                    } else if (e.message.includes('Некорректное имя')) {
                        msg = n.trim() === ''
                            ? `Некорректное имя переменной: "${n}"`
                            : `Некорректное имя переменной: "${n}" (должно начинаться с буквы или '_', далее буквы, цифры, '_')`;
                    } else {
                        msg = e.message;
                    }
                    e.message = msg;
                    e.node = this;
                    e.type = 'DeclareStatement';
                }
                throw e;
            }
        }
    }
}

class Interpreter {
    interpret(statements, scope) {
        for (const stmt of statements) {
            stmt.execute(scope);
        }
    }
}

export {
    Interpreter,
    Scope,
    NumberLiteral,
    VariableRef,
    BinaryOp,
    Comparison,
    AssignStatement,
    IfStatement,
    DeclareStatement
};