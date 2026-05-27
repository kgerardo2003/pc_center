# Factura XML Personalizable

Aplicacion web estatica para cargar una factura en XML, personalizar logo y colores, previsualizarla y exportarla como PDF desde el navegador.

## Uso

1. Abre `index.html` en tu navegador.
2. Carga tu archivo `.xml`.
3. Carga tu logo en PNG, JPG, WebP o SVG.
4. Ajusta colores, plantilla, formato de impresion y datos editables.
5. Elige el tamano de papel: **Carta**, **Media carta** o **Ticket**.
6. Ajusta el area del logo, usa el zoom interno si tu imagen trae margenes, y alinealo a la izquierda, centro o derecha.
7. Revisa el codigo QR de verificacion SAT.
8. Presiona **Exportar PDF** y elige **Guardar como PDF**.

La exportacion ajusta automaticamente la factura para que salga en una sola hoja del formato seleccionado. Si la factura tiene muchos articulos, el contenido se compacta y reduce para evitar paginas adicionales.

El logo y los ajustes visuales quedan guardados en este navegador. Despues de configurarlos una vez, al volver a abrir la app solo necesitas cargar el XML de la factura.

## Publicar en GitHub Pages

Opcion con GitHub web:

1. Crea un repositorio nuevo en GitHub.
2. Sube estos archivos y carpetas: `index.html`, `styles.css`, `app.js`, `assets`, `examples`, `.nojekyll`.
3. Entra a **Settings > Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/root`.
6. Guarda los cambios.

Opcion con Git instalado:

```bash
git init
git add .
git commit -m "Crear personalizador de facturas XML"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

Despues activa GitHub Pages desde **Settings > Pages**.

## Privacidad

La lectura del XML y del logo ocurre en el navegador. La aplicacion no envia datos a servidores externos.

## Formato XML

Incluye soporte para facturas FEL de Guatemala con nodos como `DatosGenerales`, `Emisor`, `Receptor`, `Items`, `Totales` y `NumeroAutorizacion`. Si algun dato no aparece en el XML, la app usa un valor editable de respaldo.

## QR SAT

Cuando el XML incluye `NumeroAutorizacion`, la app genera un QR local con el enlace del verificador publico SAT usando `tipo=autorizacion`, numero de autorizacion, NIT emisor, ID receptor y gran total. Si se detecta un documento en contingencia con `NumeroAcceso`, usa `tipo=contingencia`.
