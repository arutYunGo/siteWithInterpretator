import {collectData} from './interpreter.mjs';
const saveBtn = document.querySelector("#save-btn");

saveBtn.addEventListener("click", () => {
    const startBlock = document.querySelector(".workspace__start-block");
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