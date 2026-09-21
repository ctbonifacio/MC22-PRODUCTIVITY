import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const c=window.MC22_CONFIG;
const sb=createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY);
const form=document.getElementById("loginForm"), msg=document.getElementById("loginMsg");
const {data:{session}}=await sb.auth.getSession();
if(session) location.href="index.html";
form.addEventListener("submit",async e=>{
 e.preventDefault(); msg.textContent="Logging in...";
 const {error}=await sb.auth.signInWithPassword({email:email.value.trim(),password:password.value});
 if(error) msg.textContent=error.message; else location.href="index.html";
});