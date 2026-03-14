// function getBlockData(blockElement){
//     const input = blockElement.querySelector(".workspace__input");
//     const childrens = [];
//     const type = blockElement.firstElementChild.textContent;
//     const value = input.value;
//     return {type,value,childrens}
// }

// const block = document.querySelector(".workspace__numberLiteral-block");

let memory = {};
const maxIteration = 500; // while

// block.addEventListener('input', () => {
//     const ob = getBlockData(block);
//     console.log(ob); 
// });


export function collectData(block){
    const element = {}
    element.htmlElement = block;
    // literals
    if (block.classList.contains("workspace__start")) {
        element.type = "start";
    }
    else if(block.classList.contains("workspace__print")){
        element.type = "print";
    }
    else if(block.classList.contains("workspace__number")){
        element.type = "number";
    }
    else if(block.classList.contains("workspace__string")){
        element.type = "string";
    }
    else if(block.classList.contains("workspace__bool")){
        element.type = "bool";
    }
    else if(block.classList.contains("workspace__assign")){
        element.type = "assign";
    }
    else if(block.classList.contains("workspace__var")){
        element.type = "var";
    }
    else if(block.classList.contains("workspace__if")){
        element.type = "if";
        // condBranch = block.querySelector(".workspace__branch");
        // if(condBranch && condBranch.firstElementChild){
        //     element.condition = executeCurrentBlock(collectData(condBranch.firstElementChild));
        // }
        const thenSlot = block.querySelector(".workspace__next-block.then");
        element.thenBranch = (thenSlot && thenSlot.firstElementChild) ? collectData(thenSlot.firstElementChild) : null;

        const elseSlot = block.querySelector(".workspace__next-block.else");
        element.elseBranch = (elseSlot && elseSlot.firstElementChild) ? collectData(elseSlot.firstElementChild) : null;
    }
    else if(block.classList.contains("workspace__while")){
        element.type = "while";
        // condBranch = block.querySelector(".workspace__branch");
        // if(condBranch && condBranch.firstElementChild){
        //     element.condition = executeCurrentBlock(collectData(condBranch.firstElementChild));
        // }
        const loopBodySlot = block.querySelector(".workspace__next-block.loop-body");
        element.bodyBranch = (loopBodySlot && loopBodySlot.firstElementChild) ? collectData(loopBodySlot.firstElementChild) : null;
    }
    // math operators
    else if(block.classList.contains("workspace__plus")){
        element.type = "plus";
    }
    else if(block.classList.contains("workspace__minus")){
        element.type = "minus";
    }
    else if(block.classList.contains("workspace__multiply")){
        element.type = "multiply";
    }
    else if(block.classList.contains("workspace__divide")){
        element.type = "divide";
    }
    else if(block.classList.contains("workspace__intDivide")){
        element.type = "intDivide";
    }
    else if(block.classList.contains("workspace__mod")){
        element.type = "mod";
    }
    else if(block.classList.contains("workspace__power")){
        element.type = "power";
    }
    else if(block.classList.contains("workspace__eq")){
        element.type = "eq";
    }
    else if(block.classList.contains("workspace__neq")){
        element.type = "neq";
    }
    else if(block.classList.contains("workspace__lt")){
        element.type = "lt";
    }
    else if(block.classList.contains("workspace__gt")){
        element.type = "gt";
    }
    else if(block.classList.contains("workspace__lte")){
        element.type = "lte";
    }
    else if(block.classList.contains("workspace__gte")){
        element.type = "gte";
    }
    else if(block.classList.contains("workspace__and")){
        element.type = "and";
    }
    else if(block.classList.contains("workspace__or")){
        element.type = "or";
    }
    else if(block.classList.contains("workspace__not")){
        element.type = "not";
    }
    // массивы
    else if(block.classList.contains("workspace__createList")){
        element.type = "createList";
    }
    else if(block.classList.contains("workspace__setList")){
        element.type = "setList";
    }
    else if(block.classList.contains("workspace__pushList")){
        element.type = "pushList";
    }
    else if(block.classList.contains("workspace__getList")){
        element.type = "getList";
    }
    else if(block.classList.contains("workspace__lengthList")){
        element.type = "lengthList";
    }
    else if(block.classList.contains("workspace__listConstructor")){
        element.type = "listConstructor";
    }

    if(block.classList.contains("with-input")){
        const valueInput = block.querySelector(".workspace__input").value;
        if(element.type === "number"){
            element.value = Number(valueInput);
        }
        else{
            element.value = valueInput;
        }
    }

    const branches = block.querySelectorAll(".workspace__branch");
    const straightBranches = [];
    branches.forEach((e) => {
        if(e.closest(".block, .code-block") === block){
            straightBranches.push(e);
        }
    });
    element.childrens = straightBranches.map((el) => {
        if(el.querySelector(".code-block")){
            return collectData(el.querySelector(".code-block"));
        }
        else{
            return null;
        } 
    });

    if(element.type !== "if" && element.type !== "while"){
        const nextBlock = block.querySelector(".workspace__next-block");

        if(nextBlock && nextBlock.firstElementChild){
            element.next = collectData(nextBlock.firstElementChild);
        }
    }
    else if(element.type === "if"){
        const nextBlocks = block.querySelectorAll(".workspace__next-block.next-if");
        for(const el of nextBlocks){
            if(el.closest(".code-block, .block") === block){
                const nextBlock = el;
                if(nextBlock && nextBlock.firstElementChild){
                    element.next = collectData(nextBlock.firstElementChild);
                }
            }
        }
    }
    else if(element.type === "while"){
        const nextBlocks = block.querySelectorAll(".workspace__next-block.next-while");

        for(const el of nextBlocks){
            if(el.closest(".code-block, .block") === block){
                const nextBlock = el;
                if(nextBlock && nextBlock.firstElementChild){
                    element.next = collectData(nextBlock.firstElementChild);
                }
            }
        }
    }
    return element;
}

