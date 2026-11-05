# Calculadora de Remates (PWA)

## Contenido
- Calculadora responsive para iPhone y escritorio.
- Cinco vehículos precargados con precios base.
- Cálculo de seña, honorarios, aporte, saldo y costo total.
- Gastos adicionales editables.
- Límite de puja según valor de mercado y descuento objetivo.
- Guarda los datos localmente en el navegador.
- Service worker para funcionamiento offline después de la primera carga.

## Publicación para instalar en iPhone
La instalación PWA en iPhone requiere servir los archivos por HTTPS (o localhost para pruebas).
1. Subí el contenido de esta carpeta a un hosting estático HTTPS (por ejemplo GitHub Pages o Netlify).
2. Abrí la URL en Safari del iPhone.
3. Tocá Compartir > Añadir a pantalla de inicio.
4. Abrí desde el nuevo ícono. Después de la primera carga, los recursos quedan disponibles offline.

Abrir index.html directamente desde Archivos no instala la PWA ni habilita el service worker.

## Fórmulas
- Aporte = oferta × honorarios% × aporte% (6% de honorarios).
- Pago inicial = seña + honorarios + aporte.
- Saldo = oferta × (1 - seña%).
- Costo adquisición = oferta + honorarios + aporte.
- Costo completo = adquisición + reparaciones + patentamiento + GNC + seguro + otros + reserva.
- Puja máxima = (mercado × (1 - descuento) - gastos adicionales) / (1 + honorarios% × (1 + aporte%)).

Los porcentajes y los valores son editables. Verificar siempre el pliego oficial vigente.
