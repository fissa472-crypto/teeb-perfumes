const SUPABASE_URL='https://qjcghudjcagpbywmtlnp.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST'].includes(req.method)){res.status(405).json({ok:false,error:'Method not allowed'});return;}
 const token=process.env.TELEGRAM_BOT_TOKEN;
 if(!token||!SUPABASE_KEY){res.status(503).json({ok:false,error:'Telegram setup is not configured'});return;}
 try{
  const api='https://api.telegram.org/bot'+token;
  const r=await fetch(api+'/getUpdates');
  const data=await r.json();
  if(!r.ok||!data.ok){res.status(502).json({ok:false,error:'Telegram API request failed'});return;}
  const updates=Array.isArray(data.result)?data.result:[];
  const starts=updates.filter(u=>u?.message?.chat?.type==='private'&&String(u?.message?.text||'').trim()==='/start');
  const latest=starts[starts.length-1];
  if(!latest){res.status(400).json({ok:false,error:'Send /start to the TEEB bot first'});return;}
  const chatId=String(latest.message.chat.id);
  const db=await fetch(SUPABASE_URL+'/rest/v1/notification_config?on_conflict=id',{method:'POST',headers:{'Content-Type':'application/json','Prefer':'resolution=merge-duplicates','apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY},body:JSON.stringify({id:'primary',telegram_chat_id:chatId,updated_at:new Date().toISOString()})});
  if(!db.ok){console.error('Telegram setup database error',db.status,await db.text().catch(()=>''));res.status(502).json({ok:false,error:'Could not save Telegram destination'});return;}
  const test=await fetch(api+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:'✅ TEEB order notifications are connected.\nYou will receive a Telegram alert for every new order.'})});
  if(!test.ok){console.error('Telegram setup test failed',test.status,await test.text().catch(()=>''));res.status(502).json({ok:false,error:'Telegram destination saved, but test message failed'});return;}
  res.status(200).setHeader('Content-Type','text/html; charset=utf-8');
  res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>TEEB Telegram Connected</title><body style="font-family:Arial;text-align:center;padding:60px;background:#f3eadf;color:#2b2118"><h1>✅ Telegram Connected</h1><p>TEEB order notifications are now linked to your Telegram.</p><p>You can close this page.</p></body>');
 }catch(e){console.error('Telegram setup error',e);res.status(500).json({ok:false,error:'Unable to complete Telegram setup'});}
};