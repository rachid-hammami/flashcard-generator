/* ===== Réfs ===== */
const pageRecto = document.getElementById('page-recto');
const pageVerso = document.getElementById('page-verso');
const rectoSheet = document.getElementById('rectoSheet');
const versoSheet = document.getElementById('versoSheet');
const controls   = document.getElementById('controls');

const fileInput   = document.getElementById('imgFiles');
const borderRange = document.getElementById('borderRange');
const borderVal   = document.getElementById('borderVal');

const inpDefault  = document.getElementById('inpDefault');
const btnApplyDefaultSize = document.getElementById('btnApplyDefaultSize');
const btnApplyDefaultEverywhere = document.getElementById('btnApplyDefaultEverywhere');

/* ===== Catégories ===== */
const palette = { N:'#2563EB', V:'#DC2626', A:'#059669', P:'#F97316' };
function applyCategoryToIndex(i, cat){
  const rCard = rectoSheet.children[i];
  const vCard = versoSheet.children[i];
  if(!rCard || !vCard) return;
  if(!cat || !palette[cat]){
    rCard.style.borderColor = '#111';
    vCard.style.borderColor = '#111';
    rCard.dataset.cat = '';
    vCard.dataset.cat = '';
  } else {
    rCard.style.borderColor = palette[cat];
    vCard.style.borderColor = palette[cat];
    rCard.dataset.cat = cat;
    vCard.dataset.cat = cat;
  }
}

/* ===== Outils de taille ===== */
function getCurrentPt(span){
  const inline = span.style.fontSize;
  if(inline && inline.endsWith('pt')) return parseFloat(inline);
  const px = parseFloat(getComputedStyle(span).fontSize);
  return Math.round(px * 72 / 96); // 1pt = 96/72 px
}
function setPt(span, pt){ span.style.fontSize = pt + 'pt'; }

function breakAfterArticle(span){
  const plain = span.textContent || '';
  const t = plain.trim();
  if (/^(un|une|des)\s+/i.test(t)) {
    const html = t.replace(/^(un|une|des)\s+/i, (m)=> m.trim() + '<br>');
    span.innerHTML = html; // br force une deuxième ligne
  }
}

/* ===== Construction des cartes ===== */
function makeCard(index, isRecto){
  const card = document.createElement('div');
  card.className = 'card';
  const badge = document.createElement('div');
  badge.className = 'badge';
  badge.textContent = index + 1;
  card.appendChild(badge);
  if(isRecto){
  const wrap = document.createElement('div');
  wrap.className = 'img-wrap';
  const img = document.createElement('img');
  img.alt = 'Image ' + (index+1);
  img.style.transform = "scale(1)";
  wrap.appendChild(img);
  card.appendChild(wrap);

  // Contrôles image (agrandir/réduire)
  let scale = 1;
  const ctrlImg = document.createElement('div');
  ctrlImg.className = 'img-controls';
  ctrlImg.innerHTML = `
    <button class="btn-ghost">− Img</button>
    <button class="btn-ghost">+ Img</button>
  `;
  const [btnMinus, btnPlus] = ctrlImg.querySelectorAll('button');
  btnMinus.addEventListener('click', ()=>{
  scale = Math.max(0.5, scale - 0.05); // −5% par clic
  img.style.transform = `scale(${scale})`;
});
btnPlus.addEventListener('click', ()=>{
  scale = scale + 0.05; // +5% par clic
  img.style.transform = `scale(${scale})`;
});
  card.appendChild(ctrlImg);
}else {
        const word = document.createElement('div');
        word.className = 'word';
        const span = document.createElement('span');
        span.textContent = '';
        word.appendChild(span);
        card.appendChild(word);

        // Contrôles par carte : champ, appliquer, -5, +5, casser après article
        const ctrl = document.createElement('div');
        ctrl.className = 'size-controls';
        const id = 'c'+(index+1);
        ctrl.innerHTML = `
          <span class="muted">Taille (pt)</span>
          <input type="number" id="${id}-size" min="6" max="200" step="1" value="50">
          <button id="${id}-apply">Appliquer</button>
          <button id="${id}-minus" class="btn-ghost">− 5 pt</button>
          <button id="${id}-plus" class="btn-ghost">+ 5 pt</button>
          <button id="${id}-break" class="btn-ghost">Casser après article</button>
        `;
        const input = ctrl.querySelector('#'+id+'-size');
        const btnApply = ctrl.querySelector('#'+id+'-apply');
        const btnMinus = ctrl.querySelector('#'+id+'-minus');
        const btnPlus  = ctrl.querySelector('#'+id+'-plus');
        const btnBreak = ctrl.querySelector('#'+id+'-break');

        btnApply.addEventListener('click', ()=>{
          const val = Math.max(1, parseInt(input.value||'50',10));
          setPt(span, val);
        });
        btnMinus.addEventListener('click', ()=>{
          const next = getCurrentPt(span) - 5;
          setPt(span, next);
          input.value = next;
        });
        btnPlus.addEventListener('click', ()=>{
          const next = getCurrentPt(span) + 5;
          setPt(span, next);
          input.value = next;
        });
        btnBreak.addEventListener('click', ()=> breakAfterArticle(span));

        card.appendChild(ctrl);
      }
  return card;
}

