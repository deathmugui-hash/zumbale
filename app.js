// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBnu6M7D78BTviR8XP_6UdiFNw-fuFtNz0",
  authDomain: "zumbale-39f79.firebaseapp.com",
  projectId: "zumbale-39f79",
  storageBucket: "zumbale-39f79.appspot.com",
  messagingSenderId: "167572432275",
  appId: "1:167572432275:web:3e1554ca58c116b24cf466"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let usuarioActual = null;



// Guardar usuario
document.getElementById("guardarUsuarioBtn").addEventListener("click", () => {
  const usuario = document.getElementById("usernameInput").value.trim();
  if(!usuario){ mostrarPopup("Escribe un usuario"); return; }
  const usuarioLower = usuario.toLowerCase();

  db.collection("usuarios").doc(usuarioLower).get().then(doc=>{
    if(doc.exists){ mostrarPopup("El usuario ya está en uso"); }
    else{
      try{
        localStorage.setItem("usuarioZumbale", usuarioLower);
        usuarioActual = usuarioLower;
        document.getElementById("estadoUsuario").innerText = "Usuario: " + usuarioActual;
        document.getElementById("zumbaleBtn").disabled = false;
        db.collection("usuarios").doc(usuarioLower).set({registrado:true});
        escucharZumbales();
        mostrarPopup("Usuario guardado ✅");
      }catch(e){ mostrarPopup("No se pudo guardar localmente"); console.error(e); }
    }
  }).catch(err=>{ mostrarPopup("Error al verificar usuario"); console.error(err); });
});

// Mostrar popup
function mostrarPopup(msg){
  const popup = document.getElementById("popup");
  popup.innerText = msg;
  popup.style.display = "block";
  popup.classList.add("shake");
  setTimeout(()=>{popup.style.display="none"; popup.classList.remove("shake");},2000);
}

// Posponer
function posponer(min){
  mostrarPopup(`Zumbales pospuestos ${min} min`);
  setTimeout(()=>{mostrarPopup("Zumbales activos nuevamente");},min*60*1000);
}

// Animar logo
function animarLogo(){
  const logo = document.getElementById("logo");
  if(logo){
    logo.classList.add("logo-alerta");
    setTimeout(()=>{logo.classList.remove("logo-alerta");},400);
  }
}

// Reproducir audio y vibración
function reproducirZumbido(modo){
  const audio = document.getElementById("zumbidoAudio");
  if(audio){ audio.currentTime=0; audio.play().catch(err=>console.log(err)); }
  if(navigator.vibrate){ navigator.vibrate(modo==="urgente"?1500:500); }
}

// Enviar Zumbale
document.getElementById("zumbaleBtn").addEventListener("click", ()=>{
  const destino = document.getElementById("usuarioDestino").value.trim();
  const modo = document.getElementById("modoZumbale").value;
  if(!destino){ mostrarPopup("Escribe un usuario destino"); return; }
  if(destino.toLowerCase()===usuarioActual){ mostrarPopup("No puedes enviarte un Zumbale a ti mismo"); return; }

  // Audio y vibración garantizados
  reproducirZumbido(modo);

  db.collection("zumbales").add({
    de: usuarioActual,
    para: destino.toLowerCase(),
    modo: modo,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(()=>{ mostrarPopup(`Zumbale enviado a ${destino} (${modo})`); });
});

// Escuchar Zumbales
function escucharZumbales(){
  if(!usuarioActual) return console.log("Usuario no definido");
  db.collection("zumbales")
    .where("para","==",usuarioActual)
    .orderBy("timestamp")
    .onSnapshot(snapshot=>{
      snapshot.docChanges().forEach(change=>{
        if(change.type==="added"){
          animarLogo();
          reproducirZumbido(change.doc.data().modo);
          const contadorEl = document.getElementById("contador");
          const actual = parseInt(contadorEl.innerText.split(": ")[1]) || 0;
          contadorEl.innerText = "Zumbales recibidos: "+(actual+1);
        }
      });
    });
}

// Cargar usuario guardado al iniciar
window.onload = function(){
  try{
    const u = localStorage.getItem("usuarioZumbale");
    if(u){
      usuarioActual=u;
      document.getElementById("estadoUsuario").innerText="Usuario: "+usuarioActual;
      document.getElementById("zumbaleBtn").disabled=false;
      escucharZumbales();
    }
  }catch(e){ console.error(e); }
};