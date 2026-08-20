const SUPABASE_URL='https://qjcghudjcagpbywmtlnp.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_PUBLISHABLE_KEY||'sb_publishable_032jnom6xlHAABnfHL9a6Q_4i1wzXNs';
const ALLOWED_GOVERNORATES=new Set(['Amman','Balqa','Irbid','Zarqa','Mafraq','Jerash','Ajloun','Madaba','Karak','Tafilah',"Ma'an",'Aqaba']);
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function json(res,status,body){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');return res.end(JSON.stringify(body));}
function clean(value,max=500){return String(value??'').trim().slice(0,max);}
module.exports=async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{success:false,error:'Method not allowed'});
 try{
  const body=typeof req.body==='object'&&req.body?req.body:JSON.parse(req.body||'{}');
  const c={email:clean(body.customer?.email,160),name:clean(body.customer?.name,120),phone:clean(body.customer?.phone,40),governorate:clean(body.customer?.governorate,40),area:clean(body.customer?.area,120),address:clean(body.customer?.address,300),details:clean(body.customer?.details,500)};
  if(!c.email||!EMAIL_RE.test(c.email)||!c.name||!c.phone||!c.area||!c.address||!ALLOWED_GOVERNORATES.has(c.governorate))return json(res,400,{success:false,error:'Please complete all required customer information.'});
  if(!Array.isArray(body.items)||body.items.length<1||body.items.length>30)return json(res,400,{success:false,error:'Invalid order items.'});
  const requested=[];for(const i of body.items){const id=clean(i?.id,80),qty=Number(i?.qty);if(!id||!Number.isInteger(qty)||qty<1)return json(res,400,{success:false,error:'Invalid item quantity.'});requested.push({id,qty});}
  const db=await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_order`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`},body:JSON.stringify({p_customer_name:c.name,p_customer_email:c.email,p_customer_phone:c.phone,p_governorate:c.governorate,p_area:c.area,p_street_address:c.address,p_additional_details:c.details,p_items:requested})});
  const data=await db.json().catch(()=>null);if(!db.ok){console.error('Supabase order error',data);return json(res,db.status===400?400:502,{success:false,error:data?.message||'We could not save your order. Please try again.'});}
  const order=data;
  const lines=requested.map(i=>`${i.id} × ${i.qty}`).join('\n');
  const email=await fetch('https://formsubmit.co/ajax/perfumesteeb@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:c.name,email:c.email,phone:c.phone,governorate:c.governorate,area:c.area,address:c.address,additional_details:c.details||'None',order_items:lines,subtotal:`${Number(order.subtotal).toFixed(2)} JOD`,delivery:`${Number(order.delivery).toFixed(2)} JOD`,total:`${Number(order.total).toFixed(2)} JOD`,payment:'Cash on Delivery',_subject:`New TEEB Perfumes Order - ${c.name}`,_template:'table',_captcha:'false'})});
  const mail=await email.json().catch(()=>({}));if(!email.ok||mail.success===false)return json(res,502,{success:false,error:'Order was saved but the notification email failed. Please contact TEEB.'});
  return json(res,200,{success:true,order:{id:order.id,items:requested,subtotal:Number(order.subtotal),delivery:Number(order.delivery),total:Number(order.total),payment:'Cash on Delivery'}});
 }catch(error){console.error(error);return json(res,500,{success:false,error:'Unable to process the order right now.'});}
};