function buildSheets(){
  rectoSheet.innerHTML = '';
  versoSheet.innerHTML = '';
  for(let i=0;i<8;i++){
    rectoSheet.appendChild(makeCard(i, true));
    versoSheet.appendChild(makeCard(i, false));
  }
}

/* ===== Inputs texte (verso) ===== */
(function(){
  const wordsGroup = document.createElement('div');
  wordsGroup.className = 'group';
  const label = document.createElement('label');
  label.textContent = 'Mots verso (8) :';
  wordsGroup.appendChild(label);
  for(let i=0;i<8;i++){
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = (i+1)+'. mot';
    input.dataset.index = i;
    input.addEventListener('input', ()=>{
      const span = versoSheet.querySelectorAll('.word span')[i];
      // Si on avait déjà inséré un <br> via "casser après article", on repart en texte brut
      span.innerHTML = '';
      span.textContent = input.value || '';
    });
    wordsGroup.appendChild(input);
  }
  controls.appendChild(wordsGroup);
})();

/* ===== Traits de coupe ===== */
const cutRecto = document.getElementById('cutRecto');
const cutVerso = document.getElementById('cutVerso');
const cbCut = document.getElementById('toggleCut');
function drawCutlines(layer){
  layer.innerHTML = '';
  const cols=4, rows=2;
  for(let i=1;i<cols;i++){
    const v = document.createElement('div'); v.className='v'; v.style.left = `calc(${i}/${cols} * 100%)`; layer.appendChild(v);
  }
  for(let j=1;j<rows;j++){
    const h = document.createElement('div'); h.className='h'; h.style.top = `calc(${j}/${rows} * 100%)`; layer.appendChild(h);
  }
}
function setCutlines(on){
  if(on){
    cutRecto.classList.remove('hidden');
    cutVerso.classList.remove('hidden');
    drawCutlines(cutRecto); drawCutlines(cutVerso);
  } else {
    cutRecto.classList.add('hidden');
    cutVerso.classList.add('hidden');
  }
}
cbCut && cbCut.addEventListener('change', ()=> setCutlines(cbCut.checked));

/* ===== Miroir verso ===== */
const cbMirror = document.getElementById('mirrorVerso');
function setMirror(on){
  const nodes = Array.from(versoSheet.children);
  if(nodes.length !== 8) return;
  const row1 = nodes.slice(0,4);
  const row2 = nodes.slice(4,8);
  const newOrder = on ? [...row1.reverse(), ...row2.reverse()]
                          : [0,1,2,3,4,5,6,7].map(i => nodes.find(n => n.querySelector('.badge')?.textContent===(i+1).toString()));
  versoSheet.innerHTML = '';
  newOrder.forEach(n=> versoSheet.appendChild(n));
}
cbMirror && cbMirror.addEventListener('change', ()=> setMirror(cbMirror.checked));

/* ===== Import d’images (catégorie + mot auto) ===== */
function parseMetaFromFilename(filename){
  const base = (filename || '').replace(/\.[^.]+$/, '');
  const lower = base.toLowerCase();
  let cat = '';
  if(/_(nom)$/.test(lower)) cat = 'N';
  else if(/_(verbe)$/.test(lower)) cat = 'V';
  else if(/_(adj|adjectif)$/.test(lower)) cat = 'A';
  else if(/_(prep|preposition|préposition)$/.test(lower)) cat = 'P';
  const word = base.replace(/_(nom|verbe|adj|adjectif|prep|preposition|préposition)$/i,'')
                   .replace(/[_-]+/g,' ')
                   .trim();
  return { base, cat, word };
}

