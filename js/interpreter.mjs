// function getBlockData(blockElement){
//     const input = blockElement.querySelector(".workspace__input");
//     const childrens = [];
//     const type = blockElement.firstElementChild.textContent;
//     const value = input.value;
//     return {type,value,childrens}
// }

// const block = document.querySelector(".workspace__numberLiteral-block");

let memory = {};

// block.addEventListener('input', () => {
//     const ob = getBlockData(block);
//     console.log(ob); 
// });


export function collectData(block){
    const element = {}
    let condBranch = null;
    // literals
    if (block.classList.contains("workspace__start-block")) {
        element.type = "start";
    }
    else if(block.classList.contains("workspace__print-block")){
        element.type = "print";
    }
    else if(block.classList.contains("workspace__numberLiteral-block")){
        element.type = "number";
    }
    else if(block.classList.contains("workspace__stringLiteral-block")){
        element.type = "string";
    }
    else if(block.classList.contains("workspace__boolLiteral-block")){
        element.type = "boolean";
    }
    else if(block.classList.contains("workspace__assign-block")){
        element.type = "assign";
    }
    else if(block.classList.contains("workspace__variable-block")){
        element.type = "var";
    }
    else if(block.classList.contains("workspace__if-block")){
        element.type = "if";
        condBranch = block.querySelector(".workspace__branch");
        if(condBranch && condBranch.firstElementChild){
            element.condition = executeCurrentBlock(collectData(condBranch.firstElementChild));
        }
        const thenSlot = block.querySelector(".workspace__next-block.then");
        element.thenBranch = (thenSlot && thenSlot.firstElementChild) ? collectData(thenSlot.firstElementChild) : null;

        const elseSlot = block.querySelector(".workspace__next-block.else");
        element.elseBranch = (elseSlot && elseSlot.firstElementChild) ? collectData(elseSlot.firstElementChild) : null;
    }
    else if(block.classList.contains("workspace__while-block")){
        element.type = "while";
        // condBranch = block.querySelector(".workspace__branch");
        // if(condBranch && condBranch.firstElementChild){
        //     element.condition = executeCurrentBlock(collectData(condBranch.firstElementChild));
        // }
        const loopBodySlot = block.querySelector(".workspace__next-block.loop-body");
        element.bodyBranch = (loopBodySlot && loopBodySlot.firstElementChild) ? collectData(loopBodySlot.firstElementChild) : null;
    }
    // math operators
    else if(block.classList.contains("workspace__plus-block")){
        element.type = "plus";
    }
    else if(block.classList.contains("workspace__minus-block")){
        element.type = "minus";
    }
    else if(block.classList.contains("workspace__multiply-block")){
        element.type = "multiply";
    }
    else if(block.classList.contains("workspace__divide-block")){
        element.type = "divide";
    }
    else if(block.classList.contains("workspace__intDivide-block")){
        element.type = "intDivide";
    }
    else if(block.classList.contains("workspace__mod-block")){
        element.type = "mod";
    }
    else if(block.classList.contains("workspace__power-block")){
        element.type = "power";
    }
    else if(block.classList.contains("workspace__eq-block")){
        element.type = "eq";
    }
    else if(block.classList.contains("workspace__neq-block")){
        element.type = "neq";
    }
    else if(block.classList.contains("workspace__lt-block")){
        element.type = "lt";
    }
    else if(block.classList.contains("workspace__gt-block")){
        element.type = "gt";
    }
    else if(block.classList.contains("workspace__lte-block")){
        element.type = "lte";
    }
    else if(block.classList.contains("workspace__gte-block")){
        element.type = "gte";
    }
    else if(block.classList.contains("workspace__and-block")){
        element.type = "and";
    }
    else if(block.classList.contains("workspace__or-block")){
        element.type = "or";
    }
    else if(block.classList.contains("workspace__not-block")){
        element.type = "not";
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
        if(el.firstElementChild){
            return collectData(el.firstElementChild);
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
        case "boolean":
            if(node.value != "true" || node.value != "false" || node.value != "1" || node.value != "0"){
                console.error("ошибка: булеан может быть только true или false(1 или 0)");
                return null;
            }
            if(node.value == "true" || node.value == "1"){
                return true;
            }
            else if(node.value = "false" || node.value == "0"){
                return false;
            }
        case "plus":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            // if(Number(left.value) != Number(right.value)){
            //     if (typeof(left) !== typeof(right)) {
            //         console.error("ошибка: типы аргументов должны совпадать");
            //         return null
            //     }
            // }
            return left + right;
        case "minus":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return left - right;
        case "multiply":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return left * right;
        case "divide":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return left / right;
        case "intDivide":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return Math.trunc(left / right);
        case "mod":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return left % right;
        case "power":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return left ** right;
        case "var":
            console.log("var: " + memory[node.value]);
            return memory[node.value] || 0; 
        case "assign":
            left = node.childrens[0];
    
            if (!left || left.type !== "var") {
                console.error("ошибка - должна быть переменная");
                return null; 
            }
            right = run(node.childrens[1]);
            memory[left.value] = right;
            return right;
        case "print":
            const output = document.querySelector('.workspace__output');
            if(node.childrens == 0){
                return null;
            }
            const print = run(node.childrens[0]);

            if (output) {
                output.innerHTML += `<div> ${print}</div>`;
                output.scrollTop = output.scrollHeight;
            }
            return print;
        case "start":
            return null;
        case "if":
            if(node.condition != true && node.condition != false){
                console.error("ошибка - нет условия");
                return null;
            }
            const conditionResult = node.condition;
            console.log(conditionResult);
            if(conditionResult){
                if(node.thenBranch){
                    run(node.thenBranch);
                }
            }
            else{
                if(node.elseBranch){
                    run(node.elseBranch);
                }
            }
            return null;
        case "while":
            node.condition = executeCurrentBlock(node.childrens[0]);
            if(node.condition !== true && node.condition !== false){
                console.error("ошибка - нет условия");
                return null;
            }
            console.log(node.condition);
            while(node.condition){
                if(node.bodyBranch){
                    run(node.bodyBranch);
                }
                node.condition = executeCurrentBlock(node.childrens[0]);
                console.log("в while " + node.condition);
            }
            return null;
        case "eq":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return left == right ? true : false;
        case "neq":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return left != right ? true : false;
        case "lt":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return left < right ? true : false;
        case "gt":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return left > right ? true : false;
        case "lte":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return left <= right ? true : false;
        case "gte":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return left >= right ? true : false;
        case "and":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            if(left && right){
                return true;
            }
            else{
                return false;
            }
        case "or":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            if(left || right){
                return true;
            }
            else{
                return false;
            }
        case "not":
            right = run(node.childrens[0])
            if(right){
                return false;
            }
            else{
                return true;
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
    const startBlock = document.querySelector('.workspace__scene .workspace__start-block.code-block');

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