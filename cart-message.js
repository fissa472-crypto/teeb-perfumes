(function(){
  const nativeAlert = window.alert.bind(window);
  function showCartMessage(message){
    if(message !== 'Added to cart') return nativeAlert(message);
    let toast=document.getElementById('teeb-cart-toast');
    if(!toast){
      toast=document.createElement('div');
      toast.id='teeb-cart-toast';
      toast.setAttribute('role','status');
      toast.style.cssText='position:fixed;bottom:28px;left:50%;z-index:99999;background:#111;color:#fff;padding:14px 22px;border:1px solid #c89b52;border-radius:10px;font:600 14px Arial,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25);opacity:0;transform:translate(-50%,10px);transition:opacity .2s ease,transform .2s ease;pointer-events:none;white-space:nowrap;';
      document.body.appendChild(toast);
    }
    toast.textContent='Product added to cart successfully.';
    clearTimeout(window.__teebToastTimer);
    requestAnimationFrame(()=>{toast.style.opacity='1';toast.style.transform='translate(-50%,0)';});
    window.__teebToastTimer=setTimeout(()=>{toast.style.opacity='0';toast.style.transform='translate(-50%,10px)';},2200);
  }
  window.alert=showCartMessage;
})();
