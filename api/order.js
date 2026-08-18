const { CATALOG } = require('../catalog');
const ALLOWED_GOVERNORATES = new Set(['Amman','Balqa','Irbid','Zarqa','Mafraq','Jerash','Ajloun','Madaba','Karak','Tafilah',"Ma'an",'Aqaba']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPABASE_URL = 'https://qjcghudjcagpbywmtlnp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_032jnom6xlHAABnfHL9a6Q_4i1wzXNs';
function json(res,status,body){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');return res.end(JSON.stringify(body));}
function clean(value,max=500){return String(value??'').trim().slice(0,max);}
module.exports=async function handler(req,res){
 if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');return res.status(204).end();}
 if(req.method!=='POST')return json(res,405,{success:false,error:'Method not allowed'});
 res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Content-Type');
 try{
  const body=typeof req.body==='object'&&req.body?req.body:JSON.parse(req.body||'{}');
  if(clean(body.website,100))return json(res,400,{success:false,error:'Invalid request'});
  const customer={email:clean(body.customer?.email,160),name:clean(body.customer?.name,120),phone:clean(body.customer?.phone,40),governorate:clean(body.customer?.governorate,40),area:clean(body.customer?.area,120),address:clean(body.customer?.address,300),details:clean(body.customer?.details,500)};
  if(!customer.email||!EMAIL_RE.test(customer.email)||!customer.name||!customer.phone||!customer.area||!customer.address||!ALLOWED_GOVERNORATES.has(customer.governorate))return json(res,400,{success:false,error:'Please provide valid required customer information.'});
  if(!Array.isArray(body.items)||body.items.length<1||body.items.length>30)return json(res,400,{success:false,error:'Invalid order items.'});
  const requested=new Map();
  for(const item of body.items){const id=clean(item?.id,80);const qty=Number(item?.qty);if(!id||!Number.isInteger(qty)||qty<1)return json(res,400,{success:false,error:'Invalid item quantity.'});requested.set(id,(requested.get(id)||0)+qty);}
  const lines=[];let subtotal=0;
  for(const [id,qty] of requested){const p=CATALOG.find(x=>x.id===id);if(!p||p.price==null)return json(res,409,{success:false,error:'One or more products are not currently available for online checkout.'});if(qty>Number(p.stock||0))return json(res,409,{success:false,error:`Not enough stock for ${p.name}.`});const lineTotal=Number(p.price)*qty;subtotal+=lineTotal;lines.push({id:p.id,name:p.name,qty,unitPrice:Number(p.price),lineTotal});}
  const delivery=subtotal>=50?0:2,total=subtotal+delivery;const orderLines=lines.map(x=>`${x.name} × ${x.qty} = ${x.lineTotal.toFixed(2)} JOD`).join('\n');

  const dbResponse=await fetch(`${SUPABASE_URL}/rest/v1/orders`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`,'Prefer':'return=representation'},body:JSON.stringify({customer_name:customer.name,customer_email:customer.email,customer_phone:customer.phone,governorate:customer.governorate,area:customer.area,street_address:customer.address,additional_details:customer.details||null,items:lines,subtotal:Number(subtotal.toFixed(2)),delivery:Number(delivery.toFixed(2)),total:Number(total.toFixed(2)),payment_method:'Cash on Delivery'})});
  if(!dbResponse.ok){console.error('Supabase order insert failed:',await dbResponse.text());return json(res,502,{success:false,error:'We could not save your order. Please try again.'});}

  const message=['NEW TEEB PERFUMES ORDER','', 'CUSTOMER INFORMATION',`Name: ${customer.name}`,`Phone: ${customer.phone}`,`Email: ${customer.email}`,`Governorate: ${customer.governorate}`,`Area: ${customer.area}`,`Street Address: ${customer.address}`,`Additional Details: ${customer.details||'None'}`,'','ORDER DETAILS',orderLines,'',`Delivery: ${delivery.toFixed(2)} JOD`,`TOTAL: ${total.toFixed(2)} JOD`,'Payment: Cash on Delivery','',`Order placed from TEEB Perfumes website at ${new Date().toISOString()}.`].join('\n');
  const response=await fetch('https://formsubmit.co/ajax/perfumesteeb@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:customer.name,email:customer.email,phone:customer.phone,governorate:customer.governorate,area:customer.area,address:customer.address,additional_details:customer.details||'None',order_details:orderLines,delivery:`${delivery.toFixed(2)} JOD`,total:`${total.toFixed(2)} JOD`,payment:'Cash on Delivery',message,_subject:`New TEEB Perfumes Order - ${customer.name}`,_template:'table',_captcha:'false'})});
  const result=await response.json().catch(()=>({}));if(!response.ok||result.success===false)return json(res,502,{success:false,error:'Order email service rejected the request.'});
  return json(res,200,{success:true,order:{items:lines,subtotal,delivery,total,payment:'Cash on Delivery'}});
 }catch(error){console.error('Order API error:',error);return json(res,500,{success:false,error:'Unable to process the order right now.'});}
};
