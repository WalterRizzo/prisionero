# 🎮 VISUAL GUIDE - Cómo Se Ve el Juego Ahora

## 🏠 DASHBOARD - Marketplace Compacto

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚔️ LOBBIES        [Username] Reputation: A+ [Avatar] [Salir]   │
├─┬───────────────────────────────────────────────────────────────┤
│🎯│ [RANGO]    [VICTORIAS]  [W/L]    [PUNTOS]                   │
│🎮│ Gold         15         65%       2,340                      │
│🏆│ ──────────────────────────────────────────────────────────   │
│📊│                                                              │
│⚙️│ ┌──────────┬──────────┬──────────┬──────────┬──────────┬────┐
│  │ Room #42 │ Room #15 │ Duelo X  │ Torneo 2 │ Room #88 │ ... │
│  │ 🎮 Casual│ 🏆 Ranked│ 🎮 Casual│ 🏆 Rank  │ 🎮 Casl │     │
│  │ 2/4 ⭐  │ 4/4 ⭐⭐ │ 1/2      │ 3/3 🔥   │ 2/2      │     │
│  │ Lvl 5+   │ Lvl 15+  │ Lvl 1+   │ Lvl 20+  │ Lvl 8+   │     │
│  │ 🟢 Esper │ 🔴 Jugdo │ 🟢 Esper │ 🔴 Jugdo │ 🟢 Esper │     │
│  │ [ENTRAR] │ [ENTRAR] │ [ENTRAR] │ [ENTRAR] │ [ENTRAR] │     │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴────┘
│  └──────────┬──────────┬──────────┬──────────┬──────────┬────┐
│  │   Room   │ Ult.Hora │ La Grilla│ Noche 5  │ Rápidas  │ ... │
│  │ 🎮 ...   │ 🏆 ...   │ 🎮 ...   │ 🏆 ...   │ 🎮 ...   │     │
│  │ ...      │ ...      │ ...      │ ...      │ ...      │     │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴────┘
│
│ 🔄 Refrescar        6 salas encontradas
└─────────────────────────────────────────────────────────────────┘
```

### Colores
- **Sidebar**: Ancho 56px, icons solo
- **Stats**: Gradientes (purple/blue/pink/cyan)
- **Salas**: Grid densa 6-7 columnas
- **Hover**: Glow effect, border brighter
- **Botón ENTRAR**: Gradiente purple-pink

---

## 📖 RULES - Página de Reglas Épica

### Layout General
```
┌─────────────────────────────────────────────────────────────────┐
│                      🔥 REGLAS AVANZADAS 🔥                     │
│              "¿Traicionar siempre es óptimo?" NO                │
├─────────────────────────────────────────────────────────────────┤
│
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ │⚡ Racha │👑 Reputan│ 😴 Fatiga│ 🎁 Coopera│ 🔥 Última│
│ │ Traición │ ción     │ Traición │ ción     │ Ronda   │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘
│
│ ┌────────────────────────────────────────────────────┐
│ │ ⚡ Penalización por Racha de Traición             │
│ │ "No castigamos una traición. Castigamos el abuso" │
│ │                                                    │
│ │ 📋 Detalles:                                      │
│ │ • 1ª traición: 100% de puntos                    │
│ │ • 2ª consecutiva: -10% de puntos                 │
│ │ • 3ª consecutiva: -25% de puntos                 │
│ │ • 4ª o más: -50% de puntos                       │
│ │                                                    │
│ │ 💡 Por Qué Importa:                              │
│ │ Traicionar puede servir, pero spamearla te       │
│ │ vuelve ineficiente. El sistema se auto-balancea. │
│ └────────────────────────────────────────────────────┘
│
│ [Botones de navegación entre reglas]
│ [Ver siguiente regla...]
│
└─────────────────────────────────────────────────────────────────┘
```

### Tabs de Reglas (Al hacer clic cambia contenido)
1. **⚡ Penalización por Racha de Traición**
   - No castiga 1 traición
   - Penaliza el spam (2da en adelante)
   
2. **👑 Reputación Visible**
   - Tu historial antes de la partida
   - Afecta ganancia de puntos
   - Traidores con traidores

3. **😴 Fatiga de Traición**
   - Debuff acumulativo
   - Reduce puntos y aumenta cooldown
   - Se cura con cooperación

4. **🎁 Bonus por Cooperación**
   - 3 = +20%
   - 5 = x1.5
   - 8 = Logro "Pacifista"

5. **🔥 Últimas Rondas**
   - Penaliza "free-for-all" final
   - Si coop% < 40%, traiciones valen 50%

### Estilos
- **Colores**: Red theme (border red-500, glow rojo)
- **Fuente**: Bold/Black para títulos
- **Iconos**: Emojis grandes y expresivos
- **Ejemplos**: Casos prácticos numerados

---

## 🎯 GAME (Durante la Partida)

### Pantalla de Elección
```
┌────────────────────────────────────────────────────────┐
│              🎮 RONDA 3 de 10                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  TU PUNTUACIÓN: 125          RIVAL: 98                │
│  Racha Traiciones: 0         Fatiga: 2/20             │
│  Reputación: A+              Su Reputación: B         │
│                                                        │
│  Historial: [C][T][C][C][T][C] ...                    │
│              ↑Tú              ↑Rival                   │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Tiempo: 8 segundos                              │  │
│  │ ░░░░░░░░░░░░░░░░░░                              │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ¿QUÉ HACES?                                          │
│                                                        │
│     [🤝 COOPERAR]         [⚔️ TRAICIONAR]           │
│   Confía en el rival      Busca el botín grande      │
│   Riesgo: Medio           Riesgo: Alto               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Resultado de Ronda
```
┌────────────────────────────────────────────────────────┐
│  ✅ TÚ: [🤝 COOPERASTE]                               │
│  ❌ RIVAL: [⚔️ TRAICIONÓ]                             │
│                                                        │
│  TÚ PIERDES: -8 puntos                                │
│  RIVAL GANA: +12 puntos                               │
│                                                        │
│  📊 DESGLOSE DE TUS PUNTOS:                           │
│  Base: 10 puntos                                      │
│  Racha traición: x1.0 (no traicionaste)               │
│  Fatiga: x0.95 (poco cansancio)                       │
│  Reputación: x1.2 (A+ confiable!)                     │
│  ─────────────────────────                            │
│  FINAL: -8 puntos (el rival traicionó)                │
│                                                        │
│  💡 INSIGHT:                                          │
│  El rival es 🔴 Traidor (rep baja). Próxima vez      │
│  ten más cuidado contra jugadores sospechosos.       │
│                                                        │
│  [SIGUIENTE RONDA]                                    │
└────────────────────────────────────────────────────────┘
```

