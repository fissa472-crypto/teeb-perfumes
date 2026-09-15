/* TEEB fallback catalog. The live catalog is loaded by app.js from Supabase.
   Intentionally empty: inactive/removed products must not reappear when the live catalog has no active items. */
const FALLBACK_CATALOG=[];
if(typeof module!=='undefined') module.exports={CATALOG:FALLBACK_CATALOG};
if(typeof window!=='undefined') window.TEEB_CATALOG=FALLBACK_CATALOG;
