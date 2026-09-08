const SUPABASE_URL='https://qjcghudjcagpbywmtlnp.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.status(405).json({ok:false,error:'Method not allowed'});return;}
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
  if(!db.ok){res.status(502).json({ok:false,error:'Could not save Telegram destination'});return;}
  await fetch(api+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:'✅ TEEB order notifications are connected.'})});
  res.status(200).json({ok:true});
 }catch(e){console.error('Telegram setup error',e);res.status(500).json({ok:false,error:'Unable to complete Telegram setup'});}
};