function executeCurrentBlock(node){
    if (!node) return null;
    let left,right, t;
    switch(node.type){
        case "number":
            if(typeof(node.value) !== "number"){
                throw {message: "Ошибка: неправильный инпут", node: node};
            }
            return node.value;
        case "string":
            return node.value;
        case "bool":
            if(node.value !== "true" && node.value !== "false" && node.value !== "1" && node.value !== "0"){
                throw {message: "Ошибка: булеан может быть только true или false(1 или 0)", node: node};
            }
            if(node.value === "true" || node.value === "1"){
                return true;
            }
            else if(node.value === "false" || node.value === "0"){
                return false;
            }
        case "plus":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            if (typeof(left) !== typeof(right)) {
                throw {message: "Ошибка: типы аргументов должны совпадать", node: node};
            }
            return left + right;
        case "minus":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            if (typeof(left) !== typeof(right)) {
                throw {message: "Ошибка: типы аргументов должны совпадать", node: node};
            }
            return left - right;
        case "multiply":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            if (typeof(left) !== typeof(right)) {
                throw {message: "Ошибка: типы аргументов должны совпадать", node: node};
            }
            return left * right;
        case "divide":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            if (typeof(left) !== typeof(right)) {
                throw {message: "Ошибка: типы аргументов должны совпадать", node: node};
            }
            return left / right;
        case "intDivide":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            if (typeof(left) !== typeof(right)) {
                throw {message: "Ошибка: типы аргументов должны совпадать", node: node};
            }
            return Math.trunc(left / right);
        case "mod":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            if (typeof(left) !== typeof(right)) {
                throw {message: "Ошибка: типы аргументов должны совпадать", node: node};
            }
            return (left % right);
        case "power":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            if (typeof(left) !== typeof(right)) {
                throw {message: "Ошибка: типы аргументов должны совпадать", node: node};
            }
            return left ** right;
        case "var":
            // сделать чтобы в переменной нельзя было вводить цифру!!!!!
            if(!(node.value in memory)){
                throw { message: "Ошибка: переменная не найдена", node: node};
            }
            return memory[node.value] || 0; 
        case "assign":
            left = node.childrens[0];
    
            if (!left || left.type !== "var") {
                throw{message: "ошибка - должна быть переменная",node: node.childrens[0]};
            }
            let rightNode = node.childrens[1];
            if (!rightNode) {
                throw {message: "Ошибка: нечего присваивать", node: node};
            }
            t = rightNode.type;
            if(t === "start" || t ==="print" || t === "if" || t === "while" ||
                t === "setList" || t === "pushList"
            ){
                throw {message: "Ошибка: неправильно вставленный блок", node: node.childrens[1]};
            }
            right = executeCurrentBlock(rightNode);
            memory[left.value] = right;
            return right;
        case "print":
            const output = document.querySelector('.workspace__output');
            if(!node.childrens[0]){
                throw {message: "Ошибка: print пуст", node: node};
            }
            const print = executeCurrentBlock(node.childrens[0]);
            t = node.childrens[0].type;
            console.log(node.childrens[0]);
            if(t === "start" || t ==="print" || t === "if" || t === "while" ||
                t === "setList" || t === "pushList" || t === "createList" ||
                t === "listConstructor"
            ){
                throw {message: "Ошибка: неправильно вставленный блок", node: node.childrens[0]};
            }
            if (output) {
                output.innerHTML += `<div> ${print}</div>`;
                output.scrollTop = output.scrollHeight;
            }
            return print;
        case "start":
            return null;
        case "if":
            const condition = node.childrens[0] ? executeCurrentBlock(node.childrens[0]) : null;
            t = node.childrens[0].type;
            if(t === "start" || t ==="print" || t === "if" || t === "while" ||
                t === "setList" || t === "pushList" || t === "createList" || 
                t === "listConstructor" || t === "getList" || t === "lengthList" || 
                t === "number" || t === "string" || t === "bool" || t === "var" ||
                t === "assign"
            ){
                throw {message: "Ошибка: условие блока if может иметь только возвращаемое значение bool", node: node.childrens[0]};
            }
            
            if(condition === true){
                if(node.thenBranch) run(node.thenBranch);
            }
            else {
                if(node.elseBranch) run(node.elseBranch);
            }
            return null;
        case "while": {
            let condition = node.childrens[0] ? executeCurrentBlock(node.childrens[0]) : false;
            let countIteration = 0;
            t = node.childrens[0].type;
            if(t === "start" || t ==="print" || t === "if" || t === "while" ||
                t === "setList" || t === "pushList" || t === "createList" || 
                t === "listConstructor" || t === "getList" || t === "lengthList" || 
                t === "number" || t === "string" || t === "bool" || t === "var" ||
                t === "assign"
            ){
                throw {message: "Ошибка: условие блока while может иметь только возвращаемое значение", node: node.childrens[0]};
            }
            
            while(condition === true){
                countIteration++;
                if(countIteration > maxIteration){
                    console.error("Ошибка");
                    return null;
                }
                if(node.bodyBranch){
                    run(node.bodyBranch);
                }
                condition = node.childrens[0] ? executeCurrentBlock(node.childrens[0]) : false;
            }
            return null;
        }
        case "eq":
            wrongValue(node.childrens[0],node);
            wrongValue(node.childrens[1],node);

            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left === right ? true : false;
        case "neq":
            wrongValue(node.childrens[0],node);
            wrongValue(node.childrens[1],node);
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left !== right ? true : false;
        case "lt":
            wrongValue(node.childrens[0],node);
            wrongValue(node.childrens[1],node);
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left < right ? true : false;
        case "gt":
            wrongValue(node.childrens[0],node);
            wrongValue(node.childrens[1],node);
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left > right ? true : false;
        case "lte":
            wrongValue(node.childrens[0],node);
            wrongValue(node.childrens[1],node);
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left <= right ? true : false;
        case "gte":
            wrongValue(node.childrens[0],node);
            wrongValue(node.childrens[1],node);
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left >= right ? true : false;
        case "and":
            wrongValue(node.childrens[0],node);
            wrongValue(node.childrens[1],node);
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            if(left && right){
                return true;
            }
            else{
                return false;
            }
        case "or":
            wrongValue(node.childrens[0],node);
            wrongValue(node.childrens[1],node);
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            if(left || right){
                return true;
            }
            else{
                return false;
            }
        case "not":
            wrongValue(node.childrens[0],node);
            right = executeCurrentBlock(node.childrens[0])
            if(right){
                return false;
            }
            else{
                return true;
            }
        case "createList":
            return [];
        case "listConstructor":
            return node.childrens.map(child => {
                if (!child) throw {message: "Ошибка: пустая ячейка в конструкторе", node: node};
                t = child.type;
                if(t === "number" || t === "var" || t === "string" || t === "bool" ||
                    t === "plus" || t === "minus" || t === "divide" || t === "intDivide" ||
                    t === "multiply" || t === "mod" || t === "power"
                ){
                    return executeCurrentBlock(child);
                }
                else{
                    throw {message: "Ошибка: в ветке блока должен быть блок литерала",node: child};
                }
            });
        case "setList": { 
            if(!node.childrens[0] || !node.childrens[1]){
                throw {message: "Ошибка: должен быть блок в ветке", node: node};
            }
            t = node.childrens[0].type;
            let t1 = node.childrens[1].type;
            if(t === "number" || t === "var" || t === "plus" || t === "minus" || t === "divide" || t === "intDivide" ||
                    t === "multiply" || t === "mod" || t === "power"){
                if(t1 === "number" || t1 === "var" || t1 === "string" || t1 === "bool" || t1 === "plus" || t1 === "minus" || t1 === "divide" || t1 === "intDivide" ||
                    t1 === "multiply" || t1 === "mod" || t1 === "power" || t1 === "getList" || t1 === "lengthList"){
                    const list = memory[node.value];
                    const idx = node.childrens[0] ? executeCurrentBlock(node.childrens[0]) : null;
                    const val = node.childrens[1] ? executeCurrentBlock(node.childrens[1]) : null;

                    if (Array.isArray(list) && idx !== null) {
                        list[Number(idx)] = val;
                    }
                    return list;
                }
                else{
                    throw {message: "Ошибка: во второй ветке должен быть блок литерала",node: node.childrens[1]}
                }
            }
            else{
                throw {message: "Ошибка: в первой ветке должно быть число",node: node.childrens[0]}
            }
        }
        case "pushList":{
            if(!node.childrens[0]){
                throw {message: "Ошибка: должен быть блок в ветке", node: node};
            }
            t = node.childrens[0].type;
            if(t === "number" || t === "var" || t === "string" || t === "bool" || t === "plus" || t === "minus" || t === "divide" || t === "intDivide" ||
                t === "multiply" || t === "mod" || t === "power"){
                const list = memory[node.value];
                const val = node.childrens[0] ? executeCurrentBlock(node.childrens[0]) : null;
                if(Array.isArray(list)){
                    list.push(val);
                }
                return list;
            }
            else{
                throw {message: "Ошибка: в ветке блока должен быть блок литерала",node: node.childrens[0]}
            }
        }
        case "getList":{
            if(!Array.isArray(memory[node.value])){
                throw {message: "Ошибка: данного массива не существует", node: node};
            }
            if(!node.childrens[0]){
                throw {message: "Ошибка: должен быть блок числа или переменной", node: node};
            }
            t = node.childrens[0].type;
            if(t === "number" || t === "var" || t === "plus" || t === "minus" || t === "divide" || t === "intDivide" ||
                    t === "multiply" || t === "mod" || t === "power"){
                const list = memory[node.value];
                const idx = node.childrens[0] ? executeCurrentBlock(node.childrens[0]) : null;
                if (!Number.isInteger(idx)) {
                    throw { message: "Ошибка: индекс должен быть целым числом", node: node.childrens[0] };
                }
                if(idx >= list.length || idx < 0){
                    throw {message: "Ошибка: данного индекса нет в массиве", node: node.childrens[0]};
                }
                
                if (Array.isArray(list)) {
                    return list[Number(idx)]; 
                }
                return null;
            }
            else{
                throw {message: "Ошибка: в ветке блока должен быть блок числа или переменной",node: node.childrens[0]}
            }
        }

        case "lengthList":{
            const list = memory[node.value];
            return Array.isArray(list) ? list.length : 0;
        }
        default:
            return null;
    }
}

