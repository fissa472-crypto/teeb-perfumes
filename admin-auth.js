const SUPABASE_URL='https://qjcghudjcagpbywmtlnp.supabase.co';
const SUPABASE_KEY='sb_publishable_032jnom6xlHAABnfHL9a6Q_4i1wzXNs';
const ADMIN_EMAIL='perfumesteeb@gmail.com';
const SESSION_KEY='teeb_admin_session';
function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
function saveSession(s){localStorage.setItem(SESSION_KEY,JSON.stringify(s))}
function clearSession(){localStorage.removeItem(SESSION_KEY)}
async function authFetch(path,options={}){const s=session();if(!s?.access_token)throw new Error('Not signed in');let r=await fetch(`${SUPABASE_URL}${path}`,{...options,headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json',...(options.headers||{})}});if(r.status===401&&s.refresh_token){const rr=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});if(rr.ok){const fresh=await rr.json();saveSession(fresh);r=await fetch(`${SUPABASE_URL}${path}`,{...options,headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${fresh.access_token}`,'Content-Type':'application/json',...(options.headers||{})}})}}return r}
async function verifyAdmin(){const s=session();if(!s?.access_token){location.href='admin-login.html';return false}const r=await authFetch('/auth/v1/user');if(!r.ok){clearSession();location.href='admin-login.html';return false}const user=await r.json();if(String(user.email||'').toLowerCase()!==ADMIN_EMAIL){clearSession();location.href='admin-login.html';return false}return true}
window.adminAuth={session,authFetch,saveSession,clearSession,verifyAdmin,ADMIN_EMAIL};
