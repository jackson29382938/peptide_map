(function() {
    'use strict';

    // Initialize PEPTIDES_DATABASE if it doesn't exist
    if (typeof window.PEPTIDES_DATABASE === 'undefined') {
        window.PEPTIDES_DATABASE = {};
    }

    const peptideFormulations = {
        '5-amino-1mq': {
            fullName: '5-Amino-1MQ',
            shortcuts: ['5-Amino-1MQ', 'NNMT Inhibitor'],
            strength: 0.85,
            vialAmount: 'Varies (capsules or injectable)',
            dose: 'One capsule (typically 50-100mg) daily',
            reconstitution: 'N/A - Oral or reconstitute for injection if applicable',
            administration: 'Oral - Capsule or SQ injection',
            protocol: 'Take daily for 4-8 weeks; cycle as needed for metabolic support',
            benefits: [
                'Blocks NNMT enzyme to promote fat loss',
                'Improves energy levels and mitochondrial function',
                'Reduces inflammation',
                'Supports muscle repair and lowers cholesterol',
                'Enhances NAD+ levels for anti-aging'
            ],
            sideEffects: [
                'Rare; potential mild digestive discomfort'
            ],
            forms: ['Oral Capsules', 'Injectable Vial'],
            category: 'Metabolic / Weight Loss'
        },
        'aod9604': {
            fullName: 'AOD-9604 (Advanced Obesity Drug)',
            shortcuts: ['AOD', 'AOD9604'],
            strength: 0.6,
            vialAmount: '6mg/mL Vial or 5mg Lyophilized',
            dose: '300-500mcg daily',
            reconstitution: 'Reconstitute with 8mL BAC water for 6mg vial',
            administration: 'SQ injection in the AM',
            protocol: 'No carbs 30 mins post-injection; 20-30 days cycle, or 12-16 weeks for fat loss',
            benefits: [
                'Reduces body fat and regulates metabolism',
                'Stimulates lipolysis and inhibits lipogenesis',
                'Triggers fat release from obese cells',
                'Supports cartilage repair and osteoarthritis treatment',
                'Boosts metabolism without affecting blood sugar or growth',
                'Prevents fat accumulation',
                'Enhances lipid profiles'
            ],
            sideEffects: [
                'Minimal; mild injection site reactions, nausea'
            ],
            forms: ['Injectable - 6mg/mL Vial', 'Cream (600mcg/g)', 'Lyophilized 5mg Vial'],
            category: 'Metabolic / Fat Loss'
        },
        'ara-290': {
            fullName: 'ARA-290 (Cibinetide)',
            shortcuts: ['ARA-290'],
            strength: 0.8,
            vialAmount: 'Varies',
            dose: 'Varies; typically 1-2mg daily',
            reconstitution: 'Reconstitute with BAC water',
            administration: 'SQ injection',
            protocol: 'Daily for 4-6 weeks in neuropathy cases',
            benefits: [
                'Reduces neuropathic pain and inflammation',
                'Supports diabetes complications and tissue damage',
                'Modulates innate repair receptor for anti-inflammatory effects',
                'Improves small nerve fiber function'
            ],
            sideEffects: [
                'Rare; mild irritation at injection sites'
            ],
            forms: ['Injectable Vial'],
            category: 'Neurology / Anti-Inflammatory'
        },
        'bpc157': {
            fullName: 'BPC-157 (Body Protecting Compound-157)',
            shortcuts: ['BPC', 'BPC-157'],
            strength: 1.0,
            vialAmount: '15mg Vial or 10mg Lyophilized',
            dose: '250-500mcg daily',
            reconstitution: 'Reconstitute with 7.5mL BAC water for 15mg vial',
            administration: 'SQ injection daily in the AM, oral capsule, or sublingual',
            protocol: 'Daily dosing for 4-6 weeks; alternative weekly 1.16mg; combine with TB-500 for enhanced repair',
            benefits: [
                'Accelerates tendon and ligament healing',
                'Decreases pain and inflammation',
                'Increases collagen synthesis',
                'Quicker recovery post-injury',
                'Promotes wound and bone healing',
                'Supports gastrointestinal health and heals ulcers',
                'Protects the heart and reverses opioid tolerance',
                'Enhances GABA neurotransmission',
                'Improves joint health and cognitive performance',
                'Protects against drug-induced damage'
            ],
            sideEffects: [
                'Minimal; possible nausea or local irritation'
            ],
            forms: ['Injectable - 15mg Vial', 'Oral - 500mcg Capsules', 'Sublingual Troche', 'Suppository', 'Cream (1mg/g)'],
            category: 'Healing & Recovery'
        },
        'bremelanotide': {
            fullName: 'Bremelanotide (PT-141)',
            shortcuts: ['PT-141', 'Bremelanotide', 'PTMS'],
            strength: 1.0,
            vialAmount: '20mg Vial or 10,000mcg/ml with B6',
            dose: '1-2mg as needed',
            reconstitution: 'Reconstitute with 10mL BAC water',
            administration: 'SQ injection or nasal spray',
            protocol: 'Inject 1mg 30-60 mins before activity; do not exceed 2mg in 72 hours; nasal: 2-4 sprays 30-60 mins prior',
            benefits: [
                'Increases sexual frequency and drive',
                'Treats hypoactive sexual desire disorder in men and women',
                'Raises sexual desire and arousal',
                'Improves female sexual function and reduces distress',
                'Enhances satisfaction; sunless tanning as side effect'
            ],
            sideEffects: [
                'Mild nausea, flushing, or abdominal cramping'
            ],
            forms: ['Injectable - 20mg Vial', 'Nasal Spray - 7.5mg/mL or 5/25mg/ml with B6'],
            category: 'Sexual Health'
        },
        'cjc1295': {
            fullName: 'CJC-1295',
            shortcuts: ['CJC1295', 'GHRH Analog'],
            strength: 0.9,
            vialAmount: '10mg or 5mg Lyophilized',
            dose: '200-300mcg daily',
            reconstitution: 'Reconstitute with BAC water',
            administration: 'SQ injection',
            protocol: 'With DAC: 2mg weekly; no DAC: 100-200mcg 1-3x daily; 8-12 week cycles',
            benefits: [
                'Supports muscle growth and fat loss',
                'Improves recovery and anti-aging effects',
                'Enhances sleep quality and immune function',
                'Increases GH and IGF-1 levels',
                'Promotes cellular repair'
            ],
            sideEffects: [
                'Mild flushing, headaches, or nausea'
            ],
            forms: ['Injectable - 10mg Vial', 'Combination with Ipamorelin'],
            category: 'Growth Hormone'
        },
        'cjc1295-ipamorelin': {
            fullName: 'CJC-1295 / Ipamorelin',
            shortcuts: ['CJC1295', 'Ipamorelin', 'GHRP'],
            strength: 0.9,
            vialAmount: '6mg/12mg Vial or 4/4mg, 5/9mg',
            dose: '200/200mcg to 250/450mcg daily',
            reconstitution: 'Reconstitute with 6mL BAC water',
            administration: 'SQ injection in AM and PM',
            protocol: 'No carbs post-injection; 5 days on/2 off, 8-12 weeks',
            benefits: [
                'Decreases body fat and improves sleep',
                'Increases cognitive function and muscle mass',
                'Quicker recovery and strength gains',
                'Boosts protein synthesis and IGF-1',
                'Supports joint health and immune system'
            ],
            sideEffects: [
                'Minimal; possible mild flushing or hunger'
            ],
            forms: ['Injectable - 6mg/12mg Vial', 'Sublingual Troche'],
            category: 'Growth Hormone'
        },
        'dihexa': {
            fullName: 'Dihexa',
            shortcuts: ['Dihexa'],
            strength: 0.85,
            vialAmount: '1mg or 2mg Capsules',
            dose: '1-2mg daily',
            reconstitution: 'N/A - Oral',
            administration: 'Oral - Capsule',
            protocol: 'Take daily for 30 days; 4-8 week cycles',
            benefits: [
                'Reverses neurodegenerative effects',
                'Procognitive and antidementia properties',
                'Facilitates new synapse formation',
                'Improves cognitive function in Alzheimer\'s models',
                'Enhances long/short-term memory',
                'Manages depression and creative thinking'
            ],
            sideEffects: [
                'None commonly reported'
            ],
            forms: ['Oral - 1mg, 2mg Capsules'],
            category: 'Neurology'
        },
        'dsip': {
            fullName: 'DSIP (Delta Sleep-Inducing Peptide)',
            shortcuts: ['DSIP'],
            strength: 0.8,
            vialAmount: 'Varies',
            dose: '100-200mcg before bed',
            reconstitution: 'Reconstitute with BAC water',
            administration: 'SQ injection or nasal',
            protocol: 'Daily at bedtime, 4-6 weeks',
            benefits: [
                'Improves sleep quality and reduces stress',
                'Enhances recovery and regulates sleep cycles',
                'Neuromodulator with neuroprotective effects',
                'Treats pain, alcohol/opioid withdrawal'
            ],
            sideEffects: [
                'Rare; mild drowsiness or headaches'
            ],
            forms: ['Injectable Vial', 'Nasal Spray'],
            category: 'Neurology / Sleep'
        },
        'epithalon': {
            fullName: 'Epithalon (Epitalon)',
            shortcuts: ['Epithalon', 'Epitalon'],
            strength: 0.9,
            vialAmount: '50mg Lyophilized',
            dose: '5-10mg daily',
            reconstitution: 'Reconstitute with BAC water',
            administration: 'SQ injection',
            protocol: '10 days at 10mg or 20 days at 5mg; 2-3 cycles/year',
            benefits: [
                'Slows aging by telomere lengthening',
                'Enhances sleep and immune function',
                'Antioxidant and endocrine regulation',
                'Prevents age-related diseases',
                'Promotes vitality and stress resistance'
            ],
            sideEffects: [
                'Rare; mild nausea or injection site irritation'
            ],
            forms: ['Injectable - 50mg Vial'],
            category: 'Anti-Aging'
        },
        'exenatide': {
            fullName: 'Exenatide (Byetta)',
            shortcuts: ['Exenatide', 'Byetta'],
            strength: 0.8,
            vialAmount: '600mcg Vial',
            dose: '5-10mcg BID',
            reconstitution: 'Reconstitute with 6mL bacteriostatic water',
            administration: 'SQ injection BID within 60 mins prior to meals',
            protocol: 'Week 1: 5mcg BID; after 1 month, increase to 10mcg BID',
            benefits: [
                'Lowers blood sugar and promotes weight loss',
                'Feel full faster and longer',
                'Suppresses appetite',
                'Increases sugar uptake in peripheral tissues',
                'Treats type 2 diabetes'
            ],
            sideEffects: [
                'Nausea, potential thyroid risks, GI discomfort'
            ],
            forms: ['Injectable - 600mcg Vial'],
            category: 'Metabolic / Diabetes'
        },
        'ghk-cu': {
            fullName: 'GHK-Cu (Copper Peptide)',
            shortcuts: ['GHK-Cu', 'GHK'],
            strength: 0.95,
            vialAmount: '2mg/mL Cream or 50mg Lyophilized',
            dose: '1-2 pumps daily or 1-2mg SQ',
            reconstitution: 'N/A - Topical or reconstitute for injection',
            administration: 'Topical cream or SQ injection',
            protocol: 'Apply to face/neck or inject daily; 4-8 week cycles',
            benefits: [
                'Tightens loose skin and reverses thinning',
                'Repairs skin barrier proteins',
                'Improves firmness, elasticity, clarity',
                'Reduces fine lines, wrinkles, photodamage',
                'Stimulates wound healing and collagen',
                'Protects from UV radiation',
                'Reduces inflammation and free radicals',
                'Increases hair growth and follicle size',
                'Anti-aging and regenerative'
            ],
            sideEffects: [
                'Minimal; mild skin irritation'
            ],
            forms: ['Topical - 2mg/mL Cream', 'Foam (5mg/ml)', 'Injectable - 50mg Vial'],
            category: 'Dermatology / Anti-Aging'
        },
        'glutathione': {
            fullName: 'Glutathione',
            shortcuts: ['GSH'],
            strength: 0.8,
            vialAmount: '600mg Lyophilized',
            dose: '200-600mg daily',
            reconstitution: 'Reconstitute with BAC water',
            administration: 'SQ injection or IV',
            protocol: 'Daily for detox and antioxidant support',
            benefits: [
                'Reduces oxidative stress and detoxifies liver',
                'Supports skin health and anti-aging',
                'Boosts immune function',
                'Clears toxins and free radicals',
                'Prevents liver damage from alcohol/medications'
            ],
            sideEffects: [
                'Rare; mild digestive discomfort or allergic reactions'
            ],
            forms: ['Injectable Vial'],
            category: 'Antioxidant / Detox'
        },
        'hexarelin': {
            fullName: 'Hexarelin (Examorelin)',
            shortcuts: ['Hexarelin'],
            strength: 0.9,
            vialAmount: 'Varies',
            dose: '100-200mcg 1-3x daily',
            reconstitution: 'Reconstitute with BAC water',
            administration: 'SQ injection',
            protocol: 'Daily for 4-8 weeks; combine with GHRH',
            benefits: [
                'Boosts GH release more effectively than GHRP-6',
                'Increases muscle growth and fat loss',
                'Improves recovery and sleep',
                'Reduces somatostatin release',
                'Enhances heart health'
            ],
            sideEffects: [
                'Increased cortisol, prolactin; possible flushing'
            ],
            forms: ['Injectable Vial'],
            category: 'Growth Hormone'
        },
        'igf1-lr3': {
            fullName: 'IGF-1 LR3 (Insulin-like Growth Factor-1 Long Arg3)',
            shortcuts: ['IGF-1 LR3', 'IGF1LR3'],
            strength: 0.9,
            vialAmount: '500mcg Vial',
            dose: '25-50mcg daily',
            reconstitution: 'Reconstitute with 5mL BAC water',
            administration: 'SQ injection in AM',
            protocol: 'Monday-Friday dosing; 4-8 week cycles',
            benefits: [
                'Enhances muscle mass and strength',
                'Decreases inflammation and autoimmunity',
                'Reduces muscle wasting',
                'Improves gut health and collagen production',
                'Balances blood insulin levels',
                'Supports weight loss and joint repair',
                'Promotes systemic growth in tissues'
            ],
            sideEffects: [
                'Hypoglycemia, joint pain'
            ],
            forms: ['Injectable - 500mcg Vial'],
            category: 'Muscle Growth / Recovery'
        },
        'kisspeptin': {
            fullName: 'Kisspeptin-10',
            shortcuts: ['Kisspeptin', 'Kp-10'],
            strength: 0.85,
            vialAmount: '500mcg or 100mcg/ml Vial',
            dose: '10-200mcg 2-3x weekly',
            reconstitution: 'Reconstitute with 5mL BAC water',
            administration: 'SQ injection',
            protocol: 'Daily or 2-3x weekly for hormone support; 4-8 weeks',
            benefits: [
                'Stimulates GnRH release and upregulates LH/FSH',
                'Reverses hypogonadism effects',
                'Increases testosterone and fertility',
                'Improves cognitive function and energy',
                'Regulates sex hormones and behaviors'
            ],
            sideEffects: [
                'Rare; mild irritation or hormonal fluctuations'
            ],
            forms: ['Injectable - 500mcg Vial', 'IV Bolus'],
            category: 'Reproductive Health / Hormone Support'
        },
        'kpv': {
            fullName: 'KPV (Lysine-Proline-Valine)',
            shortcuts: ['KPV'],
            strength: 0.8,
            vialAmount: 'Varies (oral or injectable)',
            dose: '200-500mcg daily',
            reconstitution: 'Reconstitute with BAC water if injectable',
            administration: 'Oral or SQ injection',
            protocol: 'Daily for 4-8 weeks',
            benefits: [
                'Anti-inflammatory and antimicrobial',
                'Supports gut health and immune balance',
                'Reduces cytokine release and leukocyte migration',
                'Promotes wound healing and reduces infections'
            ],
            sideEffects: [
                'Minimal; rare local irritation'
            ],
            forms: ['Oral Capsule', 'Injectable Vial'],
            category: 'Anti-Inflammatory / GI Health'
        },
        'll37': {
            fullName: 'LL-37 (Human Cathelicidin)',
            shortcuts: ['LL-37'],
            strength: 0.8,
            vialAmount: '2.5mg/mL 6mL Vial or 10mg',
            dose: '100-500mcg daily',
            reconstitution: 'N/A - Liquid or reconstitute',
            administration: 'Sublingual drops or SQ',
            protocol: 'Start 2 drops daily; increase to BID if tolerated; 2-4 weeks',
            benefits: [
                'Antimicrobial and promotes wound healing',
                'Controls infections and balances inflammation',
                'Inhibits biofilm formation',
                'Supports immune response'
            ],
            sideEffects: [
                'Rare; mild GI issues'
            ],
            forms: ['Sublingual - 2.5mg/mL Liquid Drops', 'Injectable Vial'],
            category: 'Anti-Infective / Immune'
        },
        'melanotan-ii': {
            fullName: 'Melanotan II',
            shortcuts: ['MT-II', 'Melanotan', 'Melanotan II'],
            strength: 0.9,
            vialAmount: '10mg Vial',
            dose: '100-200mcg daily for tanning; 50mcg for metabolic',
            reconstitution: '5mL-10mL BAC water',
            administration: 'SQ injection',
            protocol: 'Tanning: 200mcg daily x2 weeks, then 100mcg 2-3x/week; Metabolic: 50mcg daily; Immunity: 200mcg daily x6-8 weeks',
            benefits: [
                'Supports melanogenesis and tanning',
                'Photo-protection from UV rays',
                'Increased protection from melanoma',
                'Lessens appetite and improves lipid/glucose regulation',
                'Libido enhancement',
                'Lipolytic effects and appetite control',
                'Anti-inflammatory and lowers oxidative stress',
                'Activates Treg cells and improves Th1/Th17 balance'
            ],
            sideEffects: [
                'Nausea, appetite changes, darkened moles/freckles'
            ],
            forms: ['Injectable - 10mg Vial'],
            category: 'Metabolic / Skin Health'
        },
        'mk677': {
            fullName: 'MK-677 (Ibutamoren)',
            shortcuts: ['MK677', 'Ibutamoren'],
            strength: 0.9,
            vialAmount: '12.5mg and 25mg Capsules or Troche',
            dose: '12.5-25mg daily',
            reconstitution: 'N/A - Oral',
            administration: 'Oral - Capsule or troche',
            protocol: 'Take before bed; 30 days or 8-12 week cycles',
            benefits: [
                'Increases IGF-1 levels and REM sleep',
                'Increases fat-free muscle mass',
                'Decreases body fat percentage',
                'Stronger bones and improved endurance',
                'Increases nitrogen levels and reverses wasting',
                'Supports cognitive performance and joint health'
            ],
            sideEffects: [
                'Increased hunger, possible water retention'
            ],
            forms: ['Oral - 12.5mg/25mg Capsules', '25mg Troche'],
            category: 'Growth Hormone / Recovery'
        },
        'mots-c': {
            fullName: 'MOTS-C (Mitochondrial-derived Peptide)',
            shortcuts: ['MOTS-C'],
            strength: 0.85,
            vialAmount: '10mg Vial',
            dose: '5-10mg 3x weekly',
            reconstitution: 'Reconstitute with 1mL BAC water',
            administration: 'SQ injection',
            protocol: '3x weekly or daily; 4-8 weeks',
            benefits: [
                'Improves glucose regulation and fatty acid oxidation',
                'Decreases insulin resistance and increases energy',
                'Promotes metabolic flexibility and homeostasis',
                'Protects against obesity and osteoporosis',
                'Exercise mimetic for anti-aging'
            ],
            sideEffects: [
                'Minimal; mild local irritation'
            ],
            forms: ['Injectable - 10mg Vial'],
            category: 'Metabolic / Anti-Aging'
        },
        'nad-plus': {
            fullName: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
            shortcuts: ['NAD+', 'NAD'],
            strength: 0.95,
            vialAmount: '1,000mg Vial',
            dose: '100mg 2-3x weekly',
            reconstitution: 'Reconstitute with 5mL BAC water',
            administration: 'SQ injection',
            protocol: '2-3 times per week; ongoing for anti-aging',
            benefits: [
                'Promotes cognitive and sensory function',
                'Restores cellular energy and mitochondrial function',
                'Supports autoimmune diseases, depression, anxiety',
                'Aids drug detox and injury recovery',
                'Protects against cardio/cerebrovascular disease',
                'Boosts metabolism and DNA repair'
            ],
            sideEffects: [
                'Nausea, headaches, lightheadedness'
            ],
            forms: ['Injectable - 1,000mg Vial'],
            category: 'Anti-Aging / Energy'
        },
        'retatrutide': {
            fullName: 'Retatrutide',
            shortcuts: ['Retatrutide'],
            strength: 0.85,
            vialAmount: 'Varies',
            dose: 'Starting 0.5mg weekly, up to 12mg',
            reconstitution: 'Reconstitute with BAC water',
            administration: 'SQ injection weekly',
            protocol: 'Titrate over weeks; 24-48 week treatment',
            benefits: [
                'Triple agonist for GLP-1/GIP/glucagon receptors',
                'Significant weight loss (15-24% in trials)',
                'Improves glycemic control and energy',
                'Reduces appetite and boosts metabolism'
            ],
            sideEffects: [
                'GI issues, appetite changes, gallbladder complications'
            ],
            forms: ['Injectable Vial'],
            category: 'Metabolic / Weight Loss'
        },
        'selank': {
            fullName: 'Selank',
            shortcuts: ['Selank', 'NA-Selank'],
            strength: 0.8,
            vialAmount: '7.5mg/mL Nasal Spray',
            dose: '75-200mcg per nostril 1-3x daily',
            reconstitution: 'N/A - Nasal Spray',
            administration: 'Intranasal - Nasal spray',
            protocol: 'Daily; combine with Semax for enhanced effects',
            benefits: [
                'Neuropsychotropic, antidepressant, anti-stress',
                'Improves memory and learning',
                'Enhances GABA; supports opioid/alcohol withdrawal',
                'Reduces anxiety and enhances cognitive function',
                'Immunomodulatory and mood improvement'
            ],
            sideEffects: [
                'Mild headaches, nasal irritation, mood swings'
            ],
            forms: ['Nasal Spray - 7.5mg/mL (4mL/6mL Vials)'],
            category: 'Neurology / Mental Health'
        },
        'semaglutide': {
            fullName: 'Semaglutide (Ozempic/Wegovy)',
            shortcuts: ['Semaglutide', 'Ozempic'],
            strength: 1.0,
            vialAmount: '2.65/100 mg/mL 2mL Vial or 5mg/10mg/30mg',
            dose: '0.25-2.4mg weekly',
            reconstitution: 'N/A - Pre-filled or reconstitute',
            administration: 'SQ injection weekly',
            protocol: 'Titrate: W1-4 0.25mg, W5-8 0.5mg, up to 2.4mg; 12-16 weeks',
            benefits: [
                'Reduces food intake and appetite',
                'Slows digestion and decreases body fat',
                'Weight loss and lowers HbA1c',
                'Enhances beta cell growth in pancreas',
                'Decreased cardiovascular risks in T2D'
            ],
            sideEffects: [
                'GI discomfort, nausea, thyroid risks'
            ],
            forms: ['Injectable Vial', 'Blend with BPC-157'],
            category: 'Metabolic / Weight Loss'
        },
        'semax': {
            fullName: 'Semax',
            shortcuts: ['Semax', 'NA-Semax'],
            strength: 0.85,
            vialAmount: '7.5mg/mL Nasal Spray or 10mg',
            dose: '50-1000mcg daily',
            reconstitution: 'N/A - Nasal or reconstitute for SubQ',
            administration: 'Intranasal or SQ',
            protocol: 'Nasal 50-100mcg 1-3x daily; SubQ 250-500mcg daily',
            benefits: [
                'Improves cognitive disorders and memory',
                'Supports stroke/TIA prevention',
                'Enhances immune function and mood',
                'Neuroprotective and pain management',
                'Treats ADHD, opioid withdrawal'
            ],
            sideEffects: [
                'Irritability, mild insomnia, nasal irritation'
            ],
            forms: ['Nasal Spray - 7.5mg/mL (4mL/6mL Vials)', 'Injectable 10mg'],
            category: 'Neurology / Cognitive'
        },
        'sermorelin': {
            fullName: 'Sermorelin Acetate',
            shortcuts: ['Sermorelin'],
            strength: 0.9,
            vialAmount: '9mg or 15mg Vial',
            dose: '300-500mcg nightly',
            reconstitution: 'Reconstitute with BAC water',
            administration: 'SQ injection nightly',
            protocol: '6 days/week initially; taper over time; 3-6 months',
            benefits: [
                'Increases lean muscle and strength',
                'Decreases body fat and improves sleep',
                'Boosts energy and immune function',
                'Supports bone density and skin elasticity',
                'Anti-aging and hormone balancing'
            ],
            sideEffects: [
                'Mild flushing, headaches'
            ],
            forms: ['Injectable - 9mg/15mg Vial', 'Troche'],
            category: 'Growth Hormone / Anti-Aging'
        },
        'ss31': {
            fullName: 'SS-31 (Elamipretide)',
            shortcuts: ['SS-31', 'Elamipretide'],
            strength: 0.9,
            vialAmount: '50mg/mL 6mL Vial or 10mg',
            dose: '0.2mL (10mg) daily',
            reconstitution: 'N/A - Pre-filled or reconstitute',
            administration: 'SQ injection',
            protocol: 'Daily for 4-8 weeks',
            benefits: [
                'Supports ALS, Alzheimer\'s, glaucoma, diabetes',
                'Treats skeletal muscle weakness and TBI',
                'Manages atherosclerosis and heart failure',
                'Reduces kidney fibrosis and Friedreich ataxia',
                'Protects against oxidative stress',
                'Improves mitochondrial function and energy'
            ],
            sideEffects: [
                'Mild GI issues, headaches, injection reactions'
            ],
            forms: ['Injectable - 50mg/mL Vial', '10mg Vial'],
            category: 'Mitochondrial / Neurology'
        },
        'tb500': {
            fullName: 'TB-500 (Thymosin Beta-4)',
            shortcuts: ['TB-500', 'Thymosin Beta-4'],
            strength: 0.9,
            vialAmount: '15mg Vial or 5mg',
            dose: '1.87-3.75mg weekly',
            reconstitution: 'Reconstitute with 4mL BAC water',
            administration: 'SQ injection',
            protocol: 'Loading: 3.75mg weekly; maintenance: 1.87mg weekly; 4-6 weeks',
            benefits: [
                'Up-regulates actin and promotes cell migration',
                'Increases cells in healing and reduces scar tissue',
                'Soft tissue repair for tendons, ligaments, muscles',
                'Supports sports/athletic injuries',
                'Enlarged muscle growth and stamina',
                'Immune strengthening and modulation',
                'Reduces inflammation and promotes angiogenesis'
            ],
            sideEffects: [
                'Minimal; mild injection site reactions'
            ],
            forms: ['Injectable - 15mg Vial'],
            category: 'Healing & Recovery'
        },
        'tesofensine': {
            fullName: 'Tesofensine',
            shortcuts: ['Tesofensine'],
            strength: 0.85,
            vialAmount: '0.25mg/0.5mg/1mg Capsules',
            dose: '0.25-1mg daily',
            reconstitution: 'N/A - Oral',
            administration: 'Oral - Capsule',
            protocol: 'Morning daily; 12-16 weeks',
            benefits: [
                'Affects appetite and reduces meal size',
                'Decreases desires for sweet/fatty/salty foods',
                'Improves quality of life, self-esteem, sexual life',
                'Increases REE and fatty acid oxidation',
                'Promotes weight loss and mood enhancement'
            ],
            sideEffects: [
                'GI issues, appetite changes'
            ],
            forms: ['Oral - 0.25mg/0.5mg/1mg Capsules'],
            category: 'Metabolic / Weight Loss'
        },
        'tetradecyl': {
            fullName: 'Tetradecyl Thioacetic Acid / Amlexanox (TTA)',
            shortcuts: ['TTA', 'TTA-A'],
            strength: 0.8,
            vialAmount: '200/40mg Capsule',
            dose: 'One capsule TID',
            reconstitution: 'N/A - Oral',
            administration: 'Oral - Capsule',
            protocol: 'Three times per day',
            benefits: [
                'Weight loss and decreases LDL cholesterol',
                'Improves insulin resistance',
                'Decreases adipose tissue mass',
                'Increases fatty acid transport/uptake/oxidation',
                'Lowers blood pressure',
                'Reduces HbA1c and fructosamine',
                'Cardioprotective'
            ],
            sideEffects: [
                'Mild digestive discomfort'
            ],
            forms: ['Oral - 200/40mg Capsule'],
            category: 'Metabolic'
        },
        'thymosin-alpha1': {
            fullName: 'Thymosin Alpha-1',
            shortcuts: ['TA1', 'Thymalfasin'],
            strength: 0.9,
            vialAmount: '15mg Vial or 10mg',
            dose: '1.6mg 2x weekly or daily for acute',
            reconstitution: 'Reconstitute with BAC water',
            administration: 'SQ injection or nasal',
            protocol: '2x weekly for immune support; daily for infections',
            benefits: [
                'Boosts immune function and balances inflammation',
                'Antimicrobial for infections',
                'Supports autoimmune diseases and chronic fatigue',
                'Anti-fungal/bacterial; increases vaccine effectiveness',
                'Eliminates unhealthy cells and stops cancer growth'
            ],
            sideEffects: [
                'Rare; mild fatigue, injection reactions'
            ],
            forms: ['Injectable - 15mg Vial', 'Nasal Spray'],
            category: 'Immunology'
        },
        'thymulin': {
            fullName: 'Thymulin (Zinc Thymulin)',
            shortcuts: ['Thymulin'],
            strength: 0.85,
            vialAmount: '15mg Vial',
            dose: '500mcg daily',
            reconstitution: 'Reconstitute with 3mL BAC water',
            administration: 'SQ injection or topical foam',
            protocol: 'Daily; topical for hair loss',
            benefits: [
                'Normalizes T-helper/suppressor cells',
                'Downregulates inflammatory mediators',
                'Upregulates anti-inflammatory factors like IL-10',
                'Improves hair growth and prevents loss',
                'Supports androgenic alopecia treatment'
            ],
            sideEffects: [
                'None commonly reported'
            ],
            forms: ['Injectable - 15mg Vial', 'Topical Foam'],
            category: 'Immunology / Hair Health'
        },
        'tirzepatide': {
            fullName: 'Tirzepatide (Mounjaro)',
            shortcuts: ['Tirzepatide'],
            strength: 1.0,
            vialAmount: '5mg/10mg/30mg/60mg',
            dose: '2.5-15mg weekly',
            reconstitution: 'Reconstitute with BAC water',
            administration: 'SQ injection weekly',
            protocol: 'Titrate: W1-4 2.5mg, up to 15mg; 24-48 weeks',
            benefits: [
                'Dual GLP-1/GIP agonist for weight loss',
                'Improves insulin sensitivity and glycemic control',
                'Reduces appetite and enhances fullness',
                'Cardiovascular protection and metabolic health',
                'Superior to Semaglutide in trials (15-20% weight loss)'
            ],
            sideEffects: [
                'Nausea, GI discomfort, potential thyroid risks'
            ],
            forms: ['Injectable Vial', 'Blend with BPC-157'],
            category: 'Metabolic / Weight Loss'
        },
        // Add more new peptides as needed...
    };

    // Merge into global PEPTIDES_DATABASE
    Object.assign(window.PEPTIDES_DATABASE, peptideFormulations);

    console.log(`✅ Peptides Database loaded with ${Object.keys(peptideFormulations).length} formulations`);
})();