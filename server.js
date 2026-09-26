const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database("./toto.db");


// Crear tablas
db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS clientes(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE
    )
  `);


  db.run(`
    CREATE TABLE IF NOT EXISTS conversaciones(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente TEXT,
      mensaje TEXT,
      respuesta TEXT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

});


// Página principal
app.get("/", (req,res)=>{
  res.send("🤖 TOTO RESPONDE IA con memoria funcionando");
});


// Cerebro básico IA
function responder(mensaje){

  const texto = mensaje.toLowerCase();


  if(texto.includes("comprar") || texto.includes("pedido")){
    return "Perfecto 😊 Te ayudo con tu pedido.";
  }


  if(texto.includes("precio") || texto.includes("cuanto")){
    return "Te paso los precios disponibles 🍦";
  }


  if(texto.includes("horario")){
    return "Nuestro horario está configurado en el negocio.";
  }


  if(texto.includes("delivery") || texto.includes("envio")){
    return "Sí 🛵 contamos con delivery.";
  }


  return "Hola 👋 Soy TOTO IA, estoy para ayudarte.";
}



// Chat con memoria
app.post("/api/chat",(req,res)=>{

  const cliente = req.body.cliente || "Cliente";
  const mensaje = req.body.mensaje || "";


  const respuesta = responder(mensaje);



  // Guardar cliente
  db.run(
    "INSERT OR IGNORE INTO clientes(nombre) VALUES(?)",
    [cliente]
  );



  // Guardar conversación
  db.run(
    `
    INSERT INTO conversaciones(cliente,mensaje,respuesta)
    VALUES(?,?,?)
    `,
    [
      cliente,
      mensaje,
      respuesta
    ]
  );



  res.json({
    respuesta: respuesta,
    memoria: true
  });


});



// Ver historial
app.get("/api/historial",(req,res)=>{

  db.all(
    "SELECT * FROM conversaciones ORDER BY id DESC",
    [],
    (err,rows)=>{
      res.json(rows);
    }
  );
  
  });

async function enviarMensaje(destinatario, texto){

const token = process.env.PAGE_ACCESS_TOKEN;

const respuesta = await fetch(
`https://graph.facebook.com/v26.0/me/messages?access_token=${token}`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
recipient:{
id: destinatario
},
message:{
text:texto
}
})
}
);

const datos = await respuesta.text();

console.log("RESPUESTA FACEBOOK:", datos);

}

async function responderIA(mensaje){

mensaje = mensaje.toLowerCase();

if(mensaje.includes("hola")){
return "¡Hola! 👋 Soy TOTO Responde IA. ¿En qué puedo ayudarte?";
}

if(mensaje.includes("precio")){
return "Claro 👍 Decime qué producto o servicio querés consultar y te paso la información.";
}

if(mensaje.includes("comprar")){
return "Perfecto 🙌 ¿Qué producto estás buscando?";
}

return "Gracias por escribir 😊 Contame un poco más y te ayudo.";
}

// WEBHOOK META

const VERIFY_TOKEN = "toto_meta_2026";

app.get("/webhook/meta", (req,res)=>{

const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if(mode && token === VERIFY_TOKEN){

console.log("Webhook Meta verificado");

res.status(200).send(challenge);

}else{

res.sendStatus(403);

}

});


app.post("/webhook/meta", async (req,res)=>{

console.log("===== EVENTO META RECIBIDO =====");
console.log(JSON.stringify(req.body,null,2));

const evento = req.body.entry?.[0]?.messaging?.[0];

if(evento?.message?.text){

const usuario = evento.sender.id;
const texto = evento.message.text;

console.log("Mensaje:", texto);

const respuesta = await responderIA(texto);

await enviarMensaje(
usuario,
respuesta
);
);

}

res.status(200).send("EVENT_RECEIVED");

});

app.listen(PORT,()=>{
 console.log("🤖 TOTO IA activo en puerto "+PORT);
});
