(function(){
  'use strict';

  const state = {
    current: 0,
    answers: {},
    flow: [],
  };

  const Q = {
    // Core questions
    age: {
      id: 'age',
      label: 'Age Group',
      type: 'select',
      options: [
        {v:'18-30', t:'18-30'},
        {v:'31-45', t:'31-45'},
        {v:'46-60', t:'46-60'},
        {v:'60+', t:'60+'},
      ],
      required: true
    },
    sex: {
      id: 'sex',
      label: 'Gender/Biological Sex',
      type: 'select',
      options: [
        {v:'male', t:'Male'},
        {v:'female', t:'Female'},
        {v:'other', t:'Non-binary/Other'},
      ],
      required: true
    },
    height: {
      id: 'height',
      label: 'Height (cm)',
      type: 'number',
      min: 120, max: 230, step: 1,
      required: true
    },
    weight: {
      id: 'weight',
      label: 'Weight (kg)',
      type: 'number',
      min: 35, max: 250, step: 0.1,
      required: true
    },
    goal: {
      id: 'goal',
      label: 'Primary Health Goal',
      type: 'select',
      options: [
        {v:'weight_loss', t:'Weight Loss'},
        {v:'muscle_growth', t:'Muscle Growth'},
        {v:'injury_recovery', t:'Injury Recovery'},
        {v:'anti_aging', t:'Anti-Aging'},
        {v:'performance', t:'Performance'},
        {v:'immune', t:'Immune Support'},
        {v:'wellness', t:'General Wellness'},
      ],
      required: true
    },
    conditions: {
      id: 'conditions',
      label: 'Current Health Conditions (select all that apply)',
      type: 'multiselect',
      options: [
        {v:'none', t:'None'},
        {v:'diabetes', t:'Diabetes'},
        {v:'renal', t:'Kidney'},
        {v:'hepatic', t:'Liver'},
        {v:'autoimmune', t:'Autoimmune'},
        {v:'cancer', t:'Cancer history'},
        {v:'cardio', t:'Cardiovascular'},
        {v:'pregnancy', t:'Pregnancy'},
        {v:'allergy', t:'Allergies'},
      ]
    },
    meds: {
      id: 'meds',
      label: 'Current Medications/Supplements (select all that apply)',
      type: 'multiselect',
      options: [
        {v:'none', t:'None'},
        {v:'hormones', t:'Hormones'},
        {v:'blood_thinners', t:'Blood Thinners'},
        {v:'diabetes_meds', t:'Diabetes Meds'},
        {v:'immunosuppressants', t:'Immunosuppressants'},
        {v:'other', t:'Other'},
      ]
    },
    activity: {
      id: 'activity',
      label: 'Physical Activity Level',
      type: 'select',
      options: [
        {v:'sedentary', t:'Sedentary'},
        {v:'moderate', t:'Moderately Active (3-4 days/wk)'},
        {v:'high', t:'Highly Active (5-7 days/wk)'},
        {v:'pro', t:'Professional Athlete'},
      ]
    },
    injury_type: {
      id: 'injury_type',
      label: 'Injury Type (if applicable)',
      type: 'select',
      options: [
        {v:'none', t:'None'},
        {v:'tendon', t:'Tendon/Ligament'},
        {v:'muscle', t:'Muscle'},
        {v:'joint', t:'Joint'},
        {v:'gut', t:'Gut/GI'},
        {v:'post_surgical', t:'Post-Surgical'},
        {v:'chronic', t:'Chronic'},
        {v:'acute', t:'Acute'},
      ]
    },
    experience: {
      id: 'experience',
      label: 'Previous Peptide Experience',
      type: 'select',
      options: [
        {v:'beginner', t:'Beginner'},
        {v:'intermediate', t:'Intermediate'},
        {v:'advanced', t:'Advanced'},
        {v:'side_effects', t:'History of Side Effects'},
      ]
    },
    budget: {
      id: 'budget',
      label: 'Budget for Peptide Therapy (monthly)',
      type: 'select',
      options: [
        {v:'150-300', t:'$150-300'},
        {v:'300-500', t:'$300-500'},
        {v:'500-800', t:'$500-800'},
        {v:'800+', t:'$800+'},
      ]
    },
    duration: {
      id: 'duration',
      label: 'Treatment Duration Commitment',
      type: 'select',
      options: [
        {v:'4-8', t:'4-8 weeks'},
        {v:'8-12', t:'8-12 weeks'},
        {v:'12-16', t:'12-16 weeks'},
        {v:'24+', t:'6+ months'},
      ]
    },
    site: {
      id: 'site',
      label: 'Injection Site Preference',
      type: 'select',
      options: [
        {v:'near_injury', t:'Near Injury'},
        {v:'abdomen', t:'Abdomen'},
        {v:'thigh', t:'Thighs'},
        {v:'arm', t:'Upper Arms'},
        {v:'rotate', t:'Rotate Sites'},
      ]
    },
    freq: {
      id: 'freq',
      label: 'Injection Frequency Tolerance',
      type: 'select',
      options: [
        {v:'weekly', t:'Once Weekly'},
        {v:'2-3x', t:'2-3x Weekly'},
        {v:'daily', t:'Daily'},
        {v:'bid', t:'Twice Daily'},
        {v:'5on2off', t:'5 on / 2 off'},
      ]
    },
    tolerance: {
      id: 'tolerance',
      label: 'Side Effect Tolerance',
      type: 'select',
      options: [
        {v:'low', t:'Low'},
        {v:'moderate', t:'Moderate'},
        {v:'high', t:'High'},
      ]
    },
    lifestyle: {
      id: 'lifestyle',
      label: 'Lifestyle Factors',
      type: 'multiselect',
      options: [
        {v:'exercise_high', t:'High Exercise'},
        {v:'diet_deficit', t:'Diet: Calorie Deficit'},
        {v:'diet_balanced', t:'Diet: Balanced'},
        {v:'diet_surplus', t:'Diet: Surplus'},
        {v:'sleep_poor', t:'Sleep: Poor'},
        {v:'sleep_good', t:'Sleep: Good'},
      ]
    },
    allergies: {
      id: 'allergies',
      label: 'Allergies or Sensitivities',
      type: 'multiselect',
      options: [
        {v:'none', t:'None'},
        {v:'needle_phobia', t:'Needle Phobia'},
        {v:'collagen', t:'Collagen'},
        {v:'other', t:'Other'},
      ]
    }
  };

  function buildFlow(ans){
    // Base flow
    const flow = [Q.age, Q.sex, Q.height, Q.weight, Q.goal, Q.conditions, Q.meds, Q.activity, Q.experience, Q.budget, Q.duration, Q.site, Q.freq, Q.tolerance, Q.lifestyle, Q.allergies];
    // Branch if injury recovery
    if ((ans.goal || state.answers.goal) === 'injury_recovery') flow.splice(6,0,Q.injury_type);
    return flow;
  }

  function el(tag, attrs={}, children=[]) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if (k==='class') e.className=v; else if (k==='text') e.textContent=v; else e.setAttribute(k,v);
    });
    (Array.isArray(children)?children:[children]).forEach(c=>{
      if (c==null) return;
      if (typeof c==='string') e.appendChild(document.createTextNode(c)); else e.appendChild(c);
    });
    return e;
  }

  function renderSelect(q) {
    const select = el('select', {id:`q-${q.id}`});
    select.appendChild(el('option', {value:'', text:'Select...'}));
    q.options.forEach(opt=> select.appendChild(el('option', {value:opt.v, text:opt.t})) );
    if (state.answers[q.id]) select.value = state.answers[q.id];
    return select;
  }
  function renderMulti(q) {
    const wrap = el('div', {class:'multi'});
    q.options.forEach(opt=>{
      const id = `q-${q.id}-${opt.v}`;
      const cb = el('input', {type:'checkbox', id, value:opt.v});
      const lbl = el('label', {for:id, text:opt.t, class:'text-gray-300 ml-2 mr-4'});
      if (Array.isArray(state.answers[q.id]) && state.answers[q.id].includes(opt.v)) cb.checked = true;
      const row = el('div', {class:'mb-2 flex items-center'}, [cb, lbl]);
      wrap.appendChild(row);
    });
    return wrap;
  }
  function readMulti(q){
    const wrap = document.querySelector(`#quiz-container #q-${q.id}`)?.closest('.q-block');
    const values = [];
    if (!wrap) return values;
    wrap.querySelectorAll('input[type="checkbox"]').forEach(cb=>{ if (cb.checked) values.push(cb.value); });
    return values.length?values:[];
  }

  function renderNumber(q){
    const input = el('input', {type:'number', id:`q-${q.id}`, min:q.min, max:q.max, step:q.step || 1});
    if (state.answers[q.id] != null) input.value = state.answers[q.id];
    return input;
  }

  function renderQuestion(q){
    const block = el('div', {class:'q-block mb-4 p-3 rounded bg-gray-800 border border-gray-700'});
    block.appendChild(el('div', {class:'text-white font-semibold mb-2', text:q.label}));
    let control;
    if (q.type==='select') control = renderSelect(q);
    else if (q.type==='multiselect') control = renderMulti(q);
    else if (q.type==='number') control = renderNumber(q);
    control && control.setAttribute('id', `q-${q.id}`);
    block.appendChild(control);
    return block;
  }

  function validate(q){
    const val = state.answers[q.id];
    if (q.required && (val==null || val==='')) return false;
    if (q.type==='number'){
      const n = parseFloat(val);
      if (Number.isNaN(n)) return false;
      if (q.min!=null && n<q.min) return false;
      if (q.max!=null && n>q.max) return false;
    }
    return true;
  }

  function computeBMI(){
    const h = parseFloat(state.answers.height || 0)/100;
    const w = parseFloat(state.answers.weight || 0);
    if (!h || !w) return null;
    return +(w/(h*h)).toFixed(1);
  }

  function dosageBase(){
    // Example base dose map by goal
    switch(state.answers.goal){
      case 'weight_loss': return 1; // mg/week (GLP-1 base)
      case 'muscle_growth': return 200; // mcg/day (GH peptides)
      case 'injury_recovery': return 300; // mcg/day (BPC-157)
      case 'anti_aging': return 2; // mg/day (GHK-Cu topical/SubQ equiv guidance)
      case 'performance': return 10; // mg/day (MK-677 oral)
      case 'immune': return 1.6; // mg twice weekly (Ta1)
      default: return 200;
    }
  }

  function weightFactor(){
    const w = parseFloat(state.answers.weight || 70);
    // Normalize around 75kg
    return +(w/75).toFixed(2);
  }

  function ageMult(){
    const a = state.answers.age;
    if (a==='18-30') return 0.8;
    if (a==='31-45') return 1.0;
    if (a==='46-60') return 1.15;
    return 1.25; // 60+
  }

  function experienceAdj(){
    const e = state.answers.experience;
    if (e==='beginner') return 0.7;
    if (e==='intermediate') return 1.0;
    if (e==='advanced') return 1.15;
    if (e==='side_effects') return 0.6;
    return 1.0;
  }

  function contraindications(){
    const out = [];
    const cond = state.answers.conditions || [];
    if (cond.includes('cancer')) out.push('Avoid GH/IGF-1 related peptides due to proliferation risk.');
    if (cond.includes('pregnancy')) out.push('Most peptides contraindicated in pregnancy.');
    if ((state.answers.allergies||[]).includes('needle_phobia')) out.push('Prefer oral options (e.g., MK-677) and topical GHK-Cu.');
    return out;
  }

  function recommendStack(){
    const goal = state.answers.goal;
    const bmi = computeBMI();
    const rec = { title:'', peptides:[], protocol:[], notes:[] };

    const calcDose = (base, unit) => {
      const dose = base * weightFactor() * ageMult() * experienceAdj();
      return { value: +(dose).toFixed(unit==='mg'?2:0), unit };
    };

    if (goal==='weight_loss'){
      rec.title = 'Weight Loss Stack';
      // GLP-1 primary + AOD-9604 support
      const glp = calcDose(1, 'mg');
      rec.peptides.push({ name:'Semaglutide (GLP-1)', dose:`${glp.value}-${Math.max(glp.value*2.4, glp.value).toFixed(2)} mg/week (titrate)`, route:'SubQ weekly', concentration:'1 mg/mL typical', reconstitution:'Reconstitute 10 mg with 10 mL for 1 mg/mL' });
      rec.peptides.push({ name:'AOD-9604', dose:'300 mcg/day', route:'SubQ daily', concentration:'5 mg/2 mL → 2.5 mg/mL', reconstitution:'5 mg with 2 mL BAC' });
      if (bmi && bmi>30) rec.notes.push('Higher BMI supports longer protocols (≥ 24 weeks) and higher GLP-1 titration.');
      rec.protocol.push('Duration: 16-24+ weeks, slow titration to minimize GI effects.');
    } else if (goal==='muscle_growth'){
      rec.title = 'Muscle Growth Stack';
      const gh = calcDose(200, 'mcg');
      rec.peptides.push({ name:'CJC-1295 (no DAC) + Ipamorelin', dose:`${Math.max(100,Math.round(gh.value/2))} mcg each, 1-2x/day`, route:'SubQ', concentration:'5 mg/2 mL → 2.5 mg/mL', reconstitution:'5 mg with 2 mL BAC' });
      rec.peptides.push({ name:'IGF-1 LR3 (advanced)', dose:'20-50 mcg post-workout', route:'SubQ', concentration:'1 mg/mL', reconstitution:'1 mg with 1 mL BAC' });
      rec.protocol.push('Duration: 8-12 weeks, consider 5 on / 2 off for receptor sensitivity.');
    } else if (goal==='injury_recovery'){
      rec.title = 'Recovery Stack';
      const bpc = calcDose(300, 'mcg');
      rec.peptides.push({ name:'BPC-157', dose:`${Math.max(250, Math.round(bpc.value))} mcg/day (split for severe)`, route:(state.answers.site==='near_injury'?'SubQ near site':'SubQ'), concentration:'5 mg/mL', reconstitution:'5 mg with 1 mL BAC' });
      rec.peptides.push({ name:'TB-500', dose:'2-5 mg/week', route:'SubQ 2x/week', concentration:'5 mg/mL', reconstitution:'5 mg with 1 mL BAC' });
      rec.peptides.push({ name:'GHK-Cu (optional)', dose:'1-5 mg/day', route:'Topical/SubQ', concentration:'5 mg/mL', reconstitution:'10 mg with 2 mL BAC' });
      rec.protocol.push('Duration: 6-10 weeks. Acute improves in 7-10 days; chronic requires 12+ weeks.');
    } else if (goal==='anti_aging'){
      rec.title = 'Longevity Stack';
      rec.peptides.push({ name:'GHK-Cu', dose:'1-5 mg/day', route:'Topical or SubQ', concentration:'5 mg/mL', reconstitution:'10 mg with 2 mL BAC' });
      rec.peptides.push({ name:'Thymosin Alpha-1', dose:'1.6 mg 2x/week', route:'SubQ', concentration:'5 mg/mL', reconstitution:'10 mg with 2 mL BAC' });
      rec.protocol.push('Duration: 30-90 days cycles; consider 90 on / 30 off.');
    } else if (goal==='performance'){
      rec.title = 'Performance/Recovery';
      rec.peptides.push({ name:'MK-677 (oral)', dose:'10-25 mg/day', route:'Oral', concentration:'N/A', reconstitution:'N/A' });
      rec.peptides.push({ name:'BPC-157', dose:'250-500 mcg/day', route:'SubQ', concentration:'5 mg/mL', reconstitution:'5 mg with 1 mL BAC' });
      rec.protocol.push('Duration: 8-12 weeks; adjust dose based on water retention and hunger.');
    } else if (goal==='immune'){
      rec.title = 'Immune Support';
      rec.peptides.push({ name:'Thymosin Alpha-1', dose:'1.6 mg 2x/week', route:'SubQ', concentration:'5 mg/mL', reconstitution:'10 mg with 2 mL BAC' });
      rec.peptides.push({ name:'LL-37 (advanced/clinical oversight)', dose:'10-50 mcg 2-3x/week', route:'SubQ', concentration:'Varies', reconstitution:'Per vial size' });
      rec.protocol.push('Duration: 8-12 weeks; monitor inflammatory markers with clinician.');
    } else {
      rec.title = 'General Wellness';
      rec.peptides.push({ name:'BPC-157', dose:'250 mcg/day', route:'SubQ', concentration:'5 mg/mL', reconstitution:'5 mg with 1 mL BAC' });
      rec.peptides.push({ name:'Ipamorelin (low)', dose:'100 mcg/day', route:'SubQ', concentration:'2.5 mg/mL', reconstitution:'5 mg with 2 mL BAC' });
      rec.protocol.push('Duration: 6-8 weeks with reassessment.');
    }

    // Adjustments
    if ((state.answers.sex)==='female' && state.answers.goal==='weight_loss') rec.notes.push('For GLP-1s, females may respond at lower starting doses; titrate slowly.');
    if ((state.answers.meds||[]).includes('diabetes_meds')) rec.notes.push('Coordinate GLP-1 dosing with diabetes medications to avoid hypoglycemia.');
    if ((state.answers.conditions||[]).includes('renal')) rec.notes.push('Consider dose reductions and monitor renal function.');
    if ((state.answers.tolerance)==='low') rec.notes.push('Start low, go slow; consider diluting to lower mg/mL for comfort.');

    // Contraindications
    const ci = contraindications();
    if (ci.length) rec.notes.push(...ci);

    // Reconstitution helper
    rec.reconstitution = [
      'Example: Mix 5 mg peptide with 2 mL BAC → 2.5 mg/mL. 250 mcg = 0.1 mL (10 units on 1 mL insulin syringe).',
      'Use subQ abdominal for systemic; near-site subQ for injury targeting; rotate sites to prevent irritation.'
    ];

    // Cycle
    rec.protocol.push(`Preferred frequency: ${labelOf(Q.freq, state.answers.freq) || 'Daily/Weekly per peptide'}.`);

    return rec;
  }

  function labelOf(q, val){
    if (!q || !q.options) return val;
    const f = q.options.find(o=>o.v===val);
    return f?f.t:val;
  }

  function renderNav(container){
    const nav = el('div', {class:'flex justify-between items-center mt-4'});
    const back = el('button', {class:'px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded', text:'Back'});
    const next = el('button', {class:'px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded', text:'Next'});
    const submit = el('button', {class:'px-3 py-2 bg-green-600 hover:bg-green-500 rounded', text:'See Recommendations'});

    back.addEventListener('click', ()=>{
      if (state.current>0) { state.current--; draw(); }
    });
    next.addEventListener('click', ()=>{
      if (state.current < state.flow.length-1) { state.current++; draw(); }
    });
    submit.addEventListener('click', ()=>{
      showResults();
    });

    if (state.current>0) nav.appendChild(back);
    if (state.current<state.flow.length-1) nav.appendChild(next); else nav.appendChild(submit);
    container.appendChild(nav);
  }

  function saveAnswer(q){
    if (q.type==='multiselect'){
      state.answers[q.id] = readMulti(q);
      return;
    }
    const input = document.getElementById(`q-${q.id}`);
    if (!input) return;
    if (q.type==='number') state.answers[q.id] = input.value? parseFloat(input.value):'';
    else state.answers[q.id] = input.value;
  }

  function draw(){
    // Rebuild flow in case goal changed (branching)
    state.flow = buildFlow(state.answers);

    const root = document.getElementById('quiz-container');
    if (!root) return;
    root.innerHTML = '';

    const progress = el('div', {class:'text-gray-400 text-sm mb-2'}, `Question ${state.current+1} of ${state.flow.length}`);
    root.appendChild(progress);

    const q = state.flow[state.current];
    const block = renderQuestion(q);
    root.appendChild(block);

    // Hook changes to save answers and allow branching updates
    if (q.type==='multiselect'){
      block.addEventListener('change', ()=>{ saveAnswer(q); });
    } else {
      const input = block.querySelector('input,select');
      input && input.addEventListener('change', ()=>{
        saveAnswer(q);
        // If goal changed, keep on same index but rebuild
        if (q.id==='goal') {
          const idx = state.current;
          state.flow = buildFlow(state.answers);
          state.current = Math.min(idx, state.flow.length-1);
          draw();
        }
      });
    }

    renderNav(root);
  }

  function showResults(){
    // Simple validation of required
    const missing = state.flow.filter(q=>q.required && !validate(q));
    if (missing.length){
      alert(`Please complete: ${missing.map(q=>q.label).join(', ')}`);
      return;
    }

    const root = document.getElementById('quiz-container');
    root.innerHTML = '';

    const bmi = computeBMI();
    const rec = recommendStack();

    const header = el('div', {class:'mb-3'}, [
      el('h3', {class:'text-white text-xl font-bold mb-1'}, rec.title),
      bmi? el('div', {class:'text-gray-400 text-sm'}, `Estimated BMI: ${bmi}`) : null,
    ]);
    root.appendChild(header);

    const pepList = el('div', {class:'mb-3'});
    rec.peptides.forEach(p=>{
      const card = el('div', {class:'p-3 mb-2 rounded bg-gray-800 border border-gray-700'}, [
        el('div', {class:'text-white font-semibold'}, p.name),
        el('div', {class:'text-gray-300 text-sm'}, `Dose: ${p.dose}`),
        el('div', {class:'text-gray-400 text-xs'}, `Route: ${p.route} • Conc: ${p.concentration}`),
        el('div', {class:'text-gray-500 text-xs'}, `Reconstitution: ${p.reconstitution}`),
      ]);
      pepList.appendChild(card);
    });
    root.appendChild(pepList);

    const proto = el('div', {class:'mb-3'}, [
      el('div', {class:'text-white font-semibold'}, 'Protocol & Tips'),
      el('ul', {class:'text-gray-300 text-sm list-disc list-inside'}, rec.protocol.map(p=> el('li', {}, p)))
    ]);
    root.appendChild(proto);

    if (rec.reconstitution && rec.reconstitution.length){
      const recon = el('div', {class:'mb-3'}, [
        el('div', {class:'text-white font-semibold'}, 'Reconstitution & Administration'),
        el('ul', {class:'text-gray-300 text-sm list-disc list-inside'}, rec.reconstitution.map(p=> el('li', {}, p)))
      ]);
      root.appendChild(recon);
    }

    if (rec.notes && rec.notes.length){
      const notes = el('div', {class:'mb-3'}, [
        el('div', {class:'text-white font-semibold'}, 'Notes & Warnings'),
        el('ul', {class:'text-red-300 text-sm list-disc list-inside'}, rec.notes.map(p=> el('li', {}, p)))
      ]);
      root.appendChild(notes);
    }

    const disclaimer = el('div', {class:'text-xs text-gray-400 mt-4'}, 'Educational only. Not medical advice. See Not Medical Advice disclaimer.');
    root.appendChild(disclaimer);

    const restart = el('button', {class:'mt-3 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded'}, 'Retake Quiz');
    restart.addEventListener('click', ()=>{
      state.current = 0;
      draw();
    });
    root.appendChild(restart);
  }

  window.initializePeptideQuiz = function(){
    const root = document.getElementById('quiz-container');
    if (!root) return;
    // Reset minimal state on first open
    if (!state.flow.length) state.flow = buildFlow(state.answers);
    draw();
  };

})();
