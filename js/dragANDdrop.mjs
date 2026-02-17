const palette = document.querySelector(".workspace__block-palette");
const editor = document.querySelector(".workspace__code-editor");
let draggingBlock = null;

let clickInsideBLockX = 0;
let clickInsideBLockY = 0;    

palette.addEventListener("pointerdown", (e) => {
    const isBlock = e.target.classList.contains("block");
    if(!isBlock) return;

    const clone = e.target.cloneNode(true);
    clone.classList.remove("block");
    clone.classList.add("code-block");

    document.body.append(clone);
    draggingBlock = clone;

    const cordOriginalBlock = e.target.getBoundingClientRect();

    clickInsideBLockX = e.clientX - cordOriginalBlock.left;
    clickInsideBLockY = e.clientY - cordOriginalBlock.top;

    clone.style.position = "absolute";
    clone.style.left = e.clientX - clickInsideBLockX + 'px';
    clone.style.top = e.clientY - clickInsideBLockY + 'px';
});

editor.addEventListener("pointerdown", (e) => {
    const block = e.target.closest(".code-block");
    if(!block) return;

    draggingBlock = block;

    const cordOriginalBlock = block.getBoundingClientRect();

    clickInsideBLockX = e.clientX - cordOriginalBlock.left;
    clickInsideBLockY = e.clientY - cordOriginalBlock.top;

    document.body.appendChild(block);

    block.style.position = "absolute";
    block.style.left = e.clientX - clickInsideBLockX + 'px';
    block.style.top = e.clientY - clickInsideBLockY + 'px';
});

document.addEventListener("pointermove", (e) => {
    if(!draggingBlock) return;

    draggingBlock.style.left = e.clientX - clickInsideBLockX + 'px';
    draggingBlock.style.top = e.clientY - clickInsideBLockY + 'px';
});

document.addEventListener("pointerup", (e) => {
    if(!draggingBlock) return;

    const cordEditor = editor.getBoundingClientRect();
    
    let isEditor = false;
    if(e.clientX <= cordEditor.right && e.clientX >= cordEditor.left){
        if(e.clientY >= cordEditor.top && e.clientY <= cordEditor.bottom){
            isEditor = true;
        }
    }
    if(!isEditor){
        draggingBlock.remove();
    }
    else{
        editor.appendChild(draggingBlock);

        draggingBlock.style.left = e.clientX - cordEditor.left - clickInsideBLockX + 'px';
        draggingBlock.style.top = e.clientY - cordEditor.top - clickInsideBLockY + 'px';
    }
    draggingBlock = null;
});