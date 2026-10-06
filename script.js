import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const scene = new THREE.Scene();

scene.background =
  new THREE.Color(0x87ceeb);

scene.fog =
  new THREE.Fog(
    0x87ceeb,
    35,
    100
  );


// =====================================================
// CÂMERA
// =====================================================

const camera =
  new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );


// =====================================================
// RENDERIZADOR
// =====================================================

const renderer =
  new THREE.WebGLRenderer({
    antialias: true
  });

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

document.body.appendChild(
  renderer.domElement
);


// =====================================================
// ILUMINAÇÃO
// =====================================================

const ambientLight =
  new THREE.HemisphereLight(
    0xffffff,
    0x555555,
    2
  );

scene.add(ambientLight);


const sun =
  new THREE.DirectionalLight(
    0xffffff,
    2
  );

sun.position.set(
  30,
  50,
  20
);

sun.castShadow = true;

scene.add(sun);


// =====================================================
// MATERIAIS
// =====================================================

const materials = {

  grass:
    new THREE.MeshLambertMaterial({
      color: 0x4caf50
    }),

  dirt:
    new THREE.MeshLambertMaterial({
      color: 0x8b5a2b
    }),

  stone:
    new THREE.MeshLambertMaterial({
      color: 0x777777
    }),

  wood:
    new THREE.MeshLambertMaterial({
      color: 0x9b6b3c
    })

};


// =====================================================
// BLOCOS
// =====================================================

const blockGeometry =
  new THREE.BoxGeometry(
    1,
    1,
    1
  );

const blocks = [];


function addBlock(
  x,
  y,
  z,
  type
) {

  const material =
    materials[type] ||
    materials.grass;

  const block =
    new THREE.Mesh(
      blockGeometry,
      material
    );

  block.position.set(
    x,
    y,
    z
  );

  block.castShadow = true;

  block.receiveShadow = true;

  block.userData.type =
    type;

  scene.add(block);

  blocks.push(block);

  return block;
}


// =====================================================
// TERRENO
// =====================================================

const WORLD_SIZE = 30;


function getHeight(x, z) {

  return Math.floor(
    3 +
    Math.sin(x * 0.35) * 1.5 +
    Math.cos(z * 0.3) * 1.5
  );

}


for (
  let x = -WORLD_SIZE;
  x <= WORLD_SIZE;
  x++
) {

  for (
    let z = -WORLD_SIZE;
    z <= WORLD_SIZE;
    z++
  ) {

    const height =
      getHeight(x, z);

    for (
      let y = 0;
      y <= height;
      y++
    ) {

      let type = "dirt";

      if (y === height) {
        type = "grass";
      }

      if (y === 0) {
        type = "stone";
      }

      addBlock(
        x,
        y,
        z,
        type
      );

    }
  }
}


// =====================================================
// ÁRVORES
// =====================================================

function createTree(
  x,
  y,
  z
) {

  // Tronco

  for (
    let i = 1;
    i <= 4;
    i++
  ) {

    addBlock(
      x,
      y + i,
      z,
      "wood"
    );

  }


  // Folhas

  for (
    let dx = -2;
    dx <= 2;
    dx++
  ) {

    for (
      let dz = -2;
      dz <= 2;
      dz++
    ) {

      for (
        let dy = 3;
        dy <= 5;
        dy++
      ) {

        const distance =
          Math.abs(dx) +
          Math.abs(dz) +
          Math.abs(dy - 4);

        if (distance < 4) {

          addBlock(
            x + dx,
            y + dy,
            z + dz,
            "grass"
          );

        }

      }
    }
  }
}


for (
  let i = 0;
  i < 20;
  i++
) {

  const x =
    Math.floor(
      Math.random() * 45
    ) - 22;

  const z =
    Math.floor(
      Math.random() * 45
    ) - 22;

  const y =
    getHeight(x, z);

  createTree(
    x,
    y,
    z
  );

}


// =====================================================
// JOGADOR
// =====================================================

const player = {

  position:
    new THREE.Vector3(
      0,
      8,
      5
    ),

  velocity:
    new THREE.Vector3(),

  speed: 7,

  jumpPower: 9,

  height: 1.8

};


camera.position.copy(
  player.position
);


// =====================================================
// TECLADO
// =====================================================

const keys = {};


document.addEventListener(
  "keydown",
  event => {

    keys[event.code] = true;

    if (
      event.code === "Space"
    ) {

      event.preventDefault();

    }

    if (
      event.code === "Digit1"
    ) {

      selectBlock("grass");

    }

    if (
      event.code === "Digit2"
    ) {

      selectBlock("dirt");

    }

    if (
      event.code === "Digit3"
    ) {

      selectBlock("stone");

    }

    if (
      event.code === "Digit4"
    ) {

      selectBlock("wood");

    }

  }
);


document.addEventListener(
  "keyup",
  event => {

    keys[event.code] =
      false;

  }
);


// =====================================================
// CÂMERA / MOUSE
// =====================================================

let yaw = 0;

let pitch = 0;


document.addEventListener(
  "mousemove",
  event => {

    if (
      document.pointerLockElement !==
      document.body
    ) {

      return;

    }

    yaw -=
      event.movementX * 0.002;

    pitch -=
      event.movementY * 0.002;

    pitch =
      Math.max(
        -Math.PI / 2,
        Math.min(
          Math.PI / 2,
          pitch
        )
      );

  }
);


// =====================================================
// BLOCO SELECIONADO
// =====================================================

let selectedBlock =
  "grass";


function selectBlock(type) {

  selectedBlock =
    type;

  document
    .querySelectorAll(".slot")
    .forEach(slot => {

      slot.classList.remove(
        "selected"
      );

    });

  const slot =
    document.querySelector(
      `.slot[data-block="${type}"]`
    );

  if (slot) {

    slot.classList.add(
      "selected"
    );

  }

}


