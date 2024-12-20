const express = require('express');
const app = express();

// Sirve la carpeta "public"
app.use(express.static('public'));

// Configura la ruta principal para cargar index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Inicia el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
