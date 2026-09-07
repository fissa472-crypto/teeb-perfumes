const SUPABASE_URL='https://qjcghudjcagpbywmtlnp.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
const ALLOWED_GOVERNORATES=new Set(['Amman','Balqa','Irbid','Zarqa','Mafraq','Jerash','Ajloun','Madaba','Karak','Tafilah',"Ma'an",'Aqaba']);
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function json(res,status,body){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');return res.end(JSON.stringify(body));}
function clean(value,max=500){return String(value??'').trim().slice(0,max);}
module.exports=async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{success:false,error:'Method not allowed'});
 if(!SUPABASE_KEY){console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');return json(res,503,{success:false,error:'Order service is temporarily unavailable.'});}
 try{
  const body=typeof req.body==='object'&&req.body?req.body:JSON.parse(req.body||'{}');
  if(clean(body.website,200))return json(res,400,{success:false,error:'Invalid request.'});
  const c={email:clean(body.customer?.email,160),name:clean(body.customer?.name,120),phone:clean(body.customer?.phone,40),governorate:clean(body.customer?.governorate,40),area:clean(body.customer?.area,120),address:clean(body.customer?.address,300),details:clean(body.customer?.details,500)};
  if(!c.email||!EMAIL_RE.test(c.email)||!c.name||!c.phone||!c.area||!c.address||!ALLOWED_GOVERNORATES.has(c.governorate))return json(res,400,{success:false,error:'Please complete all required customer information.'});
  if(!Array.isArray(body.items)||body.items.length<1||body.items.length>30)return json(res,400,{success:false,error:'Invalid order items.'});
  const requested=[];for(const i of body.items){const id=clean(i?.id,80),qty=Number(i?.qty);if(!id||!Number.isInteger(qty)||qty<1||qty>100)return json(res,400,{success:false,error:'Invalid item quantity.'});requested.push({id,qty});}
  const db=await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_order`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`},body:JSON.stringify({p_customer_name:c.name,p_customer_email:c.email,p_customer_phone:c.phone,p_governorate:c.governorate,p_area:c.area,p_street_address:c.address,p_additional_details:c.details,p_items:requested})});
  const data=await db.json().catch(()=>null);if(!db.ok){console.error('Supabase order error',data);return json(res,db.status===400?400:502,{success:false,error:data?.message||'We could not save your order. Please try again.'});}
  const order=data;
  const items=Array.isArray(order?.items)?order.items:[];
  const discount=Number(order?.discount||0);
  if(!items.length)return json(res,200,{success:true,warning:'Order saved but confirmation details were incomplete.',order:{id:order.id,items:[],subtotal:Number(order.subtotal),discount,delivery:Number(order.delivery),total:Number(order.total),payment:'Cash on Delivery'}});
  const lines=items.map(i=>`${clean(i.name,120)} × ${Number(i.qty)||1} — ${Number(i.lineTotal||0).toFixed(2)} JOD`).join('\n');
  let notificationWarning='';
  try{
   const email=await fetch('https://formsubmit.co/ajax/perfumesteeb@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:c.name,email:c.email,phone:c.phone,governorate:c.governorate,area:c.area,address:c.address,additional_details:c.details||'None',order_items:lines,subtotal:`${Number(order.subtotal).toFixed(2)} JOD`,discount:`${discount.toFixed(2)} JOD`,delivery:`${Number(order.delivery).toFixed(2)} JOD`,total:`${Number(order.total).toFixed(2)} JOD`,payment:'Cash on Delivery',_subject:`New TEEB Perfumes Order - ${c.name}`,_template:'table',_captcha:'false'})});
   const mail=await email.json().catch(()=>({}));if(!email.ok||mail.success===false)notificationWarning='Order saved, but the notification email failed.';
  }catch(e){console.error('Notification email error',e);notificationWarning='Order saved, but the notification email failed.';}
  return json(res,200,{success:true,warning:notificationWarning||undefined,order:{id:order.id,items,subtotal:Number(order.subtotal),discount,delivery:Number(order.delivery),total:Number(order.total),payment:'Cash on Delivery'}});
 }catch(error){console.error(error);return json(res,500,{success:false,error:'Unable to process the order right now.'});}
};