// При ошибках сделать подсвечивание и красном и что нибудь, что будет блокировать всю программу или, если в start имеется подсвеченный красный блок
// то ему нельзя выполняться что то такое


function run(node){
    try{
        let currentNode = node;
        let lastResult = 0;
        

        while (currentNode) {
            lastResult = executeCurrentBlock(currentNode);
            currentNode = currentNode.next;
        }

        return lastResult;
    }
    catch(error){
        console.error(error.message);

        if(error.node && error.node.htmlElement){
            error.node.htmlElement.classList.add("block-error");
        }
        const output = document.querySelector('.workspace__output');
        if (output) {
            output.innerHTML += `<div style="color: red; font-weight: bold;">! ${error.message}</div>`;
        }
    }
}
const runButton = document.querySelector('#run-btn');

runButton.addEventListener('click',() => {
    clearErrors();

    const startBlock = document.querySelector('.workspace__scene .workspace__start.code-block');

    if (!startBlock) {
        console.warn("Программа не начата, т.к. нет блока START!");
        return;
    }

    const data = collectData(startBlock);

    memory = {};
    
    if(data.next){
        // console.log("Начало программы");
        run(data.next);
        // console.log("Конец программы");
    }
    else{
        console.log("Start пуст");
    }
    console.log(memory)
})

const rstButton = document.querySelector('#rst-btn');

rstButton.addEventListener('click',() =>{
    location.reload();
})

function clearErrors() {
    const errorBlocks = document.querySelectorAll('.block-error'); 
    
    errorBlocks.forEach(block => {
        block.classList.remove("block-error");
    });
}

function wrongValue(node,parentNode){
    if(!node){
        throw {message: "Ошибка: ветка не имеет блока",node: parentNode};
    }
    let t = node.type;
    if(t === "start" || t ==="print" || t === "if" || t === "while" ||
                t === "setList" || t === "pushList" || t === "createList" ||
                t === "listConstructor" || t === "assign"
            ){
                throw {message: "Ошибка: ветка блока может иметь только возвращаемое значение", node: node};
            }
}