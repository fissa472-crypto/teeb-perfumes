document.addEventListener('DOMContentLoaded',()=>{
  const select=document.getElementById('category');
  if(!select)return;
  const category=new URLSearchParams(location.search).get('category');
  if(category && ['Men','Women','Unisex'].includes(category)){
    select.value=category;
    if(typeof renderShop==='function')renderShop();
  }
});