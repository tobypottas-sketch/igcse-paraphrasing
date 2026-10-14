import fs from 'node:fs';

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const oldHeader = `<header class="app-header"><div class="header-inner"><div class="header-brand"><div class="header-logo">0511</div><div class="header-titles"><h1>IGCSE 0511 Paraphrasing & Synonym Dashboard</h1><div class="subtitle">Random starter regeneration + five authentic-style exam practice sets</div></div></div><div class="header-qual">Large random bank<br>5 exam-style activity sets<br>Classroom training tool</div></div></header>`;

const newHeader = `<header class="app-header">
  <div class="hero-shell">
    <div class="brand-panel">
      <img src="https://tobypottas-sketch.github.io/igcse-listening/cambridge-english-header.png" alt="Cambridge English" class="cambridge-brand">
    </div>
    <div class="hero-copy">
      <div class="hero-kicker">Cambridge IGCSE · English as a Second Language</div>
      <h1>Paraphrasing & Synonym Practice</h1>
      <p>Build flexible vocabulary, practise accurate paraphrasing and prepare for Cambridge IGCSE 0511 reading tasks.</p>
    </div>
    <div class="hero-skill-icon" aria-hidden="true"><span>A</span><b>≈</b><span>B</span></div>
  </div>
</header>`;

if (!html.includes(oldHeader)) throw new Error('Existing paraphrasing header not found.');
html = html.replace(oldHeader, newHeader);

const styleMarker = `/* ===== CAMBRIDGE SUITE VISUAL REFRESH ===== */`;
if (html.includes(styleMarker)) throw new Error('Cambridge refresh already applied.');

