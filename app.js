const vehicles={
 sonic:{base:7500000},ecosport:{base:11600000},tracker:{base:12000000},
 "p208-2016":{base:12500000},"p208-2022":{base:18000000}
};
const ids=["vehicle","offer","depositRate","commissionRate","contributionRate","usdRate","repairs","registration","gnc","insurance","other","market","discount","reserve"];
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(Math.round(Number.isFinite(n)?n:0));
const num=id=>Math.max(0,Number($(id).value)||0);
let marketData=null;
function save(){const state={};ids.forEach(id=>state[id]=$(id).value);try{localStorage.setItem("remates-state",JSON.stringify(state));}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem("remates-state")||"{}");ids.forEach(id=>{if(s[id]!==undefined)$(id).value=s[id];});}catch(e){}}
function currentMarket(){return marketData?.vehicles?.[$("vehicle").value]||null;}
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
  setMarketReference(false);
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
 $("basePrice").textContent=fmt(vehicles[$("vehicle").value].base);
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
 save();
}
load();
$("vehicle").addEventListener("change",()=>{$("offer").value=vehicles[$("vehicle").value].base;setMarketReference(true);calculate();});
ids.filter(id=>id!=="vehicle").forEach(id=>$(id).addEventListener("input",calculate));
$("useMarket").addEventListener("click",()=>{setMarketReference(true);calculate();});
document.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{$("offer").value=Math.max(0,num("offer")+Number(b.dataset.add));calculate();}));
$("useBase").addEventListener("click",()=>{$("offer").value=vehicles[$("vehicle").value].base;calculate();});
$("roundOffer").addEventListener("click",()=>{$("offer").value=Math.round(num("offer")/100000)*100000;calculate();});
calculate();
loadMarketData();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
