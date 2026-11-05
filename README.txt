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


SIMULADOR DE INSCRIPCION INICIAL
La aplicacion compara dos escenarios del Anexo I:
A) 1% de la mayor base estimada (oferta + cargos del remate o valuacion oficial), con minimo de 52 MRPA.
B) 90 MRPA para automotores armados fuera de fabrica/subastados.
Ingresar el valor vigente de una MRPA y, si se conoce, la valuacion oficial. Los botones permiten copiar el importe de cada escenario al campo Patentamiento/tramites. Es una estimacion para comparar: confirmar con el Registro el encuadre aplicable y los conceptos que integran la base.
