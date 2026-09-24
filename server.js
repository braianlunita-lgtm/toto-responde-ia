const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


app.get("/", (req,res)=>{
  res.send("🤖 TOTO RESPONDE IA funcionando");
});


app.post("/api/chat", (req,res)=>{

  const mensaje = req.body.mensaje || "";

  let respuesta = "Hola 👋 Soy TOTO IA, estoy para ayudarte.";

  const texto = mensaje.toLowerCase();


  if(texto.includes("precio")){
    respuesta = "Te ayudo con los precios disponibles 🍦";
  }

  if(texto.includes("horario")){
    respuesta = "Nuestro horario está configurado en el negocio.";
  }

  if(texto.includes("delivery")){
    respuesta = "Sí 🛵 contamos con delivery.";
  }

  if(texto.includes("comprar")){
    respuesta = "Perfecto 😊 Seguimos con tu pedido.";
  }


  res.json({
    respuesta: respuesta
  });

});


app.listen(PORT, ()=>{
  console.log("TOTO IA activo en puerto " + PORT);
});