const css = `

/* ===== CAMBRIDGE SUITE VISUAL REFRESH ===== */
:root{
  --teal:#149b96;
  --teal-deep:#0d7f7b;
  --teal-lite:#eaf8f7;
  --rose:#c88383;
  --rose-deep:#ad6f70;
  --rose-lite:#fbefef;
  --suite-ink:#293638;
  --suite-muted:#657376;
  --suite-line:#cfe3e1;
  --suite-surface:#ffffff;
  --suite-soft:#f6fbfa;
  --shadow-soft:0 10px 30px rgba(38,57,54,.07);
  --shadow-card:0 4px 18px rgba(38,57,54,.06);
}
body{
  background:
    radial-gradient(circle at 7% 0%,rgba(200,131,131,.09),transparent 28%),
    radial-gradient(circle at 94% 3%,rgba(20,155,150,.09),transparent 30%),
    #f7faf9;
  color:var(--suite-ink);
}
.app-header{
  position:relative;
  top:auto;
  z-index:auto;
  max-width:1320px;
  margin:18px auto 0;
  padding:0 20px;
  color:var(--suite-ink);
  background:transparent;
  box-shadow:none;
}
.hero-shell{
  position:relative;
  overflow:hidden;
  display:grid;
  grid-template-columns:minmax(220px,290px) 1fr 118px;
  gap:28px;
  align-items:center;
  min-height:218px;
  padding:24px 28px;
  border:1px solid #cfe6e3;
  border-radius:22px;
  background:linear-gradient(135deg,#eaf8f7 0%,#f7fbfa 57%,#fbefef 100%);
  box-shadow:var(--shadow-soft);
}
.hero-shell::after{
  content:'';
  position:absolute;
  width:220px;
  height:220px;
  right:-80px;
  top:-100px;
  border-radius:50%;
  background:rgba(20,155,150,.07);
  pointer-events:none;
}
.brand-panel{
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:150px;
  padding:10px 14px;
  border-right:1px solid #b9deda;
}
.cambridge-brand{display:block;width:100%;max-width:260px;height:auto;object-fit:contain}
.hero-copy{position:relative;z-index:1}
.hero-kicker{
  display:inline-flex;
  align-items:center;
  padding:5px 10px;
  margin-bottom:10px;
  border:1px solid #b8ddd9;
  border-radius:999px;
  background:rgba(255,255,255,.68);
  color:var(--teal-deep);
  font-size:.7rem;
  font-weight:850;
  letter-spacing:.055em;
  text-transform:uppercase;
}
.header-titles h1,.app-header h1{
  margin:0;
  color:#263638;
  font-size:2.02rem;
  line-height:1.08;
  letter-spacing:-.025em;
  font-weight:850;
}
.app-header p{
  max-width:720px;
  margin:10px 0 0;
  color:#526466;
  font-size:1rem;
  line-height:1.55;
}
.hero-skill-icon{
  position:relative;
  z-index:1;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:5px;
  width:92px;
  height:92px;
  justify-self:center;
  border:1px solid #b8ddd9;
  border-radius:26px;
  background:rgba(255,255,255,.72);
  color:var(--teal-deep);
  box-shadow:0 8px 24px rgba(38,57,54,.08);
  font-size:1.15rem;
  font-weight:900;
}
.hero-skill-icon b{color:var(--rose-deep);font-size:1.35rem}
.app-container{padding-top:16px}
.tab-bar{
  gap:6px;
  padding:7px;
  border:1px solid #d7e7e5;
  border-radius:18px;
  box-shadow:var(--shadow-card);
  background:rgba(255,255,255,.94);
}
.tab-btn{
  padding:10px 16px;
  border-radius:12px;
  color:#667577;
  transition:background .16s ease,color .16s ease,box-shadow .16s ease;
}
.tab-btn:hover{background:#f1f8f7;color:var(--teal-deep)}
.tab-btn.active{background:var(--teal);color:white;box-shadow:0 4px 12px rgba(20,155,150,.2)}
.card{
  border-color:#d7e6e4;
  border-radius:18px;
  background:rgba(255,255,255,.97);
  box-shadow:var(--shadow-card);
}
.card-header{
  color:#304f51;
  border-bottom-color:#e1eeec;
  font-size:1.08rem;
}
.notice{border-radius:14px}
.notice-blue{background:#ebf7fa;border-color:#cce4e9}
.notice-green{background:#edf7f1;border-color:#d5e9dc}
.notice-gold{background:#fbf6e9;border-color:#ecdcb9}
.notice-coral{background:var(--rose-lite);border-color:#eccdcd}
.notice-purple{background:#f4f0fa;border-color:#ded3ef}
.answer-box,.sidebar-box,.question-block,.review-item,.note-section,.source-box,.task-box,.stat-card{
  border-color:#d9e7e5;
  border-radius:14px;
}
.sidebar-box,.answer-box{background:#f8fbfa}
.source-box{background:#fffefd}
.task-box{background:#fbfcfa}
.btn{border-radius:11px;transition:background .16s ease,box-shadow .16s ease,transform .16s ease}
.btn-primary{background:var(--teal);color:#fff;box-shadow:0 3px 10px rgba(20,155,150,.16)}
.btn-primary:hover{background:var(--teal-deep)}
.btn-secondary{background:#edf4f3;color:#354446}
#modePracticeBtn.btn-primary{background:var(--teal);color:#fff}
#modePracticeBtn.btn-primary:hover{background:var(--teal-deep)}
#modeExamBtn.btn-primary{background:var(--rose);color:#fff;box-shadow:0 3px 10px rgba(200,131,131,.17)}
#modeExamBtn.btn-primary:hover{background:var(--rose-deep)}
#modeExamBtn.btn-secondary{background:#f6eeee;color:#5b4a4b}
.choice-btn{border-color:#d7e5e3;border-radius:13px;background:#fff}
.choice-btn:hover{border-color:#afd6d2;background:#f5fbfa}
.choice-btn.selected{outline-color:rgba(20,155,150,.17)}
.choice-btn.correct{background:#edf7f1;border-color:#bcdcc7}
.choice-btn.wrong{background:var(--rose-lite);border-color:#e7c0c0}
input[type="text"],textarea{border-color:#cfdfdd;border-radius:11px}
input:focus,textarea:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(20,155,150,.12)}
.stat-value{color:var(--teal-deep)}
.progress-fill{background:linear-gradient(90deg,var(--teal),#62b8ae)}
.mode-pill{background:var(--teal-lite);color:var(--teal-deep)}
.review-item.good{border-left-color:#76aa83}.review-item.bad{border-left-color:var(--rose)}
footer{border-top-color:#dbe8e6}
@media (min-width:701px) and (max-width:1180px){
  .app-header{margin-top:12px;padding:0 16px}
  .hero-shell{grid-template-columns:220px 1fr;min-height:0;padding:20px;gap:20px}
  .hero-skill-icon{display:none}
  .brand-panel{min-height:120px}
  .app-container{padding-top:14px}
  .tab-bar{position:relative;top:auto;margin-left:0;margin-right:0;border-radius:16px;padding:7px}
}
@media(max-width:700px){
  .app-header{margin-top:10px;padding:0 10px}
  .hero-shell{grid-template-columns:1fr;gap:12px;padding:18px;min-height:0;border-radius:18px}
  .brand-panel{justify-content:flex-start;min-height:0;padding:0 0 14px;border-right:0;border-bottom:1px solid #cfe4e1}
  .cambridge-brand{max-width:230px}
  .hero-skill-icon{display:none}
  .hero-kicker{font-size:.66rem}
  .app-header h1{font-size:1.72rem}
  .app-header p{font-size:.96rem}
  .app-container{padding-top:12px}
  .tab-bar{position:sticky;top:0;margin-left:0;margin-right:0;border-radius:14px;padding:6px}
}
`;

html = html.replace('</style>', css + '\n</style>');
fs.writeFileSync(file, html);
