const vehicles={
 sonic:{base:7500000},ecosport:{base:11600000},tracker:{base:12000000},
 "p208-2016":{base:12500000},"p208-2022":{base:18000000}
};
const ids=["offer","depositRate","commissionRate","contributionRate","usdRate","repairs","registration","gnc","insurance","other","market","discount","reserve","mrpaValue"];
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(Math.round(Number.isFinite(n)?n:0));
const num=id=>Math.max(0,Number($(id).value)||0);
const STORAGE_KEY="remates-vehicles-state";
const SELECTED_KEY="remates-selected-vehicle";
let marketData=null;
let activeVehicle=null;
let defaults={};
let vehicleStates={};

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
  localStorage.setItem(SELECTED_KEY,activeVehicle);
 }catch(e){}
}
function loadVehicle(key){
 const state=vehicleStates[key]||{};
 ids.forEach(id=>$(id).value=state[id]!==undefined?state[id]:defaults[id]);
 if(!vehicleStates[key]){
  $("offer").value=vehicles[key].base;
  const market=currentMarket();
  if(market)$("market").value=market.market;
 }
 // Si existe una MRPA cargada, recalcular el patentamiento para este vehículo.
 if(num("mrpaValue")>0) $("registration").value=String(Math.round(90*num("mrpaValue")));
 setMarketReference(false);
 updateBasePrice();
 calculate();
}
function currentMarket(){return marketData?.vehicles?.[$("vehicle").value]||null;}
function updateBasePrice(){$("basePrice").textContent=fmt(vehicles[$("vehicle").value].base);}
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
function calculate(){
 const offer=num("offer"), depRate=num("depositRate")/100, commRate=num("commissionRate")/100, contribRate=num("contributionRate")/100;
 const deposit=offer*depRate, commission=offer*commRate, contribution=commission*contribRate;
 const initial=deposit+commission+contribution, balance=offer*(1-depRate);
 const acquisition=offer+commission+contribution;
 const extras=num("repairs")+num("registration")+num("gnc")+num("insurance")+num("other");
 const reserve=num("reserve"), allIn=acquisition+extras+reserve, usdRate=num("usdRate");
 updateBasePrice();
 $("deposit").textContent=fmt(deposit);$("commission").textContent=fmt(commission);$("contribution").textContent=fmt(contribution);
 $("initial").textContent=fmt(initial);$("balance").textContent=fmt(balance);
 $("acquisition").textContent=fmt(acquisition);$("extras").textContent=fmt(extras+reserve);
 $("allIn").textContent=fmt(allIn);$("usd").textContent=usdRate?new Intl.NumberFormat("es-AR",{maximumFractionDigits:0}).format(allIn/usdRate):"—";
 const market=num("market"), discount=num("discount")/100;
 const max=(market*(1-discount)-extras-reserve)/(1+commRate*(1+contribRate));
 if(market>0){
  $("maxBid").textContent=fmt(Math.max(0,max));
  const margin=market-allIn;
  if(offer<=max){$("status").className="status good";$("status").textContent=`Dentro del objetivo: diferencia frente al mercado ${fmt(margin)}.`;}
  else{$("status").className="status bad";$("status").textContent=`Supera la puja máxima por ${fmt(offer-max)}.`;}
 }else{$("maxBid").textContent="Ingresá un valor de mercado para calcularlo.";$("status").className="status neutral";$("status").textContent="Sin valor de mercado comparable.";}
 saveVehicle();
}

readStorage();
$("vehicle").addEventListener("change",()=>{
 // El evento se dispara cuando el select ya tiene el nuevo valor; guardar usando
 // activeVehicle evita escribir los datos anteriores en el vehículo recién elegido.
 saveVehicle();
 activeVehicle=$("vehicle").value;
 loadVehicle(activeVehicle);
});
ids.forEach(id=>$(id).addEventListener("input",calculate));
$("mrpaValue").addEventListener("input",()=>{
 const mrpa=num("mrpaValue");
 $("registration").value=String(Math.round(90*mrpa));
 calculate();
});
$("useMarket").addEventListener("click",()=>{setMarketReference(true);calculate();});
document.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{$("offer").value=Math.max(0,num("offer")+Number(b.dataset.add));calculate();}));
$("useBase").addEventListener("click",()=>{$("offer").value=vehicles[$("vehicle").value].base;calculate();});
$("roundOffer").addEventListener("click",()=>{$("offer").value=Math.round(num("offer")/100000)*100000;calculate();});
$("clearLocalData").addEventListener("click",()=>{
 if(!window.confirm("¿Borrar todos los valores y configuraciones guardados de los cinco vehículos en este dispositivo? Esta acción no se puede deshacer."))return;
 localStorage.removeItem(STORAGE_KEY);
 localStorage.removeItem(SELECTED_KEY);
 localStorage.removeItem("remates-state");
 window.location.reload();
});
loadMarketData();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
