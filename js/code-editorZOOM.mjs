// let scale = 1;
// const editor = document.querySelector(".workspace__code-editor");

// editor.addEventListener("wheel", (event) => {
//     event.preventDefault();
//     scale += event.deltaY * -0.01;
//     scale = Math.min(Math.max(0.125,scale),4);

//     editor.style.transform = `scale(${scale})`; 
// })

export const zoomState = {
    scale: 1,
    x: -4500, 
    y: -4500
};
const scene = document.querySelector(".workspace__scene");
const viewport = document.querySelector(".workspace__viewport");


export function ChangeTransform(e){
    scene.style.transform = `translate(${zoomState.x}px, ${zoomState.y}px) scale(${zoomState.scale})`;
}

ChangeTransform();


viewport.addEventListener("wheel", (e) => {
    e.preventDefault();

    const delta = e.deltaY * -0.001;
    const oldScale = zoomState.scale;

    const newScale = Math.min(Math.max(0.1, oldScale + delta), 3);

    if (newScale === oldScale) return;

    const ratio = newScale / oldScale;

    const rect = viewport.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    zoomState.x = mouseX - (mouseX - zoomState.x) * ratio;
    zoomState.y = mouseY - (mouseY - zoomState.y) * ratio;
    zoomState.scale = newScale;

    ChangeTransform();

},{passive: false})
