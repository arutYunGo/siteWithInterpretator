import {zoomState, ChangeTransform} from './code-editorZOOM.mjs';
import {collectData} from './interpreter.mjs';

const palette = document.querySelector(".workspace__block-palette");
const editor = document.querySelector(".workspace__code-editor");
const scene = document.querySelector(".workspace__scene");
const viewport = document.querySelector(".workspace__viewport");

let draggingBlock = null;
let currentTarget = null;

let clickInsideBLockX = 0;
let clickInsideBLockY = 0;    

let isPanning = false;
let lastMouseX = 0;
let lastMouseY = 0;

function getBranchUnderCursor(x, y) {
    const branches = editor.querySelectorAll(".workspace__branch");
    
    const availableBranches = [...branches].filter(b => {
        if (draggingBlock && draggingBlock.contains(b)) return false;
        
        const rect = b.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && 
               y >= rect.top && y <= rect.bottom;
    });

    return availableBranches.length ? availableBranches.at(-1) : null;
}

function getNextBlockUnderCursor(x,y){
    const blocks = editor.querySelectorAll(".workspace__next-block");

    const availableBlocks = [...blocks].filter(b => {
        if(draggingBlock && draggingBlock.contains(b)) return false;

        if (b.children.length > 0) return false;
        if(!draggingBlock.querySelector(".workspace__next-block")) return false;

        const rect = b.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && 
               y >= rect.top && y <= rect.bottom;
    })
    return availableBlocks.length ? availableBlocks.at(0) : null;
}

palette.addEventListener("pointerdown", (e) => {
    const isBlock = e.target.closest(".block");
    if(!isBlock) return;

    const clone = isBlock.cloneNode(true);
    clone.classList.remove("block");
    clone.classList.add("code-block");

    document.body.append(clone);
    draggingBlock = clone;

    const cordOriginalBlock = isBlock.getBoundingClientRect();

    clickInsideBLockX = e.clientX - cordOriginalBlock.left;
    clickInsideBLockY = e.clientY - cordOriginalBlock.top;

    clone.style.position = "absolute";
    clone.style.left = e.clientX - clickInsideBLockX + 'px';
    clone.style.top = e.clientY - clickInsideBLockY + 'px';
});

viewport.addEventListener("pointerdown", (e) => {

    const block = e.target.closest(".code-block");
    if(!block && (e.button === 0)){
        e.preventDefault();
        isPanning = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        return;
    }
    if(!block) return;

    draggingBlock = block;

    const cordOriginalBlock = block.getBoundingClientRect();

    clickInsideBLockX = (e.clientX - cordOriginalBlock.left)/zoomState.scale;
    clickInsideBLockY = (e.clientY - cordOriginalBlock.top)/zoomState.scale;
    document.body.appendChild(block);

    block.style.position = "absolute";
    block.style.zIndex = "1000";
    block.style.pointerEvents = "none"; 
    
    block.style.left = e.clientX - clickInsideBLockX + 'px';
    block.style.top = e.clientY - clickInsideBLockY + 'px';
});

document.addEventListener("pointermove", (e) => {
    if(isPanning){ 
        zoomState.x += e.clientX - lastMouseX;
        zoomState.y += e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        ChangeTransform();
        return;
    }
    if(!draggingBlock) return;
    draggingBlock.style.left = e.clientX - clickInsideBLockX + 'px';
    draggingBlock.style.top = e.clientY - clickInsideBLockY + 'px';

    const branch = getBranchUnderCursor(e.clientX, e.clientY); 
    const nextBlock = getNextBlockUnderCursor(e.clientX,e.clientY);

    const newTarget = nextBlock || branch;

    if (newTarget !== currentTarget) {
        if (currentTarget) currentTarget.classList.remove('highlight');
        if (newTarget) newTarget.classList.add('highlight');
        currentTarget = newTarget;
    }

});

document.addEventListener("pointerup", (e) => {
    isPanning = false;
    if(!draggingBlock) return;

    try {
        // Пробуем собрать данные. Если упадет — перейдет в catch
        console.log(JSON.stringify(collectData(draggingBlock), null, 2));
    } catch (err) {
        console.warn("Ошибка в collectData:", err.message);
    } 

    draggingBlock.style.pointerEvents = "auto";
    draggingBlock.style.zIndex = "";

    const cordEditor = viewport.getBoundingClientRect();
    
    let isEditor = false;
    if(e.clientX <= cordEditor.right && e.clientX >= cordEditor.left){
        if(e.clientY >= cordEditor.top && e.clientY <= cordEditor.bottom){
            isEditor = true;
        }
    }
    if(!isEditor){
        draggingBlock.remove();
    }
    else if(currentTarget){
        currentTarget.appendChild(draggingBlock);
        draggingBlock.style.position = 'static';
        draggingBlock.style.left = 'auto';
        draggingBlock.style.top = 'auto';
        draggingBlock.style.margin = '0';
        currentTarget.classList.remove('highlight');
        currentTarget = null;
    }
    else{
        scene.appendChild(draggingBlock);

        const sceneClickX = (e.clientX - cordEditor.left - zoomState.x) / zoomState.scale;
        const sceneClickY = (e.clientY - cordEditor.top - zoomState.y) / zoomState.scale;

        draggingBlock.style.left = (sceneClickX - clickInsideBLockX) + 'px';
        draggingBlock.style.top = (sceneClickY - clickInsideBLockY) + 'px';
        draggingBlock.style.position = 'absolute';
    }
    draggingBlock = null;
    currentTarget = null;
});

ChangeTransform();