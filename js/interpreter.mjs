function getBlockData(blockElement){
    const input = blockElement.querySelector(".workspace__input");
    const childrens = [];
    const type = blockElement.firstElementChild.textContent;
    const value = input.value;
    return {type,value,childrens}
}

const block = document.querySelector(".workspace__numberLiteral-block");

let memory = {};

block.addEventListener('input', () => {
    const ob = getBlockData(block);
    console.log(ob); 
});


export function collectData(block){
    const element = {}
    
    if(block.classList.contains("workspace__numberLiteral-block")){
        element.type = "number";
    }
    else if(block.classList.contains("workspace__assign-block")){
        element.type = "assign";
    }
    else if(block.classList.contains("workspace__plus-block")){
        element.type = "plus";
    }
    else if(block.classList.contains("workspace__variable-block")){
        element.type = "var";
    }

    if(block.classList.contains("with-input")){
        if(element.type == "number"){
            element.value = Number(block.querySelector(".workspace__input").value);
        }
        else{
            element.value = block.querySelector(".workspace__input").value;
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
    const nextBlock = block.querySelector(".workspace__next-block");

    if(nextBlock && nextBlock.firstElementChild){
        element.next = collectData(nextBlock.firstElementChild);
    }

    return element;
}

function executeCurrentBlock(node){
    let left,right;
    switch(node.type){
        case "number":
            return node.value;
        case "plus":
            left = run(node.childrens[0]);
            right = run(node.childrens[1]);
            return left + right;
        case "var":
            return memory[node.value] || 0; // 0 - для того, чтобы арифм. операции не ломались
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
            const print = run(node.childrens[0]);

            const output = document.querySelector('.workspace__output');
            output.innerHTML += `<div>> ${valToPrint}</div>`;
            return print;
        default:
            return null;
    }
}


function run(node){
    if(!node) return 0; 
    
    let result = executeCurrentBlock(node);

    if(node.next){
        return run(node.next);
    }
    return result;  
}
const runButton = document.querySelector('#run-btn');

runButton.addEventListener('click',() => {
    const firstBlock = document.querySelector('.code-block');
    console.log(firstBlock);
    
    if(firstBlock){
        const data = collectData(firstBlock);
        console.log("Data tree:", data)
        const result = run(data);
        console.log("Результат: ", result);
    }
    else{
        console.log("На сцене пусто");
    }
})
