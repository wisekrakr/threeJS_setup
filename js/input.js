let kb = {};

class Input{ 

    constructor(keys){
        this.kb = keys;
    }

    // Set Input functions
    keyDown(event){
        this.kb[event.keyCode] = true;
    }
    keyUp(event){
        this.kb[event.keyCode] = false;
    }

    inputHandler(){
        if(kb[87]){  // W arrow key
            camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
            camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
        }
        if(kb[83]){  // S arrow key
            camera.position.x += Math.sin(camera.rotation.y) * player.speed;
            camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
        }
        if(kb[65]){  // A arrow key
            camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
            camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;       
        }
        if(kb[68]){  // D arrow key
            camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
            camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
        }

        if(kb[37]){  // left arrow key
        camera.rotation.y -= Math.PI * player.turnSpeed;      
        }
        if(kb[39]){  // right arrow key
            camera.rotation.y += Math.PI * player.turnSpeed; 
        }
    }    
}