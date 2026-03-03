class Scope {
    constructor() {
        this.vars = new Map();
    }
    declare(name) {
        if (!name || typeof name !== 'string' || name.trim() === '') throw new Error(`Имя переменной пустое`);
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) throw new Error(`Некорректное имя "${name}"`);
        if (this.vars.has(name)) throw new Error(`Переменная "${name}" уже существует`);
        this.vars.set(name, 0);
    }
    get(name) {
        if (!this.vars.has(name)) throw new Error(`Переменная "${name}" не найдена`);
        return this.vars.get(name);
    }
    set(name, value) {
        if (!this.vars.has(name)) throw new Error(`Переменная "${name}" не объявлена`);
        this.vars.set(name, value);
    }
}

class Node {
    constructor(nodeId) {
        this.nodeId = nodeId || `temp-${Math.random()}`;
    }
    createError(message) {
        return { message, nodeId: this.nodeId, type: this.constructor.name };
    }
}

class NumberLiteral extends Node {
    constructor(value, nodeId) { super(nodeId); this.value = Number(value); }
    evaluate() { return Math.floor(this.value); }
}

class VariableRef extends Node {
    constructor(name, nodeId) { super(nodeId); this.name = name; }
    evaluate(scope) {
        try { return scope.get(this.name); } catch (e) { throw this.createError(e.message); }
    }
}

class BinaryOp extends Node {
    constructor(left, op, right, nodeId) {
        super(nodeId); this.left = left; this.op = op; this.right = right;
    }
    evaluate(scope) {
        if (!this.left || !this.right) throw this.createError("Математическая операция не заполнена");
        const l = this.left.evaluate(scope);
        const r = this.right.evaluate(scope);
        switch (this.op) {
            case '+': return l + r;
            case '-': return l - r;
            case '*': return l * r;
            case '/': if (r === 0) throw this.createError("Деление на ноль"); return Math.floor(l / r);
            case '%': if (r === 0) throw this.createError("Остаток от деления на ноль"); return l % r;
            default: throw this.createError("Неизвестный оператор");
        }
    }
}

class Comparison extends Node {
    constructor(left, op, right, nodeId) {
        super(nodeId); this.left = left; this.op = op; this.right = right;
    }
    evaluate(scope) {
        if (!this.left || !this.right) throw this.createError("Сравнение не заполнено");
        const l = this.left.evaluate(scope);
        const r = this.right.evaluate(scope);
        switch (this.op) {
            case '==': return l === r;
            case '!=': return l !== r;
            case '>':  return l > r;
            case '<':  return l < r;
            case '>=': return l >= r;
            case '<=': return l <= r;
            default: throw this.createError("Ошибка сравнения");
        }
    }
}

class LogicalOp extends Node {
    constructor(left, op, right, nodeId) {
        super(nodeId); this.left = left; this.op = op; this.right = right;
    }
    evaluate(scope) {
        if (!this.left || !this.right) throw this.createError("Логическое выражение не заполнено");
        const l = this.left.evaluate(scope);
        const r = this.right.evaluate(scope);
        switch (this.op) {
            case 'AND': return l && r;
            case 'OR':  return l || r;
            default: throw this.createError("Неизвестный логический оператор");
        }
    }
}

class NotOp extends Node {
    constructor(expression, nodeId) { super(nodeId); this.expression = expression; }
    evaluate(scope) {
        if (!this.expression) throw this.createError("Пустое выражение после NOT");
        return !this.expression.evaluate(scope);
    }
}

class DeclareStatement extends Node {
    constructor(names, nodeId) { super(nodeId); this.names = names; }
    execute(scope) {
        for (const name of this.names) {
            try { scope.declare(name); } catch (e) { throw this.createError(e.message); }
        }
    }
}

class AssignStatement extends Node {
    constructor(varName, expression, nodeId) {
        super(nodeId); this.varName = varName; this.expression = expression;
    }
    execute(scope) {
        if (!this.expression) throw this.createError("Значение не указано");
        const val = this.expression.evaluate(scope);
        try { scope.set(this.varName, val); } catch (e) { throw this.createError(e.message); }
    }
}

class IfStatement extends Node {
    constructor(condition, thenBranch, elseBranch, nodeId) {
        super(nodeId);
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch; 
    }
    execute(scope) {
        if (!this.condition) throw this.createError("Условие IF не заполнено");
        
        if (this.condition.evaluate(scope)) {
            for (const stmt of this.thenBranch) if (stmt) stmt.execute(scope);
        } else if (this.elseBranch) {
            for (const stmt of this.elseBranch) if (stmt) stmt.execute(scope);
        }
    }
}

class Interpreter {
    interpret(statements) {
        const scope = new Scope();
        try {
            for (const stmt of statements) if (stmt) stmt.execute(scope);
            return { success: true, vars: Object.fromEntries(scope.vars) };
        } catch (error) {
            return { success: false, error: error.nodeId ? error : { message: error.message, nodeId: "root" } };
        }
    }
}

export { 
    Interpreter, Scope, NumberLiteral, VariableRef, BinaryOp, 
    Comparison, LogicalOp, NotOp, DeclareStatement, AssignStatement, IfStatement 
};