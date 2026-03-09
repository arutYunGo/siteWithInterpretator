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
        if(element.type == "number"){
            element.value = Number(valueInput);
        }
        else{
            element.value = valueInput;
        }
    }

    const branches = block.querySelectorAll(".workspace__branch");
    const straightBranches = [];
    branches.forEach((e) => {
        if(e.closest(".block, .code-block") == block){
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

    if(element.type != "if" && element.type != "while"){
        const nextBlock = block.querySelector(".workspace__next-block");

        if(nextBlock && nextBlock.firstElementChild){
            element.next = collectData(nextBlock.firstElementChild);
        }
    }
    else if(element.type == "if"){
        const nextBlock = block.querySelector(".workspace__next-block.next-if");

        if(nextBlock && nextBlock.firstElementChild){
            element.next = collectData(nextBlock.firstElementChild);
        }
    }
    else if(element.type == "while"){
        const nextBlock = block.querySelector(".workspace__next-block.next-while");

        if(nextBlock && nextBlock.firstElementChild){
            element.next = collectData(nextBlock.firstElementChild);
        }
    }

    return element;
}

function executeCurrentBlock(node){
    let left,right;
    switch(node.type){
        case "number":
        case "string":
            return node.value;
        case "bool":
            if(node.value != "true" && node.value != "false" && node.value != "1" && node.value != "0"){
                console.error("ошибка: булеан может быть только true или false(1 или 0)");
                return null;
            }
            if(node.value == "true" || node.value == "1"){
                return true;
            }
            else if(node.value == "false" || node.value == "0"){
                return false;
            }
        case "plus":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            // if(Number(left.value) != Number(right.value)){
            //     if (typeof(left) !== typeof(right)) {
            //         console.error("ошибка: типы аргументов должны совпадать");
            //         return null
            //     }
            // }
            return left + right;
        case "minus":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left - right;
        case "multiply":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left * right;
        case "divide":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left / right;
        case "intDivide":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return Math.trunc(left / right);
        case "mod":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left % right;
        case "power":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left ** right;
        case "var":
            return memory[node.value] || 0; 
        case "assign":
            left = node.childrens[0];
    
            if (!left || left.type !== "var") {
                console.error("ошибка - должна быть переменная");
                return null; 
            }
            right = executeCurrentBlock(node.childrens[1]);
            memory[left.value] = right;
            return right;
        case "print":
            const output = document.querySelector('.workspace__output');
            if(node.childrens == 0){
                return null;
            }
            const print = executeCurrentBlock(node.childrens[0]);

            if (output) {
                output.innerHTML += `<div> ${print}</div>`;
                output.scrollTop = output.scrollHeight;
            }
            return print;
        case "start":
            return null;
        case "if":
            const condition = node.childrens[0] ? executeCurrentBlock(node.childrens[0]) : null;
            
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
            
            while(condition === true){
                countIteration++;
                if(countIteration > maxIteration){
                    console.error("Ошибка: превышен лимит итераций");
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
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left == right ? true : false;
        case "neq":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left != right ? true : false;
        case "lt":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left < right ? true : false;
        case "gt":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left > right ? true : false;
        case "lte":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left <= right ? true : false;
        case "gte":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            return left >= right ? true : false;
        case "and":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            if(left && right){
                return true;
            }
            else{
                return false;
            }
        case "or":
            left = executeCurrentBlock(node.childrens[0]);
            right = executeCurrentBlock(node.childrens[1]);
            if(left || right){
                return true;
            }
            else{
                return false;
            }
        case "not":
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
            return node.childrens.map(child => child ? executeCurrentBlock(child) : null);
        case "setList": { 
            const list = memory[node.value];
            const idx = node.childrens[0] ? executeCurrentBlock(node.childrens[0]) : null;
            const val = node.childrens[1] ? executeCurrentBlock(node.childrens[1]) : null;

            if (Array.isArray(list) && idx !== null) {
                list[Number(idx)] = val;
            }
            return list;
        }
        case "pushList":{
            const list = memory[node.value];
            const val = node.childrens[0] ? executeCurrentBlock(node.childrens[0]) : null;
            if(Array.isArray(list)){
                list.push(val);
            }
            return list;
        }
        case "getList":{
            const list = memory[node.value];
            const idx = node.childrens[0] ? executeCurrentBlock(node.childrens[0]) : null;
            
            if (Array.isArray(list)) {
                return list[Number(idx)]; 
            }
            return null;
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
    let currentNode = node;
    let lastResult = 0;
    

    while (currentNode) {
        lastResult = executeCurrentBlock(currentNode);
        currentNode = currentNode.next;
    }

    return lastResult;
}
const runButton = document.querySelector('#run-btn');

runButton.addEventListener('click',() => {
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