---

## 🏆 LEADERBOARD - Rankings

```
┌───────────────────────────────────────────────────────┐
│ 🏆 LEADERBOARD                      [Global] [Amigos] │
├───────────────────────────────────────────────────────┤
│ POS │ JUGADOR      │ PUNTOS │ TASA COOP │ REPUTACIÓN │
├─────┼──────────────┼────────┼───────────┼────────────┤
│ 1   │ ⭐ Pacífico  │ 4,850  │ 92%       │ ⭐⭐⭐ (+99)│
│ 2   │ 🎯 Adaptador │ 4,320  │ 65%       │ 🟢 (+55)   │
│ 3   │ 🔴 Calculador│ 3,890  │ 58%       │ 🟡 (-12)   │
│ 4   │ 💔 Ingenuoh  │ 2,100  │ 78%       │ 🟠 (-60)   │
│ 5   │ 🎭 Impredeci │ 1,540  │ 42%       │ 🔴 (-95)   │
│ ... │ ...          │ ...    │ ...       │ ...        │
└───────────────────────────────────────────────────────┘

TÚ ESTÁS EN: #47 de 2,341 jugadores

Tus stats:
- Juegos jugados: 45
- Partidas ganadas: 29 (64%)
- Cooperaciones: 287/450 (64%)
- Reputación: +52 (Bueno)
- Puntos acumulados: 8,420
```

