# Termoconversor · Conversor de temperaturas

Aplicación web educativa para convertir temperaturas entre **Celsius (°C)**, **Kelvin (K)**, **Fahrenheit (°F)** y **Rankine (°R)**. Está hecha solo con HTML5, CSS3 y JavaScript puro: no necesita servidor, base de datos, frameworks ni instalaciones.

## Funcionalidades

- Conversión automática mientras se escribe y botón **Convertir**.
- Selección de escala de origen y destino, botón para **intercambiarlas** y botón **Limpiar**.
- Validación de la entrada y control del **cero absoluto** en cada escala (−273.15 °C, 0 K, −459.67 °F, 0 °R).
- Resultado destacado, con número de decimales configurable (0 a 4; por defecto 2).
- **Fórmula aplicada** y sustitución paso a paso del valor ingresado.
- Equivalencias simultáneas en las cuatro escalas.
- Termómetro que cambia de color según la temperatura (frío → templado → caliente) y una referencia cercana (p. ej., "temperatura del cuerpo humano").
- **Historial** de las últimas 10 conversiones de la sesión (clic en una para recargarla).
- Botón para **copiar** el resultado al portapapeles.
- Modo claro y oscuro, diseño responsive y navegación por teclado.
- Sección educativa: qué representa cada escala, sus usos, el cero absoluto y un ejemplo resuelto.

### Atajos de teclado

| Tecla | Acción |
|---|---|
| `Enter` | Convertir y guardar en el historial |
| `Alt` + `I` | Intercambiar escalas |
| `Esc` | Limpiar el formulario (con el foco dentro del formulario) |
| `Tab` / `Shift` + `Tab` | Moverse entre controles |

## Archivos

Todos los archivos están en la misma carpeta (sin subcarpetas):

```
index.html   → estructura de la página
styles.css   → diseño, temas y animaciones
script.js    → conversiones, validación e interacción
README.md    → este documento
```

## 1. Abrir la aplicación localmente

1. Descomprime el archivo ZIP.
2. Haz doble clic en `index.html`. Se abrirá en tu navegador (Chrome, Edge, Firefox o Safari).

No se necesita conexión a internet ni ningún programa adicional.

## 2. Subir los archivos a un repositorio de GitHub

1. Inicia sesión en [github.com](https://github.com) y pulsa **New** (Nuevo repositorio).
2. Escribe un nombre, por ejemplo `conversor-temperaturas`, marca el repositorio como **Public** y pulsa **Create repository**.
3. En la página del repositorio, haz clic en **uploading an existing file** (o **Add file → Upload files**).
4. Arrastra los cuatro archivos (`index.html`, `styles.css`, `script.js`, `README.md`). Súbelos directamente, **no** dentro de una carpeta.
5. Escribe un mensaje (por ejemplo, "Versión inicial") y pulsa **Commit changes**.

Si prefieres la terminal:

```bash
git init
git add index.html styles.css script.js README.md
git commit -m "Versión inicial del conversor de temperaturas"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/conversor-temperaturas.git
git push -u origin main
```

## 3. Activar GitHub Pages

1. En el repositorio, entra a **Settings → Pages**.
2. En **Build and deployment → Source**, elige **Deploy from a branch**.
3. En **Branch**, selecciona `main` y la carpeta `/ (root)`. Pulsa **Save**.
4. Espera uno o dos minutos y recarga la página. Aparecerá la dirección pública, con el formato:
   `https://TU-USUARIO.github.io/conversor-temperaturas/`

Las rutas entre archivos son relativas (`styles.css`, `script.js`), por lo que la aplicación funciona igual localmente y en GitHub Pages.

## Fórmulas implementadas

| Conversión | Fórmula |
|---|---|
| Celsius → Kelvin | K = °C + 273.15 |
| Kelvin → Celsius | °C = K − 273.15 |
| Celsius → Fahrenheit | °F = (°C × 9/5) + 32 |
| Fahrenheit → Celsius | °C = (°F − 32) × 5/9 |
| Celsius → Rankine | °R = (°C + 273.15) × 9/5 |
| Rankine → Celsius | °C = (°R × 5/9) − 273.15 |
| Kelvin → Rankine | °R = K × 9/5 |
| Rankine → Kelvin | K = °R × 5/9 |
| Fahrenheit → Kelvin | K = (°F + 459.67) × 5/9 |
| Kelvin → Fahrenheit | °F = (K × 9/5) − 459.67 |
| Fahrenheit → Rankine | °R = °F + 459.67 |
| Rankine → Fahrenheit | °F = °R − 459.67 |

Cuando el origen y el destino son la misma escala, el valor se devuelve sin cambios.

## Valores de verificación

| Entrada | °C | K | °F | °R |
|---|---|---|---|---|
| Cero absoluto | −273.15 | 0 | −459.67 | 0 |
| Congelación del agua | 0 | 273.15 | 32 | 491.67 |
| Cuerpo humano | 37 | 310.15 | 98.6 | 558.27 |
| Ebullición del agua | 100 | 373.15 | 212 | 671.67 |
| Igualdad °C = °F | −40 | 233.15 | −40 | 419.67 |