// =====================================================
// RAYCAST
// =====================================================

const raycaster =
  new THREE.Raycaster();


function getTargetBlock() {

  raycaster.setFromCamera(
    new THREE.Vector2(0, 0),
    camera
  );

  const hits =
    raycaster.intersectObjects(
      blocks
    );

  if (
    hits.length > 0
  ) {

    return hits[0];

  }

  return null;

}


// =====================================================
// QUEBRAR / COLOCAR
// =====================================================

document.addEventListener(
  "mousedown",
  event => {

    if (
      document.pointerLockElement !==
      document.body
    ) {

      return;

    }

    const hit =
      getTargetBlock();

    if (!hit) {
      return;
    }


    // -----------------------------------------------
    // QUEBRAR
    // -----------------------------------------------

    if (
      event.button === 0
    ) {

      const block =
        hit.object;

      const index =
        blocks.indexOf(
          block
        );

      if (
        index !== -1
      ) {

        blocks.splice(
          index,
          1
        );

      }

      scene.remove(
        block
      );

    }


    // -----------------------------------------------
    // COLOCAR
    // -----------------------------------------------

    if (
      event.button === 2
    ) {

      const normal =
        hit.face.normal.clone();

      const position =
        hit.object.position
          .clone()
          .add(normal);


      // Não deixa colocar bloco
      // dentro do jogador

      const distance =
        position.distanceTo(
          player.position
        );

      if (
        distance < 1.5
      ) {

        return;

      }


      // Evita posições quebradas

      const x =
        Math.round(
          position.x
        );

      const y =
        Math.round(
          position.y
        );

      const z =
        Math.round(
          position.z
        );


      // Não duplica bloco

      if (
        blockExists(
          x,
          y,
          z
        )
      ) {

        return;

      }


      addBlock(
        x,
        y,
        z,
        selectedBlock
      );

    }

  }
);


// Remove menu de contexto

document.addEventListener(
  "contextmenu",
  event => {

    event.preventDefault();

  }
);


// =====================================================
// VERIFICAR BLOCO
// =====================================================

function blockExists(
  x,
  y,
  z
) {

  return blocks.some(
    block =>
      block.position.x === x &&
      block.position.y === y &&
      block.position.z === z
  );

}


// =====================================================
// TERRENO ABAIXO DO JOGADOR
// =====================================================

function getGroundHeight(
  x,
  z
) {

  let highest =
    -Infinity;

  for (
    const block of blocks
  ) {

    if (
      Math.abs(
        block.position.x - x
      ) < 0.45 &&

      Math.abs(
        block.position.z - z
      ) < 0.45 &&

      block.position.y >
        highest
    ) {

      highest =
        block.position.y;

    }

  }

  return highest;

}


// =====================================================
// MOVIMENTO
// =====================================================

let grounded =
  false;


function updatePlayer(
  delta
) {

  const direction =
    new THREE.Vector3();


  if (
    keys["KeyW"]
  ) {

    direction.z -= 1;

  }

  if (
    keys["KeyS"]
  ) {

    direction.z += 1;

  }

  if (
    keys["KeyA"]
  ) {

    direction.x -= 1;

  }

  if (
    keys["KeyD"]
  ) {

    direction.x += 1;

  }


  if (
    direction.length() > 0
  ) {

    direction.normalize();

  }


  // Movimento acompanha
  // a direção da câmera

  direction.applyAxisAngle(
    new THREE.Vector3(
      0,
      1,
      0
    ),
    yaw
  );


  player.position.x +=
    direction.x *
    player.speed *
    delta;

  player.position.z +=
    direction.z *
    player.speed *
    delta;


  // Gravidade

  player.velocity.y -=
    22 * delta;

  player.position.y +=
    player.velocity.y *
    delta;


  // Chão

  const ground =
    getGroundHeight(
      Math.round(
        player.position.x
      ),
      Math.round(
        player.position.z
      )
    );


  const minimumY =
    ground + player.height;


  if (
    player.position.y <=
      minimumY &&

    player.velocity.y <= 0
  ) {

    player.position.y =
      minimumY;

    player.velocity.y =
      0;

    grounded = true;

  } else {

    grounded = false;

  }


  // Pulo

  if (
    keys["Space"] &&
    grounded
  ) {

    player.velocity.y =
      player.jumpPower;

    grounded = false;

  }


  // Limites do mapa

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -29,
      29
    );

  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -29,
      29
    );


  // Câmera

  camera.position.copy(
    player.position
  );

  camera.rotation.order =
    "YXZ";

  camera.rotation.y =
    yaw;

  camera.rotation.x =
    pitch;

}


// =====================================================
// LOOP DO JOGO
// =====================================================

const clock =
  new THREE.Clock();


function animate() {

  requestAnimationFrame(
    animate
  );

  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );

  updatePlayer(
    delta
  );

  renderer.render(
    scene,
    camera
  );

}


animate();


// =====================================================
// BOTÃO JOGAR
// =====================================================

const startButton =
  document.getElementById(
    "start"
  );


startButton.addEventListener(
  "click",
  () => {

    document
      .getElementById("menu")
      .style.display =
      "none";

    document.body.requestPointerLock();

  }
);


// =====================================================
// HOTBAR
// =====================================================

document
  .querySelectorAll(".slot")
  .forEach(slot => {

    slot.addEventListener(
      "click",
      () => {

        selectBlock(
          slot.dataset.block
        );

      }
    );

  });


// =====================================================
// REDIMENSIONAMENTO
// =====================================================

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);
