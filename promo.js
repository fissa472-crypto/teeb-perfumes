/* TEEB bundle pricing: regular 40 JOD fragrances are 2 for 70 JOD. */
function teebCartPricing(cart){
  let baseSubtotal=0,bundleQty=0;
  for(const i of cart){
    const p=getProduct(i.id);if(!p)continue;
    const price=Number(p.price)||0;
    baseSubtotal+=price*i.qty;
    if(!p.offer_active&&price===40)bundleQty+=i.qty;
  }
  const discount=Math.floor(bundleQty/2)*10;
  const subtotal=Math.max(baseSubtotal-discount,0);
  const delivery=subtotal>=50?0:2;
  return {baseSubtotal,discount,subtotal,delivery,total:subtotal+delivery};
}
window.renderCart=function(){
  const el=document.getElementById('cartItems');if(!el)return;
  const cart=readCart();saveCart(cart);
  if(!cart.length){el.innerHTML='<h2>Your cart is empty</h2><p class="notes">Browse our fragrances and find your signature scent.</p><a class="btn btn-primary" href="shop.html">SHOP FRAGRANCES</a>';const summary=document.getElementById('cartSummary');if(summary)summary.innerHTML='';return;}
  el.innerHTML=cart.map(i=>{const p=getProduct(i.id);return `<div class="cart-row"><div class="thumb"><img src="${imageSrc(p.image)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:contain"></div><div><b>${p.name}</b><div class="notes">${p.notes} · ${p.size||''}</div></div><div>${displayPrice(p)}</div><div class="qty"><button aria-label="Decrease quantity" onclick="cartChange('${p.id}',-1)">−</button><span>${i.qty}</span><button aria-label="Increase quantity" onclick="cartChange('${p.id}',1)">+</button></div><button aria-label="Remove ${p.name}" onclick="removeCart('${p.id}')" style="border:0;background:none;cursor:pointer">🗑</button></div>`;}).join('');
  const priced=cart.every(i=>getProduct(i.id)?.price!=null);const p=teebCartPricing(cart);const summary=document.getElementById('cartSummary');
  if(summary)summary.innerHTML=`<h2>Order Summary</h2><div class="summary-line"><span>Items</span><b>${money(p.baseSubtotal)}</b></div>${p.discount>0?`<div class="summary-line"><span>2 for 70 discount</span><b>−${money(p.discount)}</b></div>`:''}<div class="summary-line"><span>Subtotal</span><b>${money(p.subtotal)}</b></div><div class="summary-line"><span>Delivery</span><b>${money(p.delivery)}</b></div><div class="total">Total <span style="float:right">${money(p.total)}</span></div>${priced?'<button class="btn btn-primary" style="width:100%;margin-top:22px" onclick="location.href=\'checkout.html\'">PROCEED TO CHECKOUT</button>':'<div class="notes" style="margin-top:18px">One or more items are awaiting price confirmation. Checkout will be available once pricing is confirmed.</div>'}`;
};
window.checkoutSummary=function(){
  const el=document.getElementById('checkoutSummary');if(!el)return;const cart=readCart();const invalid=cart.some(i=>getProduct(i.id)?.price==null);const p=teebCartPricing(cart);
  el.innerHTML='<h2>Order Summary</h2>'+cart.map(i=>`<div class="summary-line"><span>${getProduct(i.id).name} × ${i.qty}</span><b>${money((Number(getProduct(i.id).price)||0)*i.qty)}</b></div>`).join('')+(p.discount>0?`<div class="summary-line"><span>2 for 70 discount</span><b>−${money(p.discount)}</b></div>`:'')+`<div class="summary-line"><span>Subtotal</span><b>${money(p.subtotal)}</b></div><div class="summary-line"><span>Delivery</span><b>${money(p.delivery)}</b></div><div class="total">Total <span style="float:right">${money(p.total)}</span></div>${invalid?'<p class="notes" style="margin-top:15px">Pricing is being confirmed for one or more items. Please return to the shop.</p>':''}`;
  const button=document.getElementById('placeOrderButton');if(button)button.disabled=invalid||!cart.length;
};
