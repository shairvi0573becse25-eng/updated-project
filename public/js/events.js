document.addEventListener("DOMContentLoaded",()=>{
 const grid=document.querySelector("#eventsGrid"), search=document.querySelector("#eventSearch"), sort=document.querySelector("#eventSort");
 if(!grid)return;
 let current="All";
 function render(){
   const q=(search?.value||"").trim().toLowerCase();
   let arr=getEvents().filter(e=>{
     const matchesCat=current==="All" || e.category===current || (current==="DJ Night" && e.category==="Music");
     const matchesSearch=[e.title,e.category,e.venue,e.description].join(" ").toLowerCase().includes(q);
     return matchesCat&&matchesSearch;
   });
   if(sort?.value==="name") arr.sort((a,b)=>a.title.localeCompare(b.title));
   else if(sort?.value==="popular") arr.sort((a,b)=>(b.registered/b.seats)-(a.registered/a.seats));
   else arr.sort((a,b)=>new Date(a.date+"T"+a.time)-new Date(b.date+"T"+b.time));
   grid.innerHTML=arr.length?arr.map(eventCard).join(""):`<div class="empty" style="grid-column:1/-1"><strong>No matching events found.</strong><p style="margin-top:8px">Try another keyword or choose a different category.</p><button class="btn small" id="clearEventFilters" type="button" style="margin-top:14px">Clear filters</button></div>`;
   document.querySelector("#clearEventFilters")?.addEventListener("click",()=>{if(search)search.value="";if(sort)sort.value="date";current="All";document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.category==="All"));render();});
 }
 document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{
   document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
   b.classList.add("active");current=b.dataset.category;render();
 }));
 search?.addEventListener("input",render); sort?.addEventListener("change",render);
 const params=new URLSearchParams(location.search), cat=params.get("category");
 if(cat){const btn=[...document.querySelectorAll(".filter")].find(b=>b.dataset.category===cat);if(btn){document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));btn.classList.add("active");current=cat;}}
 render();
});
