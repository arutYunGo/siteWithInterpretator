import {zoomState, ChangeTransform} from './code-editorZOOM.mjs';
const palette = document.querySelector(".workspace__block-palette");
const editor = document.querySelector(".workspace__code-editor");
const scene = document.querySelector(".workspace__scene");
const viewport = document.querySelector(".workspace__viewport");
let draggingBlock = null;
let currentBranch = null;

let clickInsideBLockX = 0;
let clickInsideBLockY = 0;    

let draggingFromScene = false;

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

viewport.addEventListener("pointerdown", (e) => {

    const block = e.target.closest(".code-block");
    if(!block && (e.button === 0 || e.button === 1)){
        e.preventDefault();
        isPanning = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        return;
    }
    if(!block) return;

    draggingBlock = block;
    draggingFromScene = (block.parentNode === scene);

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
        console.log(zoomState.x)
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

    if(branch !== currentBranch){
        if(currentBranch) currentBranch.classList.remove('highlight');
        if(branch) branch.classList.add('highlight');
        currentBranch = branch;
    }
});

document.addEventListener("pointerup", (e) => {
    isPanning = false;
    if(!draggingBlock) return;

    draggingBlock.style.pointerEvents = "auto";
    draggingBlock.style.zIndex = "";

    const branch = getBranchUnderCursor(e.clientX, e.clientY);
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
    else if(branch){
        branch.appendChild(draggingBlock);
        draggingBlock.style.position = 'static';
    }
    else{
        scene.appendChild(draggingBlock);

        const sceneClickX = (e.clientX - cordEditor.left - zoomState.x) / zoomState.scale;
        const sceneClickY = (e.clientY - cordEditor.top - zoomState.y) / zoomState.scale;

        draggingBlock.style.left = (sceneClickX - clickInsideBLockX) + 'px';
        draggingBlock.style.top = (sceneClickY - clickInsideBLockY) + 'px';
        draggingBlock.style.position = 'absolute';
    }
    if (currentBranch) { 
        currentBranch.classList.remove('highlight'); 
        currentBranch = null; 
    }
    draggingBlock = null;
    draggingFromScene = false;
});

ChangeTransform();