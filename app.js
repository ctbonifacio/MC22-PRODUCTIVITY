import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const cfg=window.MC22_CONFIG;
const sb=createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const num=v=>Number(v)||0;
const pct=(a,t)=>t>0?Math.min(100,Math.max(0,a/t*100)):0;
function toast(s){const t=$("#toast");if(t){t.textContent=s;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2500)}}
function configOK(){return cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("PASTE_") && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("PASTE_")}
async function requireAuth(){if(!configOK()){location.href="setup.html";return null} const {data:{session}}=await sb.auth.getSession();if(!session){location.href="login.html";return null}return session}
const session=await requireAuth(); if(!session) throw new Error("not authenticated");
$("#logoutBtn")?.addEventListener("click",async()=>{await sb.auth.signOut();location.href="login.html"});
async function getAgents(){const {data,error}=await sb.from("agents").select("*").order("name");if(error){toast(error.message);return[]}return data||[]}
function metric(target,actual,color){const p=pct(actual,target),v=Math.max(0,target-actual);return `<div class="metric-card" style="--accent:${color};--percent:${p}%"><div class="ring"><span>${Math.round(p)}%</span></div><div><div class="metric-info"><div><span>Target</span><strong>${target.toLocaleString()}</strong></div><div><span>Actual</span><strong>${actual.toLocaleString()}</strong></div><div><span>Variance</span><strong>${v.toLocaleString()}</strong></div></div><div class="progress"><div style="width:${p}%"></div></div><div class="ratio">${actual.toLocaleString()} / ${target.toLocaleString()}</div></div></div>`}
function renderDashboard(data){const rows=$("#rows");if(!rows)return;$("#agentCount").textContent=`${data.length} agents`;rows.innerHTML=data.map(a=>`<div class="agent-card">${a.photo_url?`<img class="agent-photo" src="${esc(a.photo_url)}" onerror="this.style.display='none'">`:`<div class="agent-photo placeholder">${esc((a.name||"?")[0])}</div>`}<div class="agent-name-display">${esc(a.name)}</div><div class="agent-message">${esc(a.message||"")}</div></div>${metric(a.talk_target,a.talk_actual,a.accent)}${metric(a.rpc_target,a.rpc_actual,a.accent)}${metric(a.nptp_target,a.nptp_actual,a.accent)}${metric(a.npayment_target,a.npayment_actual,a.accent)}`).join("")}
async function dashboard(){const d=await getAgents();renderDashboard(d)}
function rowValue(r,s){return r.querySelector(s)?.value??""}
async function uploadPhoto(file,agentId){if(!file)return null;if(file.size>5*1024*1024)throw Error("Photo must be 5 MB or smaller.");const ext=(file.name.split(".").pop()||"jpg").toLowerCase();const path=`${agentId}/${crypto.randomUUID()}.${ext}`;const {error}=await sb.storage.from(cfg.STORAGE_BUCKET).upload(path,file,{upsert:true,contentType:file.type});if(error)throw error;const {data}=sb.storage.from(cfg.STORAGE_BUCKET).getPublicUrl(path);return data.publicUrl}
async function renderTable(){
 const body=$("#dataTable tbody");if(!body)return;const data=await getAgents();body.innerHTML="";
 data.forEach(a=>{const r=document.importNode($("#rowTemplate").content,true),tr=r.querySelector("tr");
 const set=(s,v)=>tr.querySelector(s).value=v??"";
 set(".agent-name",a.name);set(".talkTarget",a.talk_target);set(".talkActual",a.talk_actual);set(".rpcTarget",a.rpc_target);set(".rpcActual",a.rpc_actual);set(".nptpTarget",a.nptp_target);set(".nptpActual",a.nptp_actual);set(".npayTarget",a.npayment_target);set(".npayActual",a.npayment_actual);set(".message",a.message);set(".accent",a.accent||"#1478c9");
 const img=tr.querySelector(".photo-preview");if(a.photo_url){img.src=a.photo_url;img.style.display="block"}
 tr.querySelector(".photo-file").addEventListener("change",e=>{const f=e.target.files[0];if(f){img.src=URL.createObjectURL(f);img.style.display="block"}});
 tr.querySelector(".save-row").onclick=async()=>{try{
   let photo=a.photo_url;const f=tr.querySelector(".photo-file").files[0];if(f)photo=await uploadPhoto(f,a.id);
   const payload={name:rowValue(tr,".agent-name").trim(),photo_url:photo,talk_target:num(rowValue(tr,".talkTarget")),talk_actual:num(rowValue(tr,".talkActual")),rpc_target:num(rowValue(tr,".rpcTarget")),rpc_actual:num(rowValue(tr,".rpcActual")),nptp_target:num(rowValue(tr,".nptpTarget")),nptp_actual:num(rowValue(tr,".nptpActual")),npayment_target:num(rowValue(tr,".npayTarget")),npayment_actual:num(rowValue(tr,".npayActual")),message:rowValue(tr,".message"),accent:rowValue(tr,".accent")};
   const {error}=await sb.from("agents").update(payload).eq("id",a.id);if(error)throw error;toast("Agent saved.");renderTable();
 }catch(e){toast(e.message)}};
 tr.querySelector(".delete-btn").onclick=async()=>{if(!confirm(`Delete ${a.name}?`))return;const {error}=await sb.from("agents").delete().eq("id",a.id);if(error)toast(error.message);else{toast("Agent deleted.");renderTable()}};
 body.appendChild(r);
 })
}
$("#addBtn")?.addEventListener("click",async()=>{const {data,error}=await sb.from("agents").insert({name:"New Agent",talk_target:1320,talk_actual:0,rpc_target:66,rpc_actual:0,nptp_target:66,nptp_actual:0,npayment_target:44,npayment_actual:0,message:"KEEP GOING! 💙",accent:"#1478c9"}).select().single();if(error)toast(error.message);else{toast("Agent added.");renderTable()}});
$("#refreshBtn")?.addEventListener("click",renderTable);
$("#exportBtn")?.addEventListener("click",async()=>{const d=await getAgents(),h=["Agent","Photo URL","Talk Target","Talk Actual","RPC Target","RPC Actual","NPTP Target","NPTP Actual","NPayment Target","NPayment Actual","Message","Color"],rows=d.map(a=>[a.name,a.photo_url,a.talk_target,a.talk_actual,a.rpc_target,a.rpc_actual,a.nptp_target,a.nptp_actual,a.npayment_target,a.npayment_actual,a.message,a.accent]);const csv=[h,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");const x=document.createElement("a");x.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));x.download="MC22_Performance.csv";x.click()});
if($("#rows")){if($("#reportDate"))$("#reportDate").value=new Date().toISOString().slice(0,10);await dashboard()}
if($("#dataTable"))await renderTable();