const palette = document.querySelector(".workspace__block-palette");
const editor = document.querySelector(".workspace__code-editor");
let draggingBlock = null;
let currentBranch = null;

let clickInsideBLockX = 0;
let clickInsideBLockY = 0;    

function getBranchUnderCursor(x, y) {
    const branches = editor.querySelectorAll(".workspace__branch");
    
    // Фильтруем ветки: нам нужны только те, что НЕ внутри draggingBlock
    const availableBranches = [...branches].filter(b => {
        if (draggingBlock && draggingBlock.contains(b)) return false;
        
        const rect = b.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && 
               y >= rect.top && y <= rect.bottom;
    });

    return availableBranches.length ? availableBranches.at(-1) : null;
}

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
    block.style.zIndex = "1000";
    block.style.pointerEvents = "none"; 
    
    block.style.left = e.clientX - clickInsideBLockX + 'px';
    block.style.top = e.clientY - clickInsideBLockY + 'px';
});

document.addEventListener("pointermove", (e) => {
    if(!draggingBlock) return;

    draggingBlock.style.left = e.clientX - clickInsideBLockX + 'px';
    draggingBlock.style.top = e.clientY - clickInsideBLockY + 'px';

    const branch = getBranchUnderCursor(e.clientX, e.clientY); 

    if(branch !== currentBranch){
        if(currentBranch) currentBranch.classList.remove('highlight');
        if(branch) branch.classList.add('highlight');
        currentBranch = branch;
    }
});

document.addEventListener("pointerup", (e) => {
    if(!draggingBlock) return;

    draggingBlock.style.pointerEvents = "auto";
    draggingBlock.style.zIndex = "";

    const branch = getBranchUnderCursor(e.clientX, e.clientY);
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
    else if(branch){
        branch.appendChild(draggingBlock);
        draggingBlock.style.position = 'static';
    }
    else{
        editor.appendChild(draggingBlock);

        draggingBlock.style.left = e.clientX - cordEditor.left - clickInsideBLockX + 'px';
        draggingBlock.style.top = e.clientY - cordEditor.top - clickInsideBLockY + 'px';
        draggingBlock.style.position = 'absolute';
    }
    if (currentBranch) { 
        currentBranch.classList.remove('highlight'); 
        currentBranch = null; 
    }
    draggingBlock = null;
});