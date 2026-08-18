(function(){
  const originalAlert = window.alert;
  function showToast(message){
    const toast=document.createElement('div');
    toast.textContent=message;
    toast.style.cssText='position:fixed;top:24px;right:24px;z-index:99999;background:#111;color:#fff;border:1px solid #c89b52;border-radius:10px;padding:14px 20px;font:600 15px Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25);opacity:0;transform:translateY(-10px);transition:opacity .25s ease,transform .25s ease;direction:rtl;';
    document.body.appendChild(toast);
    requestAnimationFrame(()=>{toast.style.opacity='1';toast.style.transform='translateY(0)';});
    setTimeout(()=>{toast.style.opacity='0';toast.style.transform='translateY(-10px)';setTimeout(()=>toast.remove(),250);},2200);
  }
  window.alert=function(message){
    if(message==='Added to cart') return showToast('تمت إضافة المنتج إلى السلة');
    if(message==='Price will be confirmed by TEEB.') return showToast('سيتم تأكيد السعر من TEEB');
    return originalAlert(message);
  };
})();
