# INSTRUCCIONES PARA DEPLOY EN CLOUDFLARE

## Paso 1: Crear repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre: `prisionero`
3. Descripción: `Trust or Betray - Prisoner's Dilemma Game`
4. Selecciona **Public** o **Private** (tu preferencia)
5. Click en "Create repository"

## Paso 2: Push del código

Ejecuta estos comandos en PowerShell:

```powershell
cd c:\prisionero

# Agregar el repositorio remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/wrizzo6802/prisionero.git

# Cambiar rama a main
git branch -M main

# Push
git push -u origin main
```

## Paso 3: Conectar a Cloudflare Pages

1. Ve a https://dash.cloudflare.com
2. **Workers & Pages** → Click en "Create application"
3. Tab: **Pages**
4. **Connect to Git**
5. Selecciona GitHub y autoriza
6. Busca y selecciona el repo `prisionero`
7. En Project Settings:
   - **Framework**: None (framework preset)
   - **Build command**: `npm run build --workspace=frontend`
   - **Build output directory**: `frontend/dist`
8. Click en **Save and Deploy**

## Paso 4: Variables de entorno (si es necesario)

En Cloudflare Pages → Settings → Environment variables:
```
VITE_API_URL = https://prisionero-backend.workers.dev
```

## Resultado Final

Tu aplicación estará disponible en:
- **Frontend**: https://prisionero.pages.dev
- **Backend**: https://prisionero-backend.workers.dev (via Socket.IO)

¡Listo! 🎉
