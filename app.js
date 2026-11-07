const vehicles={
 sonic:{base:7500000},ecosport:{base:11600000},tracker:{base:12000000},
 "p208-2016":{base:12500000},"p208-2022":{base:18000000}
};
const ids=["offer","depositRate","commissionRate","contributionRate","usdRate","repairs","registration","insurance","market","discount","mrpaValue","fiscalValue"];
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(Math.round(Number.isFinite(n)?n:0));
const num=id=>Math.max(0,Number($(id).value)||0);
const STORAGE_KEY="remates-vehicles-state";
const SELECTED_KEY="remates-selected-vehicle";
const GLOBAL_KEY="remates-global-costs";
const globalIds=["gnc","other","reserve"];
let marketData=null;
let activeVehicle=null;
let defaults={};
let vehicleStates={};
const APP_VERSION="18.0.0";
const fiscalDefaults={
 sonic:7697200,
 ecosport:0,
 tracker:11668800,
 "p208-2016":16743500,
 "p208-2022":21401700
};

function readStorage(){
 ids.forEach(id=>defaults[id]=$(id).value);
 try{
  vehicleStates=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");
  if(!vehicleStates||typeof vehicleStates!=="object"||Array.isArray(vehicleStates))vehicleStates={};
  // Migración: la configuración anterior era única y global. Se asigna al vehículo
  // que estaba seleccionado, conservando los valores que el usuario ya había cargado.
  const old=JSON.parse(localStorage.getItem("remates-state")||"null");
  const selected=localStorage.getItem(SELECTED_KEY)||$("vehicle").value;
  if(old&&!vehicleStates[selected]){
   const migrated={};
   ids.forEach(id=>{if(old[id]!==undefined)migrated[id]=String(old[id]);});
   vehicleStates[selected]=migrated;
   localStorage.setItem(STORAGE_KEY,JSON.stringify(vehicleStates));
  }
  activeVehicle=vehicles[ selected ] ? selected : $("vehicle").value;
  $("vehicle").value=activeVehicle;
  const globalState=JSON.parse(localStorage.getItem(GLOBAL_KEY)||"{}");
  globalIds.forEach(id=>{
   if(globalState[id]!==undefined)$(id).value=String(globalState[id]);
   else {
    // Migra una sola vez los importes globales existentes del vehículo seleccionado.
    const legacy=vehicleStates[activeVehicle];
    if(legacy && legacy[id]!==undefined)$(id).value=String(legacy[id]);
   }
  });
  // Elimina los campos globales de los estados individuales para evitar divergencias.
  Object.values(vehicleStates).forEach(s=>globalIds.forEach(id=>delete s[id]));
  localStorage.setItem(GLOBAL_KEY,JSON.stringify(Object.fromEntries(globalIds.map(id=>[id,$(id).value]))));
  localStorage.setItem(STORAGE_KEY,JSON.stringify(vehicleStates));
 }catch(e){activeVehicle=$("vehicle").value;vehicleStates={};}
 loadVehicle(activeVehicle);
}
function saveVehicle(){
 if(!activeVehicle)return;
 const state={};
 ids.forEach(id=>state[id]=$(id).value);
 vehicleStates[activeVehicle]=state;
 try{
  localStorage.setItem(STORAGE_KEY,JSON.stringify(vehicleStates));
  localStorage.setItem(GLOBAL_KEY,JSON.stringify(Object.fromEntries(globalIds.map(id=>[id,$(id).value]))));
  localStorage.setItem(SELECTED_KEY,activeVehicle);
 }catch(e){}
}
function loadVehicle(key){
 const state=vehicleStates[key]||{};
 ids.forEach(id=>$(id).value=state[id]!==undefined?state[id]:defaults[id]);
 if(state.fiscalValue===undefined) $("fiscalValue").value=String(fiscalDefaults[key]||0);
 if(!vehicleStates[key]){
  $("offer").value=vehicles[key].base;
  $("fiscalValue").value=String(fiscalDefaults[key]||0);
  const market=currentMarket();
  if(market)$("market").value=market.market;
 }
 // La opción por defecto para lotes subastados es 90 MRPA.
 if(num("mrpaValue")<=0) $("mrpaValue").value="1027.50";
 updateRegistrationEstimate();
 setMarketReference(false);
 updateFiscalMeta();
 updateBasePrice();
 calculate();
}
function currentMarket(){return marketData?.vehicles?.[$("vehicle").value]||null;}
function updateBasePrice(){$("basePrice").textContent=fmt(vehicles[$("vehicle").value].base);}
function updateFiscalMeta(){
 const key=$("vehicle").value;
 const value=Number($("fiscalValue").value)||0;
 const sourceDate="01/11/2026";
 $("fiscalMeta").textContent=value>0?`Base fiscal de referencia DNRPA (vigencia ${sourceDate}). Se reserva exclusivamente para el cálculo de patentamiento; no interviene en la evaluación comercial.`:"Sin valuación identificada para esta versión/año en la tabla DNRPA. Cargar manualmente cuando se confirme; se utilizará exclusivamente para patentamiento.";
}
function setMarketReference(force=false){
 const m=currentMarket();
 if(!m)return;
 if(force || num("market")===0) $("market").value=m.market;
 const note=m.note ? " "+m.note : "";
 $("marketMeta").textContent=`Mediana ${fmt(m.market)} · ${m.count} avisos · ${m.scope} · ${m.km_min.toLocaleString("es-AR")}–${m.km_max.toLocaleString("es-AR")} km. Rango publicado: ${fmt(m.min)}–${fmt(m.max)}.${note}`;
}
async function loadMarketData(){
 try{
  const r=await fetch("./market-values.json",{cache:"no-store"});
  if(!r.ok)throw new Error("No se pudo cargar la referencia");
  marketData=await r.json();
  // Solo completa el mercado si el vehículo todavía no tiene un valor guardado.
  const saved=vehicleStates[activeVehicle];
  if(!saved || saved.market===undefined || saved.market==="" || Number(saved.market)===0)setMarketReference(false);
  else setMarketReference(false);
  calculate();
 }catch(e){
  $("marketMeta").textContent="No se pudo cargar el archivo de referencias. Podés ingresar el valor manualmente.";
 }
}
function updateRegistrationEstimate(){
 const mrpa=num("mrpaValue");
 const auction=90*mrpa;
 $("registration").value=String(Math.round(auction*100)/100);
 $("registrationMeta").textContent=`Arancel fijo para vehículo subastado: 90 MRPA = ${fmt(auction)}. La valuación fiscal se conserva solo como dato informativo.`;
}
function calculate(){
 const offer=num("offer"), depRate=num("depositRate")/100, commRate=num("commissionRate")/100, contribRate=num("contributionRate")/100;
 const deposit=offer*depRate, commission=offer*commRate, contribution=commission*contribRate;
 const initial=deposit+commission+contribution, balance=offer*(1-depRate);
 const acquisition=offer+commission+contribution;
 updateRegistrationEstimate();
 const extras=num("repairs")+num("registration")+num("gnc")+num("insurance")+num("other");
 const reserve=num("reserve"), allIn=acquisition+extras+reserve, usdRate=num("usdRate");
 updateBasePrice();
 $("deposit").textContent=fmt(deposit);$("commission").textContent=fmt(commission);$("contribution").textContent=fmt(contribution);
 $("initial").textContent=fmt(initial);$("balance").textContent=fmt(balance);
 $("acquisition").textContent=fmt(acquisition);$("extras").textContent=fmt(extras+reserve);
 $("allIn").textContent=fmt(allIn);$("usd").textContent=usdRate?new Intl.NumberFormat("es-AR",{maximumFractionDigits:0}).format(allIn/usdRate):"—";
 const market=num("market"), discount=num("discount")/100;
 const max=(market*(1-discount)-extras-reserve)/(1+commRate*(1+contribRate));
 const base=vehicles[$("vehicle").value].base;
 const factor=1+commRate*(1+contribRate);
 const requiredDiscount=1-((base*factor+extras+reserve)/market);
 $("adjustDiscountToBase").textContent=(market>0 && requiredDiscount>=0 && requiredDiscount<=0.90)
  ? `AJUSTAR DESCUENTO (${(requiredDiscount*100).toFixed(1)}%) A PRECIO BASE`
  : "AJUSTAR DESCUENTO A PRECIO BASE";
 if(market>0){
  $("maxBid").textContent=fmt(Math.max(0,max));
  const margin=market-allIn;
  if(offer<=max){const marginPct=market>0?(margin/market*100):0;$("status").className="status good";$("status").textContent=`Dentro del objetivo: diferencia frente al mercado ${fmt(margin)} (${marginPct.toFixed(1)}%).`;}
  else{$("status").className="status bad";$("status").textContent=`Supera la puja máxima por ${fmt(offer-max)}.`;}
 }else{$("maxBid").textContent="Ingresá un valor de mercado para calcularlo.";$("status").className="status neutral";$("status").textContent="Sin valor de mercado comparable.";}
 saveVehicle();
}

