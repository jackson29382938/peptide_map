(function() {
    'use strict';

    // Initialize PEPTIDES_DATABASE if it doesn't exist
    if (typeof window.PEPTIDES_DATABASE === 'undefined') {
        window.PEPTIDES_DATABASE = {};
    }

    const peptideFormulations = {
        'aod9604': {
            fullName: 'AOD-9604',
            shortcuts: ['AOD', 'AOD9604'],
            strength: 0.6,
            vialAmount: '6mg/mL',
            dose: '40 units (300mcg)',
            reconstitution: 'Reconstitute with 8mL of BAC water',
            administration: 'SQ injection in the AM',
            protocol: 'No carbs 30 mins post-injection',
            benefits: [
                'Reduces body fat',
                'Regulates fat metabolism',
                'Stimulates Lipolysis',
                'Inhibits Lipogenesis',
                'Triggers fat release'
            ],
            forms: ['Injectable - 6mg/mL Vial'],
            category: 'Metabolic'
        },
        'bpc157': {
            fullName: 'BPC-157 (Body Protecting Compound-157)',
            shortcuts: ['BPC', 'BPC-157'],
            strength: 1.0,
            vialAmount: '15mg Vial',
            dose: '25 units (500mcg)',
            reconstitution: 'Reconstitute with 7.5 mL of BAC water',
            administration: 'SQ injection daily in the AM',
            protocol: 'Daily dosing',
            benefits: [
                'Tendon healing',
                'Decrease pain',
                'Increase collagen synthesis',
                'Quicker recovery times post-injury',
                'Wound and bone healing',
                'Decrease inflammation',
                'Intestinal issues support',
                'Protects the heart',
                'Reverse opioid tolerance',
                'Enhance GABA neurotransmission'
            ],
            forms: ['Injectable - 15mg Vial', 'Oral - 500mcg Capsules'],
            category: 'Healing & Recovery'
        },
        'bremelanotide': {
            fullName: 'Bremelanotide (PT-141)',
            shortcuts: ['PT-141', 'Bremelanotide', 'PTMS'],
            strength: 1.0,
            vialAmount: '20mg Vial',
            dose: '50 units (1mg) initial, titrate up to 2mg max',
            reconstitution: 'Reconstitute with 10mL of BAC water',
            administration: 'SQ injection, wait 30 minutes',
            protocol: 'Dose 2x weekly initially, then increase if tolerated. DO NOT EXCEED 2mg IN 72 HOURS',
            benefits: [
                'Increase sexual frequency',
                'Boost sex drive',
                'Treatment for hypoactive sexual desire disorder',
                'Raise sexual desire',
                'Increase female sexual function index total score',
                'Achieved female sexual distress scale improvements'
            ],
            forms: ['Injectable - 20mg Vial', 'Nasal Spray - 7.5mg/mL (3mL and 1mL Vials)'],
            category: 'Sexual Health'
        },
        'cjc1295-ipamorelin': {
            fullName: 'CJC-1295 / Ipamorelin',
            shortcuts: ['CJC1295', 'Ipamorelin', 'GHRP'],
            strength: 0.9,
            vialAmount: '6mg/12mg Vial',
            dose: '10 units SQ',
            reconstitution: 'Reconstitute with 6mL of BAC water',
            administration: 'SQ injection in the AM and PM before bed',
            protocol: 'Inject in AM and PM. No carbs 30 minutes post AM injection or 2 hours before PM injection',
            benefits: [
                'Decrease body fat',
                'Improve sleep quality',
                'Increase cognitive function',
                'Quicker recovery times post-injury',
                'Increased muscle mass',
                'Increase in strength'
            ],
            forms: ['Injectable - 6mg/12mg Vial'],
            category: 'Growth Hormone'
        },
        'dihexa': {
            fullName: 'Dihexa',
            shortcuts: ['Dihexa'],
            strength: 0.85,
            vialAmount: '2mg, 10mg, 20mg, 25mg',
            dose: 'One capsule daily',
            reconstitution: 'N/A - Oral',
            administration: 'Oral - Capsule',
            protocol: 'Take one capsule daily',
            benefits: [
                'Reverses effects of neurodegenerative diseases',
                'Procognitive/antidementia properties',
                'Facilitates formation of new functional synapses'
            ],
            forms: ['Oral - 2mg, 10mg, 20mg, and 25mg Capsules'],
            category: 'Neurology'
        },
        'exenatide': {
            fullName: 'Exenatide',
            shortcuts: ['Exenatide', 'Byetta'],
            strength: 0.8,
            vialAmount: '600mcg Vial',
            dose: '5-10 units (5-10mcg)',
            reconstitution: 'Reconstitute with 6mL bacteriostatic water',
            administration: 'SQ injection BID within 60 minutes prior to meals',
            protocol: 'Week 1: 5 units BID. After 1 month, increase to 10 units BID',
            benefits: [
                'Lower blood sugar',
                'Weight loss',
                'Feel full faster and longer',
                'Suppress appetite',
                'Increase sugar uptake in peripheral tissues'
            ],
            forms: ['Injectable - 600mcg Vial'],
            category: 'Metabolic'
        },
        'ghk-cu': {
            fullName: 'GHK-Cu (Copper Peptide)',
            shortcuts: ['GHK-Cu', 'GHK'],
            strength: 0.95,
            vialAmount: '2mg/mL Cream',
            dose: 'One pump to affected area',
            reconstitution: 'N/A - Topical',
            administration: 'Topical - Cream application',
            protocol: 'Apply one pump two times per day. Morning and night',
            benefits: [
                'Tighten loose skin and reverse thinning of aged skin',
                'Repair protective skin barrier proteins',
                'Improve skin firmness, elasticity, and clarity',
                'Reduce fine lines and wrinkles',
                'Improve structure of aged skin',
                'Smooth rough skin',
                'Reduce photodamage',
                'Improve overall skin appearance',
                'Stimulate wound healing',
                'Protect skin cells from UV radiation',
                'Reduce inflammation and free radical damage'
            ],
            forms: ['Topical - 2mg/mL Cream'],
            category: 'Dermatology'
        },
        'igf1-lr3': {
            fullName: 'IGF-1 LR3 (Insulin-like Growth Factor-1 Long Arg3)',
            shortcuts: ['IGF-1 LR3', 'IGF1LR3'],
            strength: 0.9,
            vialAmount: '500mcg Vial',
            dose: '25 units (25mcg)',
            reconstitution: 'Reconstitute with 5mL of BAC water',
            administration: 'SQ injection in the AM',
            protocol: 'Monday - Friday dosing',
            benefits: [
                'Enhance muscle mass and strength',
                'Decreases inflammation and autoimmunity',
                'Reduces muscle wasting',
                'Improve gut health',
                'Boost collagen production',
                'Builds muscle',
                'Help balance blood insulin levels',
                'Supports weight loss'
            ],
            forms: ['Injectable - 500mcg Vial'],
            category: 'Muscle Growth'
        },
        'kisspeptin': {
            fullName: 'Kisspeptin',
            shortcuts: ['Kisspeptin', 'KISS1R'],
            strength: 0.85,
            vialAmount: '500mcg Vial',
            dose: '10-15 units (10-15mcg)',
            reconstitution: 'Reconstitute with 5mL of BAC water',
            administration: 'SQ injection daily',
            protocol: 'Daily dosing',
            benefits: [
                'Stimulates Gonadotropin Releasing Hormone (GnRH) release',
                'Upregulates LH and FSH production',
                'Reverses effects of hypogonadism',
                'Increases Testosterone'
            ],
            forms: ['Injectable - 500mcg Vial'],
            category: 'Reproductive Health'
        },
        'll37': {
            fullName: 'LL-37 (Human Cathelicidin)',
            shortcuts: ['LL-37'],
            strength: 0.8,
            vialAmount: '2.5mg/mL 6mL Vial',
            dose: '2 drops under tongue',
            reconstitution: 'N/A - Liquid Drops',
            administration: 'Sublingual - Liquid drops',
            protocol: 'Start with 2 drops once daily. Increase to 2 drops AM and PM if tolerated',
            benefits: [
                'Antimicrobial',
                'Promotes wound healing',
                'Helps control infections',
                'Balances tissue inflammation',
                'Inhibits biofilm formation'
            ],
            forms: ['Sublingual - 2.5mg/mL Liquid Drops (6mL Vial)'],
            category: 'Anti-infective'
        },
        'melanotan-ii': {
            fullName: 'Melanotan II',
            shortcuts: ['MT-II', 'Melanotan', 'Melanotan II'],
            strength: 0.9,
            vialAmount: '10mg Vial',
            dose: 'Varies by protocol',
            reconstitution: 'Varies: 5mL-10mL BAC water depending on purpose',
            administration: 'SQ injection',
            protocol: 'Tanning: 10 units daily x2 weeks, then 5 units 2-3x/week. Metabolic: 5 units daily. Immunity: 10 units daily x6-8 weeks',
            benefits: [
                'Supports Melanogenesis',
                'Tanning',
                'Photo-protection from UV rays',
                'Increased protection from melanoma',
                'Lessens appetite',
                'Improves lipid regulation',
                'Glucose regulation improvement',
                'Libido enhancement',
                'Lipolytic effects',
                'Appetite control',
                'Anti-inflammatory',
                'Lowers oxidative stress',
                'Activates Treg cells',
                'Improves Th1/Th17 balance'
            ],
            forms: ['Injectable - 10mg Vial'],
            category: 'Metabolic'
        },
        'mk677': {
            fullName: 'MK-677 (Ibutamoren)',
            shortcuts: ['MK677', 'Ibutamoren'],
            strength: 0.9,
            vialAmount: '12.5mg and 25mg',
            dose: 'One capsule daily',
            reconstitution: 'N/A - Oral',
            administration: 'Oral - Capsule',
            protocol: 'Take one capsule daily before bed',
            benefits: [
                'Increase IGF-1 levels',
                'Longer REM sleep',
                'Shorter sleep latency',
                'Increase fat-free muscle mass',
                'Decrease body fat percentage',
                'Stronger bones',
                'Improved endurance',
                'Increase nitrogen levels',
                'Reversal of nitrogen wasting'
            ],
            forms: ['Oral - 12.5mg and 25mg Capsules'],
            category: 'Growth Hormone'
        },
        'mots-c': {
            fullName: 'MOTS-C (Mitochondrial-derived Peptide)',
            shortcuts: ['MOTS-C'],
            strength: 0.85,
            vialAmount: '10mg Vial',
            dose: '1mL per week',
            reconstitution: 'Reconstitute with 1mL of BAC water',
            administration: 'SQ injection',
            protocol: 'Inject 1mL SQ once a week',
            benefits: [
                'Improves glucose regulation',
                'Increases fatty acid oxidation',
                'Decreases insulin resistance',
                'Increases energy',
                'Promotes metabolic flexibility',
                'Promotes metabolic homeostasis',
                'Protects against HFD-induced obesity'
            ],
            forms: ['Injectable - 10mg Vial'],
            category: 'Metabolic'
        },
        'nad-plus': {
            fullName: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
            shortcuts: ['NAD+', 'NAD'],
            strength: 0.95,
            vialAmount: '1,000mg Vial',
            dose: '50 units (100mg)',
            reconstitution: 'Reconstitute with 5mL of BAC water',
            administration: 'SQ injection',
            protocol: 'Inject 2-3 times per week',
            benefits: [
                'Promotes cognitive and sensory function',
                'Restores cellular energy',
                'Fixes mitochondrial dysfunction',
                'Autoimmune disease support',
                'Depression and anxiety relief',
                'Drug addiction and detox support',
                'Recovery from injury',
                'Protects against cardio- and cerebrovascular disease'
            ],
            forms: ['Injectable - 1,000mg Vial'],
            category: 'Anti-aging'
        },
        'selank': {
            fullName: 'Selank',
            shortcuts: ['Selank', 'NA-Selank'],
            strength: 0.8,
            vialAmount: '7.5mg/mL Nasal Spray',
            dose: 'One spray each nostril',
            reconstitution: 'N/A - Nasal Spray',
            administration: 'Intranasal - Nasal spray',
            protocol: 'Instill one spray into each nostril once daily',
            benefits: [
                'Neuropsychotropic effects',
                'Antidepressant',
                'Anti-stress',
                'Positively influences memory',
                'Improves learning process',
                'Enhance GABA',
                'Opioid and alcohol withdrawal support'
            ],
            forms: ['Nasal Spray - 7.5mg/mL (4mL and 6mL Vials)'],
            category: 'Neurology'
        },
        'semaglutide': {
            fullName: 'Semaglutide Plus',
            shortcuts: ['Semaglutide', 'Ozempic'],
            strength: 1.0,
            vialAmount: '2.65/100 mg/mL 2mL Vial',
            dose: '0.25-2.4mg weekly',
            reconstitution: 'N/A - Pre-filled or reconstituted',
            administration: 'SQ injection weekly',
            protocol: 'Week 1-4: 0.25mg (9.5 units) weekly. Week 5-8: 0.5mg (19 units). Week 9-12: 1mg (38 units). Week 13-16: 1.7mg (66 units). Week 17+: 2.4mg (92 units)',
            benefits: [
                'Reduces food intake by lowering appetite',
                'Slows food digestion in stomach',
                'Decrease body fat percentage',
                'Weight loss',
                'Decreased cardiovascular outcomes in T2D',
                'Lower HbA1c levels',
                'Enhance growth of β cells in pancreas'
            ],
            forms: ['Injectable - 2.65/100 mg/mL 2mL Vial'],
            category: 'Metabolic'
        },
        'semax': {
            fullName: 'Semax',
            shortcuts: ['Semax', 'NA-Semax'],
            strength: 0.85,
            vialAmount: '7.5mg/mL Nasal Spray',
            dose: 'One spray each nostril',
            reconstitution: 'N/A - Nasal Spray',
            administration: 'Intranasal - Nasal spray',
            protocol: 'Instill one spray into each nostril once daily',
            benefits: [
                'Stroke support',
                'Transient ischemic attack prevention',
                'Cognitive disorders improvement',
                'ADHD/Learning support',
                'Memory enhancement',
                'Positive mood enhancement',
                'Reducing anxiety'
            ],
            forms: ['Nasal Spray - 7.5mg/mL (4mL and 6mL Vials)'],
            category: 'Neurology'
        },
        'ss31': {
            fullName: 'SS-31 (Elamipretide)',
            shortcuts: ['SS-31', 'Elamipretide'],
            strength: 0.9,
            vialAmount: '50mg/mL 6mL Vial',
            dose: '20 units (0.2mL)',
            reconstitution: 'N/A - Pre-filled solution',
            administration: 'SQ injection',
            protocol: 'Inject 20 units (0.2mL) SQ daily',
            benefits: [
                'Amyotrophic Lateral Sclerosis (ALS) support',
                'Alzheimer\'s disease support',
                'Glaucoma management',
                'Diabetes support',
                'Skeletal muscle weakness treatment',
                'Traumatic brain injury (TBI) support',
                'Atherosclerosis management',
                'Heart failure with ischemia-reperfusion support',
                'Kidney fibrosis treatment',
                'Friedreich ataxia support'
            ],
            forms: ['Injectable - 50mg/mL 6mL Vial'],
            category: 'Mitochondrial'
        },
        'tb500': {
            fullName: 'TB-500 (Thymosin Beta-4)',
            shortcuts: ['TB-500', 'Thymosin Beta-4'],
            strength: 0.9,
            vialAmount: '15mg Vial',
            dose: '50-100 units (1.87-3.75mg)',
            reconstitution: 'Reconstitute with 4mL of BAC water',
            administration: 'SQ injection',
            protocol: 'Loading: 100 units SQ weekly. Maintenance: 50 units SQ weekly',
            benefits: [
                'Up-regulates actin and forms complex with actin and profilin',
                'Increased cells in healing',
                'Improves cell migration to injury site',
                'Soft tissue repair - tendon, ligament, muscle',
                'Sports and athletic injury support',
                'Reduces scar tissue',
                'Significant repair properties',
                'Regenerative properties',
                'Enlarged muscle growth',
                'Muscle tone improvement',
                'Muscular stamina improvement',
                'Immune strengthening',
                'Immune modulation'
            ],
            forms: ['Injectable - 15mg Vial'],
            category: 'Healing & Recovery'
        },
        'thymulin': {
            fullName: 'Thymulin',
            shortcuts: ['Thymulin', 'Thymosin Alpha-1'],
            strength: 0.85,
            vialAmount: '15mg Vial',
            dose: '10 units (500mcg)',
            reconstitution: 'Reconstitute with 3mL of BAC water',
            administration: 'SQ injection',
            protocol: 'Inject 10 units (500mcg) SQ daily',
            benefits: [
                'Normalization of T-helper to suppressor cells',
                'Downregulates inflammatory mediators',
                'Downregulates cytokines and chemokines release',
                'Upregulates anti-inflammatory factors like IL-10'
            ],
            forms: ['Injectable - 15mg Vial'],
            category: 'Immunology'
        },
        'tesofensine': {
            fullName: 'Tesofensine',
            shortcuts: ['Tesofensine', 'TE-071'],
            strength: 0.85,
            vialAmount: '1mg, 0.5mg, 0.25mg',
            dose: 'One capsule daily',
            reconstitution: 'N/A - Oral',
            administration: 'Oral - Capsule',
            protocol: 'Take one capsule by mouth daily',
            benefits: [
                'Significantly affects appetite',
                'Reduction in expected next meal size',
                'Decreased desires for sweet, fatty, or salty foods',
                'Improvement in quality of life - physical function',
                'Improved self esteem',
                'Enhanced sexual life',
                'Reduced public distress',
                'Better work performance',
                'Increased REE expenditure rate',
                'Weight loss',
                'Increased fatty acid oxidation'
            ],
            forms: ['Oral - 1mg, 0.5mg, 0.25mg Capsules'],
            category: 'Metabolic'
        },
        'tetradecyl': {
            fullName: 'Tetradecyl Thioacetic Acid / Amlexanox',
            shortcuts: ['TTA', 'TTA-A'],
            strength: 0.8,
            vialAmount: '200/40mg',
            dose: 'One capsule',
            reconstitution: 'N/A - Oral',
            administration: 'Oral - Capsule',
            protocol: 'Take one capsule by mouth three times per day',
            benefits: [
                'Weight loss',
                'Decrease LDL cholesterol',
                'Improve insulin resistance',
                'Decreased epididymal adipose tissue mass',
                'Increase fatty acid transport',
                'Increase fatty acid uptake',
                'Increase fatty acid oxidation',
                'Lower blood pressure',
                'Reduction in hemoglobin A1c',
                'Reduction in fructosamine',
                'Cardioprotective'
            ],
            forms: ['Oral - 200/40mg Capsule'],
            category: 'Metabolic'
        }
    };

    // Merge into global PEPTIDES_DATABASE
    Object.assign(window.PEPTIDES_DATABASE, peptideFormulations);

    // Log completion
    console.log(`✅ Peptides Database loaded with ${Object.keys(peptideFormulations).length} formulations`);
})();