fileInput && fileInput.addEventListener('change', async (e)=>{
  const files = Array.from(e.target.files).slice(0,8);
  const imgs = rectoSheet.querySelectorAll('img');
  for(let i=0; i<imgs.length; i++){
    const img = imgs[i];
    if(files[i]){
      const f = files[i];
      const url = URL.createObjectURL(f);
      img.src = url;

      const meta = parseMetaFromFilename(f.name);
      if(meta.cat){ applyCategoryToIndex(i, meta.cat); } else { applyCategoryToIndex(i, '—'); }

      const span = versoSheet.querySelectorAll('.word span')[i];
      if(span && !span.textContent){
        span.textContent = meta.word;
      }

      const inputs = controls.querySelectorAll('.group input[type=\"text\"]');
      const inputField = inputs && inputs[i];
      if(inputField && !inputField.value){ inputField.value = meta.word; }
    } else {
      img.removeAttribute('src');
      applyCategoryToIndex(i, '—');
    }
  }
});

/* ===== Affichage & Impression ===== */
document.getElementById('showRecto').addEventListener('click', ()=>{
  pageRecto.classList.remove('hidden');
  pageVerso.classList.add('hidden');
});
document.getElementById('showVerso').addEventListener('click', ()=>{
  pageVerso.classList.remove('hidden');
  pageRecto.classList.add('hidden');
});
document.getElementById('showBoth').addEventListener('click', ()=>{
  pageRecto.classList.remove('hidden');
  pageVerso.classList.remove('hidden');
});
// Imprimer en masquant les contrôles
document.getElementById('print').addEventListener('click', ()=>{
  document.body.classList.add('printing');
  window.print();
});
window.addEventListener('afterprint', ()=>{
  document.body.classList.remove('printing');
});


/* ===== Export PNG 300 dpi ===== */
document.getElementById('exportPng').addEventListener('click', async ()=>{
  try{
document.body.classList.add('printing');   // masque les contrôles
    const btn = document.getElementById('exportPng');
    btn.disabled = true; btn.textContent = 'Export…';

    const target = !pageRecto.classList.contains('hidden') ? pageRecto : pageVerso;
    await Promise.all(
      Array.from(target.querySelectorAll('img'))
        .filter(img => img.src && !img.complete)
        .map(img => new Promise(res => { img.onload = img.onerror = res; }))
    );

    const pxW = 3508, pxH = 2480; // A4 paysage @ 300 dpi
    const snapshot = await html2canvas(target, {
      scale: 3, backgroundColor: '#FFFFFF', useCORS: true, allowTaint: true, logging: false
    });

    const out = document.createElement('canvas');
    out.width = pxW; out.height = pxH;
    const ctx = out.getContext('2d');
    ctx.drawImage(snapshot, 0, 0, out.width, out.height);

    const url = out.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = target.id.includes('recto') ? 'planche_recto_300dpi.png' : 'planche_verso_300dpi.png';
    a.href = url; a.click();
  }catch(err){
    alert('Export PNG : une erreur est survenue. Vérifie html2canvas et réessaie.');
    console.error(err);
  }finally{
document.body.classList.remove('printing'); // réaffiche les contrôles
    const btn = document.getElementById('exportPng');
    btn.disabled = false; btn.textContent = 'Exporter PNG 300 dpi (page visible)';
  }
});

/* ===== Sliders / Boutons ===== */
function setBorder(valPt){
  document.documentElement.style.setProperty('--border-thickness', valPt + 'pt');
  borderVal && (borderVal.textContent = valPt + ' pt');
}
borderRange && borderRange.addEventListener('input', e=> setBorder(e.target.value));

// Appliquer la valeur par défaut (pt) au CSS var
function applyDefaultVar(){
  const d = Math.max(1, parseInt(inpDefault.value || '50', 10));
  document.documentElement.style.setProperty('--font-default', d + 'pt');
}
btnApplyDefaultSize && btnApplyDefaultSize.addEventListener('click', applyDefaultVar);

// Appliquer la valeur par défaut partout (inline style sur chaque carte)
function applyDefaultEverywhere(){
  const d = Math.max(1, parseInt(inpDefault.value || '50', 10));
  versoSheet.querySelectorAll('.card .word span').forEach(s => {
    s.style.fontSize = d + 'pt';
  });
  // Synchroniser les champs par carte avec la valeur par défaut
  versoSheet.querySelectorAll('.size-controls input[type="number"]').forEach(inp => {
    inp.value = d;
  });
}
btnApplyDefaultEverywhere && btnApplyDefaultEverywhere.addEventListener('click', applyDefaultEverywhere);

/* ===== Init ===== */
function init(){
  setBorder(borderRange ? borderRange.value : 6);
  buildSheets();

  // Appliquer la valeur par défaut partout au démarrage
  applyDefaultVar();
  applyDefaultEverywhere();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
