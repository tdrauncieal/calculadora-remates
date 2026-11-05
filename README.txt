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


INSCRIPCION INICIAL
Para estimar patentamiento/inscripcion se tomara provisoriamente el encuadre de automotor subastado: 90 MRPA. El importe en pesos se carga manualmente en "Patentamiento / inscripcion". Confirmar con el Registro el encuadre y el valor vigente de MRPA antes de cerrar el presupuesto.


CALCULO AUTOMATICO DE INSCRIPCION (90 MRPA)
Ingresar el valor vigente en pesos de una MRPA en el campo correspondiente. El campo Patentamiento/inscripcion se calcula automaticamente como 90 x MRPA y se guarda por vehiculo. El anexo de aranceles suministrado indica 90 MRPA para automotores armados fuera de fabrica/subastados; confirmar encuadre con el Registro.

BORRAR DATOS LOCALES
El boton "Borrar datos locales de la calculadora" elimina las configuraciones guardadas de todos los vehiculos en el dispositivo actual (localStorage), previa confirmacion. No elimina la aplicacion ni los archivos cacheados.


VERSION 12.0.0 - CALCULO DE INSCRIPCION CON BASE FISCAL
- Selector de encuadre de arancel:
  * Subastado: 90 MRPA (alternativa predeterminada).
  * Porcentual: 1% de la mayor base entre precio de adquisicion con cargos del remate
    y valuacion fiscal DNRPA, con minimo de 52 MRPA.
- Los encuadres son alternativos y no se suman.
- La valuacion fiscal no altera el valor de mercado ni la puja maxima.
- Confirmar con el Registro el encuadre legal aplicable al lote y los impuestos
  provinciales/municipales adicionales, que no quedan incluidos automaticamente.
