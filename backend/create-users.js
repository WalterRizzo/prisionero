const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");
const db = new sqlite3.Database(path.join(__dirname, "data/prisionero.db"));

const password1 = bcrypt.hashSync("test123", 10);
const password2 = bcrypt.hashSync("war", 10);

try {
  db.serialize(() => {
    db.run("DELETE FROM users", function(err) {
      if (err) console.log("Error al limpiar:", err.message);
      
      db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
        ["user1", "user1@test.com", password1], 
        function(err) {
          if (err) console.log("Error:", err.message);
        }
      );
      
      db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
        ["war", "war@test.com", password2], 
        function(err) {
          if (err) console.log("Error:", err.message);
          else console.log("✅ Usuarios creados exitosamente");
        }
      );
    });
    
    setTimeout(() => {
      db.all("SELECT id, username, email FROM users", function(err, rows) {
        if (err) {
          console.log("Error:", err.message);
        } else {
          console.log("Usuarios en BD:", JSON.stringify(rows, null, 2));
          db.close();
        }
      });
    }, 500);
  });
} catch(e) {
  console.log("Error:", e.message);
  db.close();
}
