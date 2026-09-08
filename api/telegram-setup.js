module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET'){res.status(405).json({ok:false,error:'Method not allowed'});return;}
  const token=process.env.TELEGRAM_BOT_TOKEN;
  if(!token){res.status(503).json({ok:false,error:'Telegram bot token is not configured'});return;}
  try{
    const r=await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const data=await r.json();
    if(!r.ok||!data.ok){res.status(502).json({ok:false,error:'Telegram API request failed'});return;}
    const updates=Array.isArray(data.result)?data.result:[];
    const chats=[];
    const seen=new Set();
    for(let i=updates.length-1;i>=0;i--){
      const m=updates[i]?.message||updates[i]?.edited_message;
      const chat=m?.chat;
      if(!chat?.id||seen.has(String(chat.id)))continue;
      seen.add(String(chat.id));
      chats.push({chat_id:String(chat.id),type:chat.type||'',first_name:chat.first_name||'',username:chat.username||'',text:m?.text||''});
    }
    res.status(200).json({ok:true,chats});
  }catch(e){
    console.error('Telegram setup error',e);
    res.status(500).json({ok:false,error:'Unable to read Telegram updates'});
  }
};