// Sticky secuencial: el selector permanece fijo y el resultado se compacta
// al llegar debajo de él. Ambos se liberan al terminar setup-scroll-zone.
function updateStickyLayout(){
 const vehicle=document.querySelector(".vehicle-sticky");
 if(!vehicle)return;
 const h=Math.ceil(vehicle.getBoundingClientRect().height);
 document.documentElement.style.setProperty("--vehicle-sticky-height",`${h}px`);
 updateResultCompact();
}
function updateResultCompact(){
 const vehicle=document.querySelector(".vehicle-sticky");
 const result=document.querySelector(".result-sticky");
 const zone=document.querySelector(".setup-scroll-zone");
 if(!vehicle||!result||!zone)return;
 const offset=vehicle.getBoundingClientRect().height;
 const r=result.getBoundingClientRect();
 const zoneRect=zone.getBoundingClientRect();
 const shouldCompact=r.top<=offset+3 && zoneRect.bottom>offset+30;
 result.classList.toggle("is-compact",shouldCompact);
}
window.addEventListener("scroll",updateResultCompact,{passive:true});
window.addEventListener("resize",updateStickyLayout);
if("ResizeObserver" in window){
 const stickyObserver=new ResizeObserver(updateStickyLayout);
 stickyObserver.observe(document.querySelector(".vehicle-sticky"));
}

