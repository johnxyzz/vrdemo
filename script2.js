//parece q essa camera nao existe antes de carregar a cena toda
// var camm = document.querySelector('#cam').components.camera;
const canv = document.querySelector('#segcam');
canv.style.display = "none";
const cena = document.querySelector('a-scene');
const btns = document.querySelector('#btnn');
const urll = document.querySelector('#url');

//esse rendenizador rendeniza a camera 2
var rendenizador = new THREE.WebGLRenderer({canvas: canv});
rendenizador.setSize(canv.clientWidth *2, canv.clientHeight*2);

var rtc, ws, canallaranja;

        //movimento
          var a = false;
          var gamepadIndex = null;
          var moveForward = false;
          var moveBackward = false;
          var moveLeft = false;
          var moveRight = false;

          window.addEventListener('gamepadconnected', (e) => {
            a = true;
            gamepadIndex = e.gamepad.index;
            console.log('Gamepad conectado:', e.gamepad);
          });

//material da terra

var textloader = new THREE.TextureLoader();
var objloader = new THREE.OBJLoader();

let normalmap = textloader.load('./assets/plowed.png');
let dispmap = textloader.load('./assets/ploweddisp.png');
let aomap = textloader.load('./assets/plowedao.png');
let albedomap = textloader.load('./assets/field1.png')

let plowedmaterial =  new THREE.MeshStandardMaterial({
    map: albedomap,
    normalMap:normalmap,
    displacementMap:dispmap,
    aoMap: aomap,
    roughness: 0.8,
	color: 0xffffff,
	metalness: 0.2,
	bumpScale: 1
    // specularMap: specularmap
});

btns.onclick = () =>{

    // document.querySelector('#box').style.display= "none";
    connect();

}

function connect(){

//crio a a conexao webrtc
rtc = new RTCPeerConnection();

//crio o websocket

ws = new WebSocket('ws://'+ urll.value +':6656');

    //websocket aq
    ws.onopen = ()=>{
    
        console.log('ja conectei com o websocket');
        document.querySelector('#box').style.display= "none";

        canallaranja = canv.captureStream(30);
        canallaranja.getTracks().forEach(i =>{
            rtc.addTrack(i, canallaranja);
        });
        rtc.createOffer().then((oferta)=>{
            return rtc.setLocalDescription(oferta);
        }).then(()=>{
            ws.send(JSON.stringify({
                tipo: 'oferta',
                sdp: rtc.localDescription
            }));
        }).catch((err)=>{
            console.log('erro na oferta', err);
        })
    }

    ws.onmessage = (e)=>{

        var msg = JSON.parse(e.data);
        if(msg.tipo == 'resposta'){
            console.log('resposta:', msg.sdp);
            rtc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
        }else if(msg.tipo == 'candidato'){
            rtc.addIceCandidate(new RTCIceCandidate(msg.candidato)).catch((err)=>{
                console.error('erro no candidato skol ice', err);
            })
        }
    };
    rtc.onicecandidate = (e) =>{
        if(e.candidate){
            ws.send(JSON.stringify({
                tipo: 'candidato',
                candidato: e.candidate
            }));
        }
    };
    ws.onclose = ()=>{
        console.log('conexao websocket fechada')
    }
    ws.onerror = error;
    function error(err){
        console.log('erro:', err)
    }

}

//executa quando a cena for totalmente carregada

cena.addEventListener('loaded',()=>{

    //boto a textura no a-plane
    normalmap.wrapS = THREE.RepeatWrapping;
    normalmap.wrapT = THREE.RepeatWrapping;
    normalmap.anisotropy = 4;
    normalmap.repeat.set(20, 20);

    dispmap.wrapS = THREE.RepeatWrapping;
    dispmap.wrapT = THREE.RepeatWrapping;
    dispmap.anisotropy = 4;
    dispmap.repeat.set(20, 20);

    aomap.wrapS = THREE.RepeatWrapping;
    aomap.wrapT = THREE.RepeatWrapping;
    aomap.anisotropy = 4;
    aomap.repeat.set(20, 20);

    albedomap.wrapS = THREE.RepeatWrapping;
    albedomap.wrapT = THREE.RepeatWrapping;
    albedomap.anisotropy = 4;
    albedomap.repeat.set(20, 20);

    document.querySelector('#chao').getObject3D('mesh').material = plowedmaterial;
    
    var camm = document.querySelector('#cam').components.camera.camera;

    var player = document.querySelector('#player');

    // console.log(camm);
    // console.log(cena);
    // console.log(rendenizador);

    function checkGamepad() {
        if (a) {
          // Acessa o gamepad conectado
          var gamepad = navigator.getGamepads()[gamepadIndex];
          if (gamepad) {
            // Usa apenas um eixo para interpretar o movimento
            // var axis = gamepad.axes[9];
            var btns = gamepad.buttons;
      
            if(btns != undefined){
          // Verifica se os botões estão pressionados
          if(btns[12].pressed){
              moveForward = true;
          } else {
              moveForward = false;
          }
      
          if(btns[13].pressed){
              moveBackward = true;
          } else {
              moveBackward = false;
          }
      
          if(btns[14].pressed){
              moveLeft = true;
          } else {
              moveLeft = false;
          }
      
          if(btns[15].pressed){
              moveRight = true;
          } else {
              moveRight = false;
          }
      }
          }
        }
      
        // Continua verificando o gamepad a cada frame
        requestAnimationFrame(checkGamepad);
      }
      
      checkGamepad();

    // Função de loop contínuo para atualização de posição
    function movePlayer() {
    //   var player = document.querySelector('#player');
      var camera = document.querySelector('#vr');
      var playerPosition = player.getAttribute('position');
      
      // Pegue a rotação da câmera
      var cameraRotation = camera.getAttribute('rotation');
      
      // Converta a rotação Y da câmera (ângulo de yaw) para radianos
      var angleRad = THREE.MathUtils.degToRad(cameraRotation.y);
      
      var speed = 0.07; // Ajuste a velocidade

      // Movimentos
      if (moveForward) {
        playerPosition.x += Math.sin(angleRad) * speed;
        playerPosition.z += Math.cos(angleRad) * speed;
      }
      if (moveBackward) {
        playerPosition.x -= Math.sin(angleRad) * speed;
        playerPosition.z -= Math.cos(angleRad) * speed;
      }
      if (moveLeft) {
        playerPosition.x -= Math.sin(angleRad - Math.PI / 2) * speed;
        playerPosition.z -= Math.cos(angleRad - Math.PI / 2) * speed;
      }
      if (moveRight) {
        playerPosition.x -= Math.sin(angleRad + Math.PI / 2) * speed;
        playerPosition.z += Math.cos(angleRad + Math.PI / 2) * speed;
      }

      // Atualiza a posição do cubo
      player.setAttribute('position', playerPosition);
      camera.setAttribute('position', playerPosition);

      // Loop contínuo para atualizar a posição
      requestAnimationFrame(movePlayer);
    }

    // Inicia o loop de movimento
    movePlayer();


    function renderdois(){
        rendenizador.render(cena.object3D, camm);
    }
        rendenizador.setAnimationLoop(renderdois);
        renderdois();
});