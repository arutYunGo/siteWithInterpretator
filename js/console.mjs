const output = document.querySelector(".workspace__output");
const input = document.querySelector(".workspace__input");

input.addEventListener("keydown",(e) => {
    if(e.key !== "Enter") return;
    const cmd = input.value;
    
    output.innerHTML += `<div>> ${cmd}</div>`;
    output.innerHTML += `<div>Команда "${cmd}" выполнена</div>`;
    input.value = '';
});

