let canvas = document.getElementById("paper");
let ctx = canvas.getContext("2d");

const C_WDTH = canvas.width;
const C_HGHT = canvas.height;

// const level = level_two_tramp(C_WDTH, C_HGHT); 
const level = level_three_platform(C_WDTH, C_HGHT); 

let game = new Game();
game.load_level(level);
game.init();

