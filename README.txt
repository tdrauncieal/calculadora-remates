CALCULADORA DE REMATES - PWA

Publicación:
1. Descomprimir el ZIP.
2. Subir TODOS los archivos de esta carpeta a la raíz del repositorio GitHub.
3. GitHub > Settings > Pages > Deploy from a branch > main > /(root).
4. Abrir la URL de GitHub Pages en Safari y Añadir a pantalla de inicio.

Referencia de mercado:
- market-values.json contiene estadísticas calculadas desde market_radar.db.
- Snapshots: 04/11/2026.
- Precios en ARS; publicaciones en USD convertidas a ARS a 1.500 ARS/USD.
- Son precios publicados, no precios de operaciones cerradas.
- Mediana y rango basados en comparables por versión, combustible y kilometraje.
- Revisar notas de calidad de muestra, especialmente Tracker y Sonic.

La app guarda la configuración localmente en cada dispositivo (localStorage).
Los datos no se sincronizan automáticamente entre dispositivos.

Persistencia por vehículo:
- Cada vehículo conserva su propia oferta, cargos, cotización, costos adicionales,
  valor de mercado, descuento objetivo y reserva.
- Al cambiar de vehículo se recuperan sus últimos valores guardados.
- Los datos se almacenan en localStorage del navegador/dispositivo; no se sincronizan
  automáticamente entre el iPhone y otros dispositivos.
- Al actualizar desde una versión anterior, la configuración global existente se
  migra al vehículo que estaba seleccionado al abrir la nueva versión por primera vez.


Descuento de equilibrio para la base:
- La app calcula el descuento necesario para que la puja máxima alcance la base
  publicada, considerando honorarios, aporte y todos los costos adicionales cargados.
- El botón "Ajustar descuento a precio base" actualiza el descuento del vehículo
  seleccionado; se conserva de forma independiente para cada vehículo.
- Si la base ya es viable con 0% de descuento, la app lo informa y permite ajustar a 0%.
- Si el descuento necesario supera el 100%, informa que la base no es viable frente
  al valor de mercado cargado.