readStorage();
$("vehicle").addEventListener("change",()=>{
 // El evento se dispara cuando el select ya tiene el nuevo valor; guardar usando
 // activeVehicle evita escribir los datos anteriores en el vehículo recién elegido.
 saveVehicle();
 activeVehicle=$("vehicle").value;
 loadVehicle(activeVehicle);
});
ids.forEach(id=>$(id).addEventListener("input",()=>{if(id==="fiscalValue")updateFiscalMeta();calculate();}));
globalIds.forEach(id=>$(id).addEventListener("input",()=>{localStorage.setItem(GLOBAL_KEY,JSON.stringify(Object.fromEntries(globalIds.map(k=>[k,$(k).value]))));calculate();}));
$("appVersion").textContent=APP_VERSION;
$("mrpaValue").addEventListener("input",calculate);
$("useMarket").addEventListener("click",()=>{setMarketReference(true);calculate();});
$("adjustDiscountToBase").addEventListener("click",()=>{
 const market=num("market");
 if(market<=0){
  window.alert("Primero ingresá o cargá un valor de mercado comparable.");
  return;
 }
 const base=vehicles[$("vehicle").value].base;
 const commRate=num("commissionRate")/100;
 const contribRate=num("contributionRate")/100;
 const extras=num("repairs")+num("registration")+num("gnc")+num("insurance")+num("other")+num("reserve");
 const factor=1+commRate*(1+contribRate);
 const requiredDiscount=1-((base*factor+extras)/market);
 if(requiredDiscount<0 || requiredDiscount>0.90){
  window.alert(`Con los valores actuales no existe un descuento entre 0% y 90% que haga coincidir la puja máxima con la base. Descuento matemático requerido: ${(requiredDiscount*100).toFixed(1)}%.`);
  return;
 }
 $("discount").value=(requiredDiscount*100).toFixed(1);
 calculate();
});
document.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{$("offer").value=Math.max(0,num("offer")+Number(b.dataset.add));calculate();}));
$("useBase").addEventListener("click",()=>{$("offer").value=vehicles[$("vehicle").value].base;calculate();});
$("roundOffer").addEventListener("click",()=>{$("offer").value=Math.round(num("offer")/100000)*100000;calculate();});
$("clearLocalData").addEventListener("click",()=>{
 if(!window.confirm("¿Borrar todos los valores y configuraciones guardados de los cinco vehículos EN ESTE DISPOSITIVO? Esta acción no se puede deshacer."))return;
 localStorage.removeItem(STORAGE_KEY);
 localStorage.removeItem(GLOBAL_KEY);
 localStorage.removeItem(SELECTED_KEY);
 localStorage.removeItem("remates-state");
 window.location.reload();
});
loadMarketData();
updateStickyLayout();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