---

## 🔥 Notificaciones (Pop-ups)

### Durante Partida
```
🎁 3 Cooperaciones!
   +20% bonus de puntos

🔥 COMBO x1.5 activado!

⚠️ Estás cansado
   Tus traiciones generan menos puntos

⚠️⚠️ Fatiga crítica
   Reduce tu frecuencia de traiciones

🏅 LOGRO DESBLOQUEADO: Pacifista
   8 cooperaciones seguidas!

🚫 Última ronda penalty
   Traición vale 50%
```

---

## 🎨 Paleta de Colores

### Principales
- **Fondo**: slate-950 (casi negro)
- **Gradiente fondo**: from-slate-950 via-slate-900 to-slate-950
- **Borde primario**: purple-500/40
- **Borde secundario**: slate-700/40

### Acentos por Regla
- **Racha Traición**: Red (border-red-500, glow-red)
- **Reputación**: Purple (border-purple-500)
- **Fatiga**: Orange (border-orange-500)
- **Cooperación**: Green (border-green-500)
- **Última Ronda**: Pink (border-pink-500)

### Gradientes
- **Buttons**: from-cyan-500 to-blue-600 (ENTRAR)
- **Stats**: from-purple-900 to-purple-900
- **Hover**: Más opacity, más brightness

---

## 📱 Responsive

### Desktop (xl, 2xl)
- Grilla: 6-7 columnas
- Sidebar: 56px
- Fuente: Tamaño normal

### Tablet (lg)
- Grilla: 5 columnas
- Sidebar: 56px (igual)
- Padding: p-3 (denso)

### Mobile (md, sm)
- Grilla: 2-3 columnas
- Sidebar: Colapsable
- Full width

---

## ✨ Animaciones

### Hover Sala
```
- Border: Más opaco
- Shadow: glow effect (20px)
- Escala: muy sutil
- Transición: 200ms
```

### Tab Activo (Rules)
```
- Border: cyan-500
- Background: cyan-500/20
- Escala: scale-105
- Shadow: glow cyan
```

### Pulse (Estados)
```
- Indicador "Jugando": animate-pulse rojo
- Indicador "Esperando": animate-pulse verde
- Avatar en header: no anima
```

---

## 🎯 Flujo de Usuario

1. **Login** → Entra con email/contraseña
2. **Dashboard** → Ve salas disponibles
3. **Clic en sala** → Entra a la partida
4. **Game** → 10 rondas de elección COOPERATE/BETRAY
5. **Resultados** → Ve puntos finales y desglose
6. **Volver a Dashboard** → Puede jugar otra o ver reglas
7. **Rules** → Puede leer las 5 reglas avanzadas
8. **Leaderboard** → Ve rankings globales

---

## 🎮 Acciones Clave

### Desde Dashboard
- Clic en sidebar: Filtrar salas
- Clic en sala: Entrar
- Botón REFRESCAR: Actualizar lista
- Botón REGLAS (⚙️): Ir a /rules
- Botón RANKING (📊): Ir a /leaderboard

### Desde Rules
- Clic en tabs: Cambiar regla
- Clic ENTRAR EN PARTIDA: Ir a /game/ai
- Clic VOLVER: Ir a Dashboard

### Desde Game
- Clic COOPERAR/TRAICIONAR: Hacer elección
- Esperar 8 segundos: Auto-elige si no decides
- Clic SIGUIENTE: Ir a próxima ronda
- Game Over: Ver resultados

---

**Este es el diseño épico, tipo Chess.com/PokerStars que pediste. ¡Listo para implementación!**
