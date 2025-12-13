const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const db = new Database("C:/prisionero/data/prisionero.db");

// Prueba: obtener usuario
const usuario = db.prepare("SELECT id, username, email, password FROM users WHERE email = ?").get("war@test.com");
console.log("Usuario encontrado:", usuario);

if (usuario) {
  const passwordValida = bcrypt.compareSync("war", usuario.password);
  console.log("Contraseña válida:", passwordValida);
  console.log("Password hash en BD:", usuario.password);
}

db.close();
