import {collectData} from './interpreter.mjs';
const saveBtn = document.querySelector("#save-btn");


saveBtn.addEventListener("click", () => {
    const startBlock = document.querySelector(".workspace__start.code-block");
    const data = collectData(startBlock);
    saveToFile(data);
})

function saveToFile(data){
    const codeString = JSON.stringify(data,null,2);
    
    const codeBlob = new Blob([codeString],{type: "application/json"});

    const tempUrl = URL.createObjectURL(codeBlob);

    const link = document.createElement("a");
    link.href = tempUrl;
    console.log(link.href);

    link.download = "test_logic.json";

    link.click();

    URL.revokeObjectURL(tempUrl); 
}

const fileInput = document.querySelector("#file-input"); 
























// fileInput.addEventListener("change",(e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     console.log("Имя файла:", file.name);
//     console.log("Размер:", file.size, "байт");

//     const reader = new FileReader();
//     reader.onload = (e) => {
//         collectBlock(e.target.result);
//         console.log(e.target.result);
//     }
    
//     reader.onerror = () => console.error("Ошибка при чтении файла");

//     reader.readAsText(file);
// });

// function collectBlock(text){
//     try{
//         const data = JSON.parse(text);

//         console.log("Объект готов к работе:", data);

//         showCode(data);
//     }
//     catch (error) {
//         console.error("Файл поврежден или это не JSON:", error);
//     }
// }

// const typeToClass = {

//     "start": "start-block",
//     "print": "print-block",
    
  
//     "number": "numberLiteral-block",   
//     "string": "stringLiteral-block",   
//     "boolean": "boolLiteral-block",   
//     "var": "variable-block",      
//     "assign": "assign-block",
    
   
//     "createList": "create-list-block",      
//     "listConstructor": "list-constructor-block",
//     "setList": "set-list-block",            
//     "pushList": "push-list-block",    
//     "getList": "get-list-block",            
//     "lengthList": "length-list-block",     

//     "if": "if-block",
//     "while": "while-block",

//     "plus": "plus-block",
//     "minus": "minus-block",
//     "multiply": "multiply-block",
//     "divide": "divide-block",
//     "intDivide": "intDivide-block",
//     "mod": "mod-block",
//     "power": "power-block",

//     "eq": "eq-block",
//     "neq": "neq-block",
//     "lt": "lt-block",
//     "gt": "gt-block",
//     "lte": "lte-block",
//     "gte": "gte-block",
//     "and": "and-block",
//     "or": "or-block",
//     "not": "not-block"
// };

// function showCode(block){
//     const blockClass = typeToClass[block.type];
//     const temp = document.querySelector(`.workspace__block-palette .workspace__${blockClass}`);
//     if (!template) {
//         console.error("Шаблон не найден для типа:", blockData.type);
//         return null;
//     }

//     const element = temp.cloneNode(true);
//     element.classList.add("code-block");
//     element.classList.remove("block");

//     if (block.value !== undefined) {
//         const input = element.querySelector(".workspace__input");
//         if (input) input.value = block.value;
//     }

//     if(blockData.childrens && blockData.childrens.length > 0){
//         const branchs = element.querySelectorAll(".workspace__branch");
//         block.childrens.forEach((child, idx) => {
//             if (child && branchs[idx]){
//                 const childData = showCode(child);
//                 if(childData) branchs[idx].appendChild(childData);
//             }
//         });
//     }

//     if (block.type === "if") {
//         const thenSlot = element.querySelector(".then");
//         const elseSlot = element.querySelector(".else");
        
//         // Вызываем эту же функцию для вложенных блоков!
//         if (block.thenBranch) {
//             thenSlot.appendChild(showCode(block.thenBranch));
//         }
//         if (block.elseBranch) {
//             elseSlot.appendChild(showCode(block.elseBranch));
//         }
//     }
//     else if(block.type == "while"){
//         if (block.bodyBranch) {
//             element.querySelector(".loop-body").appendChild(showCode(block.bodyBranch));
//         }
//     }


//     if (block.next) {
//         let nextContainer;
//         if (block.type == 'if') {
//             nextContainer = element.querySelector(".next-if");
//         } else if (block.type == 'while') {
//             nextContainer = element.querySelector(".next-while");
//         } else {
//             nextContainer = element.querySelector(".workspace__next-block");
//         }

//         if (nextContainer) {
//             const nextNode = showCode(block.next);
//             if (nextNode) nextContainer.appendChild(nextNode);
//         }
//     }

//     return element;
// }