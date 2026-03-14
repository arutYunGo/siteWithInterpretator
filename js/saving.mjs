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

fileInput.addEventListener("change",(e) => {
    const file = e.target.files[0];
    console.log("Имя файла:", file.name);
    console.log("Размер:", file.size, "байт");
    
    const reader = new FileReader();

    reader.onload = (e) => {
        console.log(e.target.result);
        parseText(e.target.result);
    } 
    reader.onerror = () => console.error("Ошибка при чтении файла");

    reader.readAsText(file);
});

function parseText(text){
    try{
        const data = JSON.parse(text);
        const scene = document.querySelector(".workspace__scene");
        scene.innerHTML = "";
        console.log("parse:", data);

        const code = collectBlock(data);
        if(code) {
            code.style.position = "absolute";
            
            code.style.left = "5000px";
            code.style.top = "5000px";
            scene.appendChild(code);
        }
    }
    catch{
        console.error("Неправильный файл", error);
    }
}

function collectBlock(data){
    if (!data) return null;
    const tmp = document.querySelector(`.workspace__block-palette .workspace__${data.type}`);
    if(!tmp){
        console.error("ошибка", error);
    }

    const element = tmp.cloneNode(true);
    element.classList.add("code-block");
    element.classList.remove("block");

    if(data.value !== undefined){
        const input = element.querySelector(".workspace__input");
        if(input) input.value = data.value;
    }

    if (data.childrens && data.childrens.length > 0) {
        let branches = element.querySelectorAll(".workspace__branch");
        
        if (data.childrens.length > branches.length) {
            if(branches[0]){
                const branchContainer = branches[0].parentElement;
                if (branchContainer) {
                    const needBranches = data.childrens.length - branches.length;
                    for (let i = 0; i < needBranches; i++) {
                        const newBranch = branches[0].cloneNode(true);
                        newBranch.innerHTML = ""; 
                        branches[0].after(newBranch);
                    }
                    branches = element.querySelectorAll(".workspace__branch");
                }
            }
        }

        data.childrens.forEach((child, idx) => {
            if (child && branches[idx]) {
                const childData = collectBlock(child);
                if (childData) {
                    branches[idx].appendChild(childData);
                }
            }
        });
    }

    if(data.type === "if"){
        if(data.thenBranch){
            element.querySelector(".then").appendChild(collectBlock(data.thenBranch));
        }
        if (data.elseBranch) {
            element.querySelector(".else").appendChild(collectBlock(data.elseBranch));
        }
    }
    else if(data.type === "while"){
        if(data.bodyBranch){
            element.querySelector(".loop-body").appendChild(collectBlock(data.bodyBranch));
        }
    }
    if (data.next) {
        let nextContainer = null;

        if (data.type === "if") {
            nextContainer = element.querySelector(".next-if");
        } else if (data.type === "while") {
            nextContainer = element.querySelector(".next-while");
        } else {
            nextContainer = element.querySelector(".workspace__next-block");
        }

        if (nextContainer) {
            nextContainer.appendChild(collectBlock(data.next));
        }
    }
    return element;
}
