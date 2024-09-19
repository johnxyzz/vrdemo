//parece q essa camera nao existe antes de carregar a cena toda
// var camm = document.querySelector('#cam').components.camera;
const canv = document.querySelector('#segcam');
const cena = document.querySelector('a-scene');

//esse rendenizador rendeniza a camera 2
var rendenizador = new THREE.WebGLRenderer({canvas: canv});
var cubo = document.querySelector('a-box');
var x, z;

//material da terra

var textloader = new THREE.TextureLoader();
var objloader = new THREE.OBJLoader();

let normalmap = textloader.load('./assets/plowed.png');
let dispmap = textloader.load('./assets/ploweddisp.png');
let aomap = textloader.load('./assets/plowedao.png');
// let specularmap = textloader.load('./assets/plowedspecular.png');
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

//trator

// let texttrator = textloader.load('./assets/trator/Texure Tractor.jpg');

//crio a a conexao webrtc
var rtc = new RTCPeerConnection();
var canallaranja;

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

    //trator

    // document.querySelector('#trator').getObject3D('mesh').material = texttrator;   

    //crio o websocket

    var ws = new WebSocket('ws://localhost:6656');
    var camm = document.querySelector('#cam').components.camera.camera;

    // console.log(camm);
    // console.log(cena);
    // console.log(rendenizador);

    //websocket aq
    ws.onopen = ()=>{
    
        console.log('ja conectei com o websocket');

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

    function renderdois(){
        rendenizador.render(cena.object3D, camm);
    }
        rendenizador.setAnimationLoop(renderdois);
        renderdois();
});