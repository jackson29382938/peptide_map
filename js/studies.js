(function() {
    'use strict';

    const studies = [
        {
            id: 'glp1-network-meta-analysis-2024',
            name: 'Comparative Effectiveness of GLP-1 Receptor Agonists on Glycaemic Control',
            description: 'Network meta-analysis of 76 trials (39,246 participants) found tirzepatide delivered the largest HbA1c drop (−2.10% vs placebo) and fasting glucose reduction (−3.12 mmol/L), while CagriSema achieved the greatest weight loss.',
            summary: 'All 15 evaluated GLP-1 receptor agonists significantly improved glycemic control compared to placebo.',
            source: 'BMJ (2024)',
            url: 'https://bmj.com',
            category: 'Metabolic / GLP-1'
        },
        {
            id: 'bpc157-orthopedic-healing-2025',
            name: 'Emerging Use of BPC-157 in Orthopaedic Sports Medicine',
            description: 'Systematic review of 36 studies (35 preclinical, 1 clinical) demonstrates BPC-157 upregulates growth hormone receptors up to sevenfold within three days, reduces inflammatory cytokines, promotes VEGF expression, and offers cytoprotection in muscle, bone, and joint tissue.',
            summary: 'No adverse effects were reported across reviewed models, highlighting regenerative potential for orthopedic injuries.',
            source: 'NIH/PMC (2025)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8624309/',
            category: 'Healing & Recovery'
        },
        {
            id: 'bpc157-ghr-expression-2014',
            name: 'Pentadecapeptide BPC 157 Enhances the Growth Hormone Receptor Expression in Tendon Fibroblasts',
            description: 'In vitro work showed BPC-157 increased growth hormone receptor expression in tendon fibroblasts and amplified growth hormone–driven cell proliferation via time-dependent activation of JAK2 signaling.',
            summary: 'Supports targeted tendon repair strategies through synergistic GH receptor modulation.',
            source: 'International Journal of Molecular Sciences (2014)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6271067/',
            category: 'Healing & Recovery'
        },
        {
            id: 'tripeptide-protein-protection-2025',
            name: 'Adaptive Peptide Dispersions Enable Drying-Induced Biomolecule Encapsulation',
            description: 'Minimal tardigrade-inspired tripeptides undergo liquid–liquid phase separation during desiccation, encapsulating proteins and releasing them intact when rehydrated.',
            summary: 'Points to refrigeration-free storage solutions for vaccines and biologics.',
            source: 'Nature Materials (2025)',
            url: 'https://nature.com',
            category: 'Stability & Formulation'
        },
        {
            id: 'tirzepatide-outcomes-2024',
            name: 'Clinical Outcomes of Tirzepatide or GLP-1 Receptor Agonists in Type 2 Diabetes',
            description: 'Cohort of 140,308 adults with type 2 diabetes revealed tirzepatide reduced all-cause mortality (AHR 0.58) and major adverse cardiovascular events (AHR 0.80) versus other GLP-1 RAs, with an additional −0.34% HbA1c reduction.',
            summary: 'Benefits consistent across demographic and clinical subgroups.',
            source: 'JAMA (2024)',
            url: 'https://jamanetwork.com',
            category: 'Metabolic / GLP-1'
        },
        {
            id: 'cerocin-black-sea-bass-2021',
            name: 'Cerocin, a Novel Piscidin-Like Antimicrobial Peptide from Black Seabass',
            description: 'Identified cerocin peptide with rapid, broad-spectrum bactericidal activity; expression amplified in gill tissue following pathogen exposure.',
            summary: 'Highly effective against Gram-positive pathogens, suggesting aquaculture and clinical potential.',
            source: 'Fish & Shellfish Immunology (2021)',
            url: 'https://pubmed.ncbi.nlm.nih.gov/33677203/',
            category: 'Anti-infective'
        },
        {
            id: 'neoantigen-pancreatic-vaccine-2021',
            name: 'A Neoantigen-Based Peptide Vaccine for Patients With Advanced Pancreatic Cancer',
            description: 'Seven patients received individualized iNeo-Vac-P01 vaccines achieving mean overall survival of 24.1 months; one patient maintained 21-month vaccine-associated survival with TCR clone expansion from 0% to 100%.',
            summary: 'Demonstrated feasibility and durable immune engagement in advanced pancreatic cancer.',
            source: 'Journal of Clinical Oncology (2021)',
            url: 'https://ascopubs.org',
            category: 'Immuno-oncology'
        },
        {
            id: 'murepavadin-pharmacokinetics-2018',
            name: 'Pharmacokinetics, Tolerability, and Safety of Murepavadin',
            description: 'Phase I trials profiled safety and PK of the 14-amino-acid cyclic peptide antibiotic murepavadin targeting Pseudomonas aeruginosa.',
            summary: 'Active against extensively drug-resistant strains, including carbapenemase and colistin-resistant isolates.',
            source: 'Antimicrobial Agents and Chemotherapy (2018)',
            url: 'https://pubmed.ncbi.nlm.nih.gov/29891633/',
            category: 'Anti-infective'
        },
        {
            id: 'murepavadin-beta-lactam-synergy-2023',
            name: 'Murepavadin Enhances the Bactericidal Activities of β-Lactam Antibiotics',
            description: 'Combination therapy of murepavadin with ceftazidime/avibactam in murine pneumonia delivered 2047-fold bacterial reductions versus 42–28-fold for monotherapies.',
            summary: 'Synergy slowed resistance development in Pseudomonas models.',
            source: 'Applied and Environmental Microbiology (2023)',
            url: 'https://journals.asm.org',
            category: 'Anti-infective'
        },
        {
            id: 'peptide-drug-development-overview-2025',
            name: 'Advance in Peptide-Based Drug Development',
            description: 'Review of 87,611 articles across 28 countries documents >60 FDA-approved peptide drugs and >200 peptide vaccine trials spanning 2023–2024.',
            summary: 'Global peptide therapeutics market projected to grow from $41.44B (2023) to $68.83B (2028) at 10.8% CAGR.',
            source: 'Nature (2025)',
            url: 'https://nature.com',
            category: 'Market & Landscape'
        },
        {
            id: 'novel-peptide-research-ku-2025',
            name: 'Novel Peptide Research Offers Waves of Potential',
            description: 'University of Kansas research identified peptides prolonging vasodilation, boosting GLP-1 drug efficacy fivefold, and generating CNS-active candidates for neurodegenerative disease.',
            summary: 'Includes patented candidates targeting metabolic and neurological indications.',
            source: 'University of Kansas School of Pharmacy (2025)',
            url: 'https://pharmacy.ku.edu',
            category: 'Discovery & Innovation'
        },
        {
            id: 'antimicrobial-peptides-resistance-2025',
            name: 'Peptide Study Paves Path Toward New Weapon Against Antibiotic Resistance',
            description: 'Researchers linked antimicrobial peptide efficacy to pore dimensions—larger, longer-lived pores amplify bacterial membrane disruption.',
            summary: 'Provides predictive equation connecting pore traits to antimicrobial performance.',
            source: 'Oregon State University (2025)',
            url: 'https://science.oregonstate.edu',
            category: 'Anti-infective'
        },
        {
            id: 'mazdutide-dreams3-2025',
            name: 'DREAMS-3: Innovent\'s GLP-1RA Beats Semaglutide',
            description: 'Phase III head-to-head trial showed mazdutide (Xinermei) achieved 48% of patients with HbA1c <7% and ≥10% weight loss versus 21% for semaglutide.',
            summary: 'Mean HbA1c reduction 2.03% vs 1.84% and weight loss 10.29% vs 6.0%.',
            source: 'Clinical Trials Arena (2025)',
            url: 'https://clinicaltrialsarena.com',
            category: 'Metabolic / GLP-1'
        },
        {
            id: 'phox2b-car-t-2025',
            name: 'PHOX2B PC-CAR T Enters Human Trials Following FDA IND Approval',
            description: 'First-in-human peptide-centric CAR-T therapy targeting PHOX2B peptide-HLA complexes receives FDA IND for neuroblastoma.',
            summary: 'Initial patient enrollment expected mid-2025, representing new peptide-driven CAR-T paradigm.',
            source: 'Targeted Oncology (2025)',
            url: 'https://targetedonc.com',
            category: 'Immuno-oncology'
        },
        {
            id: 'neoantigen-dc-vaccine-2025',
            name: 'Neoantigen Peptide-Pulsed Dendritic Cell Vaccine Therapy After Surgical Treatment of Pancreatic Cancer',
            description: 'Retrospective review of 16 post-surgical pancreatic cancer patients: three of nine post-recurrence cases exceeded 36-month survival without adverse reactions.',
            summary: 'Neoantigen-specific T cell induction correlated with improved prognosis.',
            source: 'Frontiers in Oncology (2025)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11986906/',
            category: 'Immuno-oncology'
        },
        {
            id: 'oral-glp1-achieve1-2025',
            name: 'Oral GLP-1 Drug Shines in Phase III ACHIEVE-1 Trial',
            description: 'All three oral GLP-1 doses reduced HbA1c from 8.0% baseline with weight losses of 4.7 kg, 5.5 kg, and 7.3 kg respectively.',
            summary: 'Weight reduction continued beyond initial plateau, suggesting additional benefit over extended dosing.',
            source: 'TCTMD (2025)',
            url: 'https://tctmd.com',
            category: 'Metabolic / GLP-1'
        },
        {
            id: 'mel44-multipeptide-vaccine-2024',
            name: 'Multipeptide Vaccines for Melanoma in the Adjuvant Setting',
            description: 'Long-term outcomes from the Mel44 trial show 12MP + 6MHP vaccines exceeded upper 95% CI for survival versus 12MP + tetanus control after 8 years.',
            summary: 'Demonstrated durable survival advantage in melanoma adjuvant therapy.',
            source: 'Nature (2024)',
            url: 'https://nature.com',
            category: 'Immuno-oncology'
        },
        {
            id: 'prrt-meta-analysis-2023',
            name: 'Peptide Receptor Radionuclide Therapy (PRRT): Innovations in Targeted Therapeutics',
            description: 'Meta-analysis of 22 studies (1,758 NET patients) reported partial response rates of 25–35% and disease control rates of 80% using [177Lu]Lu-DOTA-TATE/DOTATOC.',
            summary: 'Validates PRRT as an effective antineoplastic approach for gastroenteropancreatic neuroendocrine tumors.',
            source: 'NIH/PMC (2023)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10150721/',
            category: 'Oncology'
        },
        {
            id: 'collagen-peptides-bmd-2018',
            name: 'Specific Collagen Peptides Improve Bone Mineral Density and Bone Markers in Postmenopausal Women',
            description: 'Double-blind, placebo-controlled trial: daily 5 g collagen peptides for 12 months increased lumbar BMD by 4.2% and femoral neck BMD by 7.7%.',
            summary: 'Observed significant increases in bone formation marker P1NP.',
            source: 'Nutrients (2018)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5793325/',
            category: 'Musculoskeletal'
        },
        {
            id: 'neoantigen-vaccine-pembrolizumab-2024',
            name: 'Personalized Neoantigen Peptide Vaccine Plus Pembrolizumab',
            description: 'Phase I pilot with up to 20 patient-specific peptides plus poly-ICLC alongside pembrolizumab completed Cohort 1 without dose-limiting toxicities.',
            summary: 'Confirms safety and immunogenicity of combining personalized vaccines with checkpoint blockade.',
            source: 'Journal of Clinical Oncology (2024)',
            url: 'https://ascopubs.org',
            category: 'Immuno-oncology'
        },
        {
            id: 'kpv-tripeptide-anti-inflammatory-2007',
            name: 'PepT1-Mediated Tripeptide KPV Uptake Reduces Intestinal Inflammation',
            description: 'KPV inhibited NF-κB and MAPK inflammatory signaling at nanomolar levels, reduced pro-inflammatory cytokines, and decreased colitis incidence when delivered orally.',
            summary: 'Highlights PepT1 transport as a route for anti-inflammatory peptide therapy.',
            source: 'NIH/PMC (2007)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2574623/',
            category: 'Anti-inflammatory'
        },
        {
            id: 'ntprobnp-hf-monitoring-2024',
            name: 'N-terminal Pro-B-Type Natriuretic Peptide Post-Discharge Monitoring in Heart Failure',
            description: 'Randomized study (157 HFpEF patients) showed NT-proBNP monitoring reduced death risk to 1.3% vs 10.1% without monitoring (HR 0.12).',
            summary: 'Supports peptide biomarker-guided follow-up to improve heart failure outcomes.',
            source: 'European Journal of Heart Failure (2024)',
            url: 'https://onlinelibrary.wiley.com',
            category: 'Cardiovascular'
        },
        {
            id: 'bioactive-peptides-breast-milk-2015',
            name: 'Bioactive Peptides in Milk and Dairy Products: A Review',
            description: 'Proteomic analysis identified 328 putative bioactive peptides in human breast milk, 41 with antibacterial properties.',
            summary: 'Demonstrates natural enzymatic generation of immune-protective peptides in milk.',
            source: 'Peptides (2015)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4686279/',
            category: 'Nutrition & Immunity'
        },
        {
            id: 'apelin-cardiovascular-effects-2010',
            name: 'Acute Cardiovascular Effects of Apelin in Humans',
            description: 'Apelin-13 infusion (30–300 nmol/min) increased cardiac index while lowering mean arterial pressure and peripheral resistance.',
            summary: 'First human evidence of apelin-driven coronary and peripheral vasodilation with enhanced cardiac output.',
            source: 'Circulation (2010)',
            url: 'https://ahajournals.org',
            category: 'Cardiovascular'
        },
        {
            id: 'angiotensin-1-7-therapeutic-2015',
            name: 'Angiotensin-(1-7): A Novel Peptide to Treat Hypertension and Diabetes',
            description: 'Reviews anti-oxidant, anti-fibrotic, and anti-inflammatory properties of Ang 1-7, highlighting protective roles in diabetic nephropathy and cardiovascular disorders.',
            summary: 'Clinical trials underway for diabetes-induced hypertension and renal damage.',
            source: 'NIH/PMC (2015)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4633220/',
            category: 'Cardiovascular'
        },
        {
            id: 'exendin4-neuroprotection-2011',
            name: 'Exendin-4 Provides Neuroprotection in Cerebral Ischemia',
            description: 'GLP-1 receptor agonist exendin-4 reduced infarct volume and improved functional recovery following ischemia/reperfusion via cAMP/CREB signaling.',
            summary: 'Suppressed oxidative stress, inflammation, and neuronal death in stroke models.',
            source: 'Stroke (2011)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3144664/',
            category: 'Neurology'
        },
        {
            id: 'exendin4-cognition-2021',
            name: 'Exendin-4 Improves Long-Term Potentiation and Neuronal Dendritic Complexity',
            description: 'In high-fat diet models, exendin-4 restored IRS-1 phosphorylation, enhanced synaptic plasticity, and improved dendritic spine maturation via IRS-1/AKT/GSK-3β pathways.',
            summary: 'Supports cognitive protection in metabolic imbalance.',
            source: 'Nature (2021)',
            url: 'https://nature.com',
            category: 'Neurology'
        },
        {
            id: 'substancep-opioid-chimeric-2000',
            name: 'A Substance P-Opioid Chimeric Peptide as a Unique Nontolerance-Forming Analgesic',
            description: 'Hybrid peptide (ESP7) prevented morphine tolerance; repeated administration for five days produced stable analgesia and restored opioid responsiveness in morphine-tolerant animals.',
            summary: 'Demonstrates potential for tolerance-free pain management.',
            source: 'PNAS (2000)',
            url: 'https://pnas.org',
            category: 'Pain Management'
        },
        {
            id: 'arginine-vasopressin-ferroptosis-2024',
            name: 'Arginine Vasopressin Induces Ferroptosis to Promote Heart Failure',
            description: 'Mouse models and cardiomyocyte studies revealed AVP enhances ACSL4 expression via V1aR/CaN/NFATC3, triggering ferroptosis and heart failure progression.',
            summary: 'NFATC3 inhibition mitigated AVP-induced ferroptosis, suggesting therapeutic target.',
            source: 'NIH/PMC (2024)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10852200/',
            category: 'Cardiovascular'
        },
        {
            id: 'cyclosporine-transplant-1990',
            name: 'Cyclosporine and Organ Transplantation',
            description: 'Cyclic endecapeptide immunosuppressant achieved 1-year graft survival of 70–80% for kidney/heart and 60–65% for liver recipients in Phase I–III trials.',
            summary: 'Selective T-helper cytokine inhibition with nephrotoxicity mitigated by lower initial dosing.',
            source: 'Cleveland Clinic Journal of Medicine (1990)',
            url: 'https://ccjm.org',
            category: 'Transplantation'
        },
        {
            id: 'neoantigen-vaccine-melanoma-breast-2024',
            name: 'Personalized Neo-Antigen Peptide Vaccine for Melanoma/Breast Cancer',
            description: 'Phase I trial combines shared and patient-specific peptides with poly-ICLC for stage IIIC-IV melanoma or HR+ HER2- metastatic breast cancer.',
            summary: 'Aims to elicit Th1-polarized responses; enrollment underway.',
            source: 'Fred Hutch Clinical Trial (2024)',
            url: 'https://fredhutch.org',
            category: 'Immuno-oncology'
        },
        {
            id: 'melanoma-vaccine-cdx1140-2024',
            name: 'Phase I/II Clinical Trial of Melanoma Vaccine Targeting Shared Antigens',
            description: 'Seven-peptide vaccine including melanoma helper peptides and BRAF-V600E neoantigen, co-administered with CD40 agonist CDX-1140 and TLR3 agonist poly-ICLC, proved safe up to 3 mg.',
            summary: 'Supported immunogenicity for advanced melanoma combinations.',
            source: 'Journal of Immunotherapy of Cancer (2024)',
            url: 'https://jitc.bmj.com',
            category: 'Immuno-oncology'
        },
        {
            id: 'collagen-peptides-longterm-2021',
            name: 'Specific Bioactive Collagen Peptides in Osteopenia and Osteoporosis',
            description: 'Long-term follow-up confirmed daily 5 g collagen peptides produced progressive spinal BMD gains and improved bone stability in osteopenia/osteoporosis.',
            summary: 'Suggests sustained supplementation counters age-related bone loss.',
            source: 'Nutrients (2021)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8400346/',
            category: 'Musculoskeletal'
        },
        {
            id: 'bnp-guided-treatment-2014',
            name: 'Effect of B-Type Natriuretic Peptide-Guided Treatment on Mortality',
            description: 'Meta-analysis of 11 trials (2,000 patients) showed natriuretic peptide-guided therapy reduced all-cause mortality (HR 0.62) and cut heart failure/cardiovascular hospitalization.',
            summary: 'Reinforces peptide biomarkers for personalized heart failure management.',
            source: 'Journal of the American College of Cardiology (2014)',
            url: 'https://academic.oup.com',
            category: 'Cardiovascular'
        },
        {
            id: 'bpc157-iv-safety-2025',
            name: 'Safety of Intravenous Infusion of BPC-157 in Humans: A Pilot Study',
            description: 'Two healthy adults received IV BPC-157 infusions (10 mg day 1, 20 mg day 2; each in 250 cc saline over 1 hour). Monitored heart, liver, kidney, thyroid, and glucose biomarkers remained normal.',
            summary: 'BPC-157 was well tolerated with zero side effects reported across biomarker panels.',
            source: 'PubMed (2025)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Healing & Recovery'
        },
        {
            id: 'subcutaneous-peptide-bioavailability-2024',
            name: 'Investigation of the Relationship Between In Vitro Properties of Subcutaneously Administered Peptides',
            description: 'Comprehensive evaluation of peptide behavior in adipose tissue correlated in vitro characteristics with in vivo SC bioavailability and highlighted poor translation from animal models.',
            summary: 'Presents in vitro model to predict therapeutic peptide fate and guide formulation design for SC delivery.',
            source: 'Uppsala University (2024)',
            url: 'https://uu.se',
            category: 'Formulation & Delivery'
        },
        {
            id: 'iv-peptide-pulsed-dc-2001',
            name: 'Phase I Trial of Intravenous Peptide-Pulsed Dendritic Cells',
            description: 'Sixteen metastatic melanoma patients received IV dendritic cells pulsed with tyrosinase and gp100 peptides; one complete remission and multiple immune responses observed.',
            summary: 'Demonstrated immune activation with minimal toxicity (only 2 grade III events) supporting IV DC-pulsed peptide therapy feasibility.',
            source: 'Journal of Immunotherapy (2001)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Immuno-oncology'
        },
        {
            id: 'plga-injectable-depot-2014',
            name: 'Injectable Controlled Release Depots for Large Molecules',
            description: 'Review of PLGA depot formulations for proteins/peptides detailing how polymer weight, structure, and loading influence erosion and release kinetics.',
            summary: 'Highlights formulation levers for 1–3 month controlled release and strategies to mitigate aggregation and polymer interactions.',
            source: 'NIH/PMC (2014)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4097348/',
            category: 'Formulation & Delivery'
        },
        {
            id: 'plg0206-phase1-2021',
            name: 'A Phase 1 Study of the Safety, Tolerability, and Pharmacokinetics',
            description: 'Single IV infusion of antimicrobial peptide PLG0206 (0.05–1 mg/kg) in healthy subjects showed linear PK with 7.37–19.97 hour half-life and favorable safety.',
            summary: 'Supports continued IV development of PLG0206 as a broad-spectrum antimicrobial agent.',
            source: 'Applied and Environmental Microbiology (2021)',
            url: 'https://journals.asm.org',
            category: 'Anti-infective'
        },
        {
            id: 'octreotide-depot-cam2029-2024',
            name: 'Octreotide Subcutaneous Depot for Acromegaly',
            description: 'Randomized trial (CAM2029 vs placebo) in 72 patients showed SC depot octreotide provided 5-fold higher bioavailability than LAR with room-temperature storage and self-injection.',
            summary: 'CAM2029 maintained biochemical control and improved patient satisfaction versus placebo and baseline standards of care.',
            source: 'Journal of Clinical Endocrinology & Metabolism (2024)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Endocrinology'
        },
        {
            id: 'leuprolide-depot-prostate-2025',
            name: 'Leuprolide for Advanced Prostate Cancer (Lupron Depot)',
            description: 'Depot leuprolide dosing (monthly to biannual) lowers testosterone to castrate levels after initial surge; administered in clinic with manageable side effects.',
            summary: 'Remains a cornerstone androgen deprivation therapy option for advanced prostate cancer.',
            source: 'WebMD (2025)',
            url: 'https://webmd.com',
            category: 'Oncology'
        },
        {
            id: 'goserelin-endometriosis-1996',
            name: 'Zoladex (Goserelin Acetate Implant) in Treatment of Endometriosis',
            description: 'Randomized comparison to danazol in 315 patients showed goserelin achieved 53% AFS score reduction versus 33% with danazol and reduced estradiol to postmenopausal levels.',
            summary: 'Superior symptom control came with a small, reversible BMD loss relative to danazol’s androgenic side effects.',
            source: 'Fertility and Sterility (1996)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Endocrinology'
        },
        {
            id: 'sandostatin-lar-acs-2000',
            name: 'Sandostatin LAR Depot (Octreotide Acetate Injectable)',
            description: 'Monthly IM octreotide (10–30 mg) delivers sustained concentrations with day-1 peak followed by 28-day plateau for acromegaly management.',
            summary: 'Enables long-term disease control with monthly dosing versus multiple daily injections.',
            source: 'FDA Prescribing Information',
            url: 'https://accessdata.fda.gov',
            category: 'Endocrinology'
        },
        {
            id: 'triptorelin-gnrh-2011',
            name: 'Six-Month Gonadotropin Releasing Hormone (GnRH) Agonist Depots',
            description: 'In 120 prostate cancer patients, 6-month triptorelin pamoate achieved 96% castrate testosterone within 3 days and 100% by 6 months with minimal injection site reactions.',
            summary: 'Provided superior PSA progression-free survival compared with leuprolide.',
            source: 'Therapeutics and Clinical Risk Management (2011)',
            url: 'https://tandfonline.com',
            category: 'Oncology'
        },
        {
            id: 'buserelin-nasal-prostate-2023',
            name: 'Drug Development of Intranasally Delivered Peptides',
            description: 'Buserelin nasal spray offers 2.5–3.3% bioavailability versus 70% via SC injection, suppressing testosterone up to 80% though SC remains more reliable.',
            summary: 'Highlights intranasal GnRH agonist as an alternative for prostate cancer and endometriosis despite variable absorption.',
            source: 'Creative Peptides (2023)',
            url: 'https://creative-peptides.com',
            category: 'Formulation & Delivery'
        },
        {
            id: 'histrelin-supprelin-implant-2022',
            name: 'SUPPRELIN LA (Histrelin Acetate) Subcutaneous Implant',
            description: 'Provides 12-month continuous release (~65 μg/day) maintaining prepubertal gonadotropin levels for central precocious puberty treatment.',
            summary: 'Achieves rapid steroid suppression within 4 weeks with a single yearly insertion.',
            source: 'FDA Prescribing Information',
            url: 'https://accessdata.fda.gov',
            category: 'Endocrinology'
        },
        {
            id: 'lanreotide-net-realworld-2023',
            name: 'Real World Use of Lanreotide in Neuroendocrine Tumors',
            description: 'Retrospective study of 69 NET patients showed lanreotide favored in extragonadal/high-grade disease with fewer dose escalations and longer initial therapy duration versus octreotide.',
            summary: 'Patient-preferred self-injection with effective first-line disease stabilization.',
            source: 'NIH/PMC (2023)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10286922/',
            category: 'Oncology'
        },
        {
            id: 'exenatide-type2dm-2005',
            name: 'Exenatide (Byetta) as Novel Treatment for Type 2 Diabetes',
            description: 'Twice-daily SC exenatide 5–10 μg added to oral therapy reduced HbA1c by 0.4–0.8% and weight by 1.6 kg over 30 weeks with low hypoglycemia risk.',
            summary: 'Dose-dependent GI effects diminished over time while metabolic benefits persisted.',
            source: 'Annals of Pharmacotherapy (2005)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Metabolic'
        },
        {
            id: 'liraglutide-weight-loss-2025',
            name: 'Victoza for Weight Loss: Clinical Studies and Efficacy',
            description: 'Daily liraglutide 1.2–3 mg produced 16–17 lb mean weight loss at 4 months, with higher Saxenda dose achieving 17.6 lb reduction alongside lifestyle changes.',
            summary: 'GLP-1 receptor agonist suppresses appetite and slows gastric emptying delivering 5–10% body weight loss for most users.',
            source: 'GoodRx/Hers (2025)',
            url: 'https://goodrx.com',
            category: 'Metabolic'
        },
        {
            id: 'somatostatin-analog-patterns-2023',
            name: 'Treatment Patterns of Long-Acting Somatostatin Analogs for NETs',
            description: 'Claims-based analysis showed lanreotide required fewer above-label dose escalations than octreotide LAR and maintained disease stability across NET subtypes.',
            summary: 'Real-world utilization favors lanreotide for durable control with lower escalation burden.',
            source: 'Journal of Health Economics and Outcomes Research (2023)',
            url: 'https://jheor.org',
            category: 'Oncology'
        },
        {
            id: 'dulaglutide-rewind-2022',
            name: 'GLP-1 RA Dulaglutide Yields Cardiac Gains',
            description: 'REWIND trial (9,901 patients) showed once-weekly dulaglutide reduced major adverse cardiovascular events 12% and nonfatal stroke 24% while lowering HbA1c and weight.',
            summary: 'Cardiovascular benefits manifested within the first year and persisted over follow-up.',
            source: 'The Hospitalist (2022)',
            url: 'https://blogs.the-hospitalist.org',
            category: 'Cardiovascular'
        },
        {
            id: 'semaglutide-reach-2025',
            name: 'Ozempic Shows Greater Effect in Reducing Cardiovascular Events',
            description: 'REACH study of 58,336 Medicare patients (≥66 years) with ASCVD and T2DM found weekly semaglutide reduced MACE by 23% versus dulaglutide.',
            summary: 'Highlighted semaglutide’s superior cardioprotection across heart attack, stroke, and mortality outcomes.',
            source: 'Neurology Live (2025)',
            url: 'https://neurologylive.com',
            category: 'Cardiovascular'
        },
        {
            id: 'degarelix-prostate-2012',
            name: 'Experience with Degarelix in Treatment of Prostate Cancer',
            description: 'GnRH antagonist degarelix delivered castrate testosterone by day 3 in 96% without surge and improved PSA progression-free survival by 34% compared with leuprolide.',
            summary: 'Provided rapid symptom relief with comparable safety profile, delaying CRPC progression.',
            source: 'NIH/PMC (2012)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3423146/',
            category: 'Oncology'
        },
        {
            id: 'ziconotide-intrathecal-2006',
            name: 'Conotoxins: Therapeutic Potential and Application',
            description: 'Intrathecal ziconotide infusion in 111 cancer/AIDS patients delivered potent analgesia without tolerance development, outperforming morphine in refractory pain.',
            summary: 'Established conotoxin MVIIA (Prialt) as an FDA-approved option for severe chronic pain.',
            source: 'PMC (2006)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC1584647/',
            category: 'Pain Management'
        },
        {
            id: 'cgx1160-spinal-pain-2019',
            name: 'Conotoxin CGX-1160 Analgesic Potential',
            description: 'Open-label intrathecal dose-escalation in spinal cord injury patients reduced pain intensity and allodynia with good tolerability.',
            summary: 'Findings support randomized trials of this potent conotoxin analgesic.',
            source: 'Summit Pain Alliance (2019)',
            url: 'https://summitpainalliance.com',
            category: 'Pain Management'
        },
        {
            id: 'o1cal64b-inflammatory-pain-2025',
            name: 'Systemic Antihyperalgesic Effect of Conotoxin',
            description: 'Synthetic conotoxin O1_cal6.4b reduced thermal hyperalgesia in rat inflammatory pain models via peripheral administration with low adverse effects.',
            summary: 'Demonstrated systemic conotoxin potential for inflammatory pain interception.',
            source: 'Frontiers in Marine Science (2025)',
            url: 'https://frontiersin.org',
            category: 'Pain Management'
        },
        {
            id: 'paliperidone-monthly-schizophrenia-2010',
            name: 'A Controlled, Evidence-Based Trial of Paliperidone Palmitate',
            description: 'Phase 3 trial showed once-monthly paliperidone palmitate significantly improved PANSS scores across doses without QTc prolongation.',
            summary: 'First once-monthly atypical antipsychotic enabling gluteal or deltoid administration for schizophrenia.',
            source: 'Nature (2010)',
            url: 'https://nature.com',
            category: 'Neuropsychiatry'
        },
        {
            id: 'paliperidone-review-2017',
            name: 'Long-Acting Injectable Paliperidone Palmitate Review',
            description: 'Systematic review affirmed safety and efficacy of 1- and 3-month paliperidone formulations with better adherence than oral agents.',
            summary: 'Best suited for patients with prior oral antipsychotic failure or noncompliance histories.',
            source: 'NIH/PMC (2017)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5426995/',
            category: 'Neuropsychiatry'
        },
        {
            id: 'paliperidone-hafyera-2022',
            name: 'INVEGA HAFYERA (Paliperidone Palmitate) 6-Month Injection',
            description: 'Six-month IM paliperidone formulation maintains efficacy and safety while dramatically reducing injection frequency.',
            summary: 'Offers adherence advantages with ready-to-use long-acting delivery for schizophrenia.',
            source: 'Invega Sustenna HCP (2022)',
            url: 'https://invegasustennahcp.com',
            category: 'Neuropsychiatry'
        },
        {
            id: 'cabergoline-vs-bromocriptine-2012',
            name: 'Cabergoline versus Bromocriptine in Treatment of Hyperprolactinemia',
            description: 'Meta-analysis of seven RCTs showed cabergoline normalized prolactin more effectively and with fewer adverse events than bromocriptine.',
            summary: 'Supports cabergoline as first-line therapy for prolactinomas.',
            source: 'Cochrane Database (2012)',
            url: 'https://ncbi.nlm.nih.gov',
            category: 'Endocrinology'
        },
        {
            id: 'cabergoline-cell-death-2019',
            name: 'Bromocriptine and Cabergoline Induce Cell Death',
            description: 'Differential cell death mechanisms—apoptosis for bromocriptine and autophagy for cabergoline—explain varied prolactinoma responses.',
            summary: 'Mechanistic insights inform choice of dopamine agonist in resistant prolactinomas.',
            source: 'Nature (2019)',
            url: 'https://nature.com',
            category: 'Endocrinology'
        },
        {
            id: 'cabergoline-macroprolactinoma-1996',
            name: 'Treatment of Prolactin-Secreting Macroadenomas',
            description: 'Cabergoline delivered superior prolactin reduction and tumor shrinkage versus bromocriptine with improved tolerability in women with macroadenomas.',
            summary: 'Established cabergoline as preferred dopamine agonist for macroprolactinoma management.',
            source: 'American Journal of Obstetrics & Gynecology (1996)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Endocrinology'
        },
        {
            id: 'semaglutide-select-weight-2024',
            name: 'Long-Term Weight Loss Effects of Semaglutide in Obesity',
            description: 'SELECT trial analysis (17,604 adults) showed weekly 2.4 mg semaglutide sustained weight loss over 4 years with 20% MACE reduction.',
            summary: 'Consistent safety and efficacy across demographic and metabolic subgroups.',
            source: 'Nature (2024)',
            url: 'https://nature.com',
            category: 'Metabolic'
        },
        {
            id: 'degarelix-psa-control-2016',
            name: 'An Update on Triptorelin: Androgen Deprivation Therapy',
            description: 'Comparative review noted degarelix’s superior PSA progression-free survival (HR 0.664) and faster testosterone suppression without surge versus leuprolide.',
            summary: 'Highlights nuanced selection between GnRH agonists and antagonists for prostate cancer management.',
            source: 'NIH/PMC (2016)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Oncology'
        },
        {
            id: 'peptide-bioavailability-oral-2024',
            name: 'Bioavailability of Peptides',
            description: 'Bachem analysis reports <1% oral peptide bioavailability due to enzymatic and pH degradation; SC routes often <5% and nasal ~2–3% without enhancement.',
            summary: 'Details modification strategies and route considerations to improve systemic peptide exposure.',
            source: 'Bachem (2024)',
            url: 'https://bachem.com',
            category: 'Formulation & Delivery'
        },
        {
            id: 'octreotide-pamoate-patent-2000',
            name: 'Sustained Release Formulations of Water Soluble Peptides',
            description: 'Patent discloses octreotide pamoate depot using biodegradable polymer where erosion rate, particle size, and loading govern release kinetics.',
            summary: 'Provides design principles to achieve extended octreotide exposure via polymer engineering.',
            source: 'Google Patents (2000)',
            url: 'https://patents.google.com',
            category: 'Formulation & Delivery'
        },
        {
            id: 'dulaglutide-cv-safety-2018',
            name: 'Cardiovascular Outcomes with Once-Weekly GLP-1 RAs',
            description: 'Comprehensive REWIND safety analysis confirmed dulaglutide’s significant MACE reduction (HR 0.88) and early-onset cardiovascular benefit beyond glycemic control.',
            summary: 'Supports dulaglutide’s cardioprotective labeling within GLP-1 class.',
            source: 'Journal of Managed Care & Specialty Pharmacy (2018)',
            url: 'https://jmcp.org',
            category: 'Cardiovascular'
        },
        {
            id: 'semaglutide-renal-cv-2024',
            name: 'Ozempic Cardiovascular and Renal Protection',
            description: 'SOUL trial (9,650 patients) reported 14% reduction in composite CV death/MI/stroke along with kidney protection, marking first oral GLP-1 with multi-system benefits.',
            summary: 'Supported EMA cardiovascular indication expansion for semaglutide.',
            source: 'Ozempic Official (2024)',
            url: 'https://ozempic.com',
            category: 'Cardiovascular'
        },
        {
            id: 'anp-mechanism-2023',
            name: 'Atrial Natriuretic Peptide - StatPearls',
            description: 'ANP (28 aa) elevates cGMP to increase GFR, promote natriuresis/diuresis, suppress renin/aldosterone, and reduce sympathetic tone for blood pressure control.',
            summary: 'Reviews ANP’s integrated cardiovascular and renal protective mechanisms.',
            source: 'NIH (2023)',
            url: 'https://ncbi.nlm.nih.gov/books/NBK535383/',
            category: 'Cardiovascular'
        },
        {
            id: 'vip-immunosuppression-2017',
            name: 'Activation of VIP Signaling Enhances Immunosuppressive Effect',
            description: 'Vasoactive intestinal peptide inhibits T cell proliferation and macrophage cytokines via VPAC1/2, regulating myeloid suppressor cells and nitric oxide production.',
            summary: 'Positions VIP as a neuropeptide regulator of immune homeostasis.',
            source: 'Oncotarget (2017)',
            url: 'https://www.oncotarget.com',
            category: 'Immunology'
        },
        {
            id: 'cgrp-migraine-2020',
            name: 'Calcitonin Gene-Related Peptide (CGRP): Role in Migraine Pathophysiology',
            description: 'CGRP, a potent vasodilator, elevates during migraine attacks and infusion triggers migraine-like headaches; receptor antagonists block binding without vasoconstriction.',
            summary: 'Provides mechanistic rationale for CGRP-targeted therapies in migraine prevention.',
            source: 'Expert Opinion in Therapeutic Targets (2020)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Neurology'
        },
        {
            id: 'thymosin-alpha-melanoma-2019',
            name: 'A Reappraisal of Thymosin Alpha1 in Cancer Therapy',
            description: 'Tα1 combined with dacarbazine and interferon showed melanoma efficacy; preclinical data demonstrate synergy with anti-PD-1 and reduced metastasis.',
            summary: 'Highlights Tα1’s immune-modulating role enhancing chemo- and immunotherapies.',
            source: 'NIH/PMC (2019)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6768929/',
            category: 'Immuno-oncology'
        },
        {
            id: 'defensin1-wound-2017',
            name: 'Bee-Derived Antibacterial Peptide, Defensin-1, Promotes Wound Re-Epithelialization',
            description: 'Defensin-1 enhanced keratinocyte migration and MMP-9 secretion, producing complete epithelial closure versus controls by day 15.',
            summary: 'Activates ERK signaling to accelerate wound healing while providing antimicrobial cover.',
            source: 'Nature (2017)',
            url: 'https://nature.com',
            category: 'Wound Healing'
        },
        {
            id: 'enkephalin-pain-modulation-2024',
            name: 'Enkephalins and Pain Modulation: Mechanisms of Action',
            description: 'Endogenous enkephalins mediate μ- and δ-opioid receptor signaling for analgesia and neuroprotection but are rapidly degraded by enkephalinases.',
            summary: 'Explains limitations of natural enkephalins for sustained pain relief.',
            source: 'PubMed (2024)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Pain Management'
        },
        {
            id: 'zoledronic-ta1-prostate-2023',
            name: 'Zoledronic Acid and Thymosin α1 Elicit Antitumor Immunity',
            description: 'Combination therapy reversed immunosuppression, activated macrophages, and enhanced cytotoxic T cells while modulating MyD88/NF-κB pathways.',
            summary: 'Altered tumor immune landscape to slow prostate cancer progression.',
            source: 'Journal of Immunotherapy of Cancer (2023)',
            url: 'https://jitc.bmj.com',
            category: 'Immuno-oncology'
        },
        {
            id: 'hbd3-wound-healing-2021',
            name: 'The Antimicrobial Peptide Human β-Defensin-3 Accelerates Wound Healing',
            description: 'hBD-3 stimulated keratinocyte proliferation/migration through ERK and PAK pathways while exerting broad antimicrobial activity.',
            summary: 'Supports hBD-3 as dual-action peptide for infected wound management.',
            source: 'Frontiers in Microbiology (2021)',
            url: 'https://frontiersin.org',
            category: 'Wound Healing'
        },
        {
            id: 'psa-inhibition-enkephalin-2024',
            name: 'Modulation of Endogenous Opioid Signaling by Inhibitors',
            description: 'Puromycin-sensitive aminopeptidase inhibitor compound 19 prevented enkephalin degradation, boosting analgesia that was naloxone reversible.',
            summary: 'Combining PSA inhibition with enkephalin elevation enhanced opioid-sparing pain control.',
            source: 'bioRxiv (2024)',
            url: 'https://biorxiv.org',
            category: 'Pain Management'
        },
        {
            id: 'kisspeptin-gpr54-2013',
            name: 'Dependence of Fertility on Kisspeptin–Gpr54 Signaling',
            description: 'Conditional deletion of Gpr54 in GnRH neurons caused infertility and failed puberty, confirming kisspeptin’s necessity for reproductive axis activation.',
            summary: 'Demonstrated 0% GnRH neuron responsiveness to kisspeptin in mutants versus 85% in controls.',
            source: 'Nature (2013)',
            url: 'https://nature.com',
            category: 'Endocrinology'
        },
        {
            id: 'npy-sympathetic-obesity-2024',
            name: 'Sympathetic Neuropeptide Y Protects from Obesity',
            description: 'Sympathetic neuron-derived NPY sustained thermogenic adipocyte progenitors; deficiency led to brown fat whitening and adult-onset obesity independent of intake.',
            summary: 'Reveals sympathetic NPY as guardian of energy expenditure.',
            source: 'Nature (2024)',
            url: 'https://nature.com',
            category: 'Metabolic'
        },
        {
            id: 'll37-anti-biofilm-2013',
            name: 'The Human Cathelicidin Antimicrobial Peptide LL-37',
            description: 'LL-37 inhibited Pseudomonas biofilms at sub-MIC concentrations, displayed activity against MDR Staphylococcus aureus, and promoted wound healing.',
            summary: 'Showcases LL-37’s dual antimicrobial and tissue-regenerative properties.',
            source: 'Frontiers in Cellular and Infection Microbiology (2013)',
            url: 'https://frontiersin.org',
            category: 'Anti-infective'
        },
        {
            id: 'hdac-inhibitors-cancer-2009',
            name: 'Histone Deacetylase Inhibitors in Cancer Therapy',
            description: 'Reviews FDA-approved vorinostat plus emerging HDAC inhibitors (depsipeptide, MGCD0103) that induce tumor cell arrest/apoptosis with limited normal tissue effects.',
            summary: 'Supports combination strategies with cytotoxics and proteasome inhibitors.',
            source: 'Journal of Clinical Oncology (2009)',
            url: 'https://ascopubs.org',
            category: 'Oncology'
        },
        {
            id: 'relaxin-cardiac-fibrosis-2004',
            name: 'Relaxin Modulates Cardiac Fibroblast Proliferation and Differentiation',
            description: 'Relaxin inhibited TGF-β/Ang II-driven fibroblast activation, reducing collagen synthesis by up to 58% in fibrotic mouse models.',
            summary: 'Promotes collagen degradation via MMP-2, reversing cardiac fibrosis.',
            source: 'Circulation Research (2004)',
            url: 'https://academic.oup.com',
            category: 'Cardiovascular'
        },
        {
            id: 'relaxin-hypertension-fibrosis-2005',
            name: 'Relaxin Reverses Cardiac and Renal Fibrosis',
            description: 'In hypertensive rats, relaxin selectively reduced myocardial and renal collagen, lowered renin/aldosterone, and spared basal collagen.',
            summary: 'Advocates relaxin as anti-fibrotic therapy for hypertensive organ damage.',
            source: 'Hypertension (2005)',
            url: 'https://ahajournals.org',
            category: 'Cardiovascular'
        },
        {
            id: 'ogp-fracture-healing-2016',
            name: 'The Role of Peptides in Bone Healing and Regeneration',
            description: 'Osteogenic growth peptide enhanced callus volume, accelerated fracture union, and upregulated osteogenic cell proliferation via TGF-β signaling.',
            summary: 'Demonstrated improved bone formation when incorporated into PLGA scaffolds.',
            source: 'NIH/PMC (2016)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5001156/',
            category: 'Musculoskeletal'
        },
        {
            id: 'gfoger-collagen-peptide-2020',
            name: 'Identification of Osteogenic Progenitor Cell-Targeted Peptides',
            description: 'GFOGER collagen-mimetic peptide enhanced α2β1 integrin binding, improving peri-implant bone regeneration and osseointegration.',
            summary: 'Selective targeting of osteogenic progenitors boosted differentiation signaling.',
            source: 'Nature (2020)',
            url: 'https://nature.com',
            category: 'Musculoskeletal'
        },
        {
            id: 'svvyglr-osteogenic-2022',
            name: 'Osteogenic Peptides for Bone Regeneration',
            description: 'SVVYGLR peptide promoted MSC adhesion, endothelial activity, and neovascularization, driving coordinated osteogenesis and angiogenesis.',
            summary: 'Collagen sponge delivery enhanced bone defect repair.',
            source: 'ACS Biomaterials (2022)',
            url: 'https://pubs.acs.org',
            category: 'Musculoskeletal'
        },
        {
            id: 'ogp-hydrogel-2022',
            name: 'Supramolecular Hydrogel Based on Osteogenic Growth Peptide',
            description: 'Self-assembling OGP hydrogels increased cell proliferation 1.5–1.7-fold and upregulated osteogenic markers (RUNX2, BMP2, OCN, OPN).',
            summary: 'Injectable hydrogel showed biocompatibility and sustained differentiation for bone defect repair.',
            source: 'ACS Biomaterials (2022)',
            url: 'https://pubs.acs.org',
            category: 'Musculoskeletal'
        },
        {
            id: 'octoprohibitin-antimicrobial-2022',
            name: 'Novel Antimicrobial Peptide \"Octoprohibitin\"',
            description: 'Octopus-derived peptide displayed MIC/MBC 200/400 μg/mL against MDR Acinetobacter baumannii, eradicated biofilms at 1460 μg/mL, and bound bacterial DNA.',
            summary: 'Outperformed chloramphenicol in biofilm eradication with pH-dependent activity.',
            source: 'NIH/PMC (2022)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9318525/',
            category: 'Anti-infective'
        },
        {
            id: 'lactoferrin-anti-infection-2020',
            name: 'Lactoferrin and Its Derived Peptides: An Alternative',
            description: 'Lactoferrin and lactoferricins exhibited broad antibacterial activity, stimulating cell proliferation and combating resistant S. aureus/K. pneumoniae strains.',
            summary: 'Supports lactoferrin-derived peptides as adjuncts against antibiotic-resistant infections.',
            source: 'NIH/PMC (2020)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7754624/',
            category: 'Anti-infective'
        },
        {
            id: 'lactoferrin-mrsa-2001',
            name: 'Human Lactoferrin and Peptides',
            description: 'Radiolabeled lactoferrin peptides localized to infection sites (1–1.5% of dose) within minutes, retaining antimicrobial activity against resistant S. aureus.',
            summary: 'Demonstrated targeted accumulation and superior activity versus antibiotics.',
            source: 'Journal of Antimicrobial Chemotherapy (2001)',
            url: 'https://journals.asm.org',
            category: 'Anti-infective'
        },
        {
            id: 'octominin-anticandidal-2020',
            name: 'Octominin: A Novel Synthetic Anticandidal Peptide',
            description: 'Octominin induced fungal cell wall damage, membrane disruption, and ROS elevation, displaying potent antifungal activity.',
            summary: 'Represents promising lead for anticandidal therapeutics.',
            source: 'NIH/PMC (2020)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Anti-infective'
        },
        {
            id: 'hbd2-barrier-protection-2023',
            name: 'A Mechanistic Evaluation of Human Beta Defensin 2',
            description: 'Exogenous HBD-2 protected keratinocyte barrier integrity against Staphylococcus aureus protease V8-induced damage by modulating ECM proteins.',
            summary: 'Provides barrier protection without disrupting healthy monolayers.',
            source: 'Nature Microbiology (2023)',
            url: 'https://nature.com',
            category: 'Wound Healing'
        },
        {
            id: 'matricryptin-pgp-2015',
            name: 'The Matrikine N-α-PGP Couples Extracellular Matrix Fragmentation',
            description: 'Collagen-derived N-α-PGP activated endothelial cells via CXCR2, increasing Rac1/ERK/PAK signaling and vascular permeability in ARDS pathogenesis.',
            summary: 'Links matrix fragmentation to endothelial dysfunction in acute lung injury.',
            source: 'Science (2015)',
            url: 'https://science.org',
            category: 'Immunology'
        },
        {
            id: 'elastin-matricryptin-2020',
            name: 'Extracellular Matrix-Derived Peptides in Tissue Remodeling',
            description: 'Elastin-derived peptides promoted fibroblast proliferation and collagenase-1 expression via ERK1/2, driving matrix remodeling.',
            summary: 'Elucidates matricryptin contributions to tissue turnover and repair.',
            source: 'NIH/PMC (2020)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7185801/',
            category: 'Wound Healing'
        },
        {
            id: 'oxytocin-autism-response-2017',
            name: 'Study Shows Which Children with Autism Respond Best to Oxytocin',
            description: 'Children with lower baseline oxytocin experienced greatest social behavior improvements after oxytocin therapy, without changes in repetitive behavior or anxiety.',
            summary: 'Suggests baseline hormone profiling can predict oxytocin responsiveness.',
            source: 'Stanford Medicine (2017)',
            url: 'https://med.stanford.edu',
            category: 'Neurology'
        },
        {
            id: 'oxytocin-social-disorders-2025',
            name: 'Oxytocin and Autism: Insights from Clinical Trials',
            description: 'Oxytocin increases attention to social cues and amplifies existing emotional states; low levels correlate with more severe autism symptoms.',
            summary: 'Frames oxytocin as a social reward modulator and potential biomarker.',
            source: 'PubMed (2025)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Neurology'
        },
        {
            id: 'hbd2-atopic-dermatitis-2017',
            name: 'Current Insights into the Role of Human β-Defensins',
            description: 'Acute atopic dermatitis lesions show high hBD-2 levels driven by IL-17/IL-22; chronic lesions with impaired hBD correlate with infection susceptibility.',
            summary: 'Positions hBD modulation as therapeutic target for AD infections.',
            source: 'Allergy (2017)',
            url: 'https://onlinelibrary.wiley.com',
            category: 'Immunology'
        },
        {
            id: 'hbd2-inflammation-2021',
            name: 'Human β-Defensin 2 and Its Role in Modulation',
            description: 'hBD-2 induction by infection and IL-1β attracts mast cells and T cells, linking barrier damage to inflammation; dampened by Th2 cytokines.',
            summary: 'Describes hBD-2 as a bridge between innate defense and inflammatory signaling.',
            source: 'NIH/PMC (2021)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8571944/',
            category: 'Immunology'
        },
        {
            id: 'npy-genotype-obesity-2015',
            name: 'Neuropeptide Y Genotype, Central Obesity',
            description: 'NPY rs16147 C allele carriers experienced greater abdominal fat reduction on high-fat weight loss diets, revealing gene-nutrient interaction.',
            summary: 'Genetic profiling may optimize dietary strategies for central obesity.',
            source: 'American Journal of Clinical Nutrition (2015)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4564208/',
            category: 'Metabolic'
        },
        {
            id: 'npy-y1-knockout-1998',
            name: 'Obesity and Mild Hyperinsulinemia in NPY-Y1 Knockout',
            description: 'Y1 receptor deficient mice developed mild obesity with impaired insulin secretion and reduced energy expenditure, suggesting compensation by other NPY receptors.',
            summary: 'Clarifies Y1 receptor’s role in metabolic regulation beyond feeding drive.',
            source: 'PNAS (1998)',
            url: 'https://pnas.org',
            category: 'Metabolic'
        },
        {
            id: 'll37-structure-activity-2020',
            name: 'The Structure of the Antimicrobial Human Cathelicidin LL-37',
            description: 'Structure-based mutants (E16A, R23A) revealed oligomerization importance for LL-37 antimicrobial activity against MDR bacteria at physiological concentrations.',
            summary: 'Connects LL-37 structural motifs to function, guiding therapeutic design.',
            source: 'Nature Communications (2020)',
            url: 'https://nature.com',
            category: 'Anti-infective'
        },
        {
            id: 'kisspeptin-gnrh-control-2014',
            name: 'The Kisspeptin-GnRH Pathway in Human Reproductive Health',
            description: 'IV kisspeptin-10 increased LH pulse frequency in men; SC dosing increased gonadotropins in women, confirming kisspeptin’s potent GnRH stimulation.',
            summary: 'Establishes kisspeptin as master regulator of reproductive endocrine function.',
            source: 'NIH/PMC (2014)',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3957340/',
            category: 'Endocrinology'
        },
        {
            id: 'kisspeptin-female-reproduction-2021',
            name: 'Kisspeptin in Female Reproduction',
            description: 'Comprehensive review showing kisspeptin as strongest GnRH stimulant, coordinating LH secretory episodes across physiological states.',
            summary: 'Highlights therapeutic potential of kisspeptin modulation in fertility disorders.',
            source: 'Endocrine Reviews and Molecular Endocrinology (2021)',
            url: 'https://gremjournal.com',
            category: 'Endocrinology'
        },
        {
            id: 'anp-fragment-2021',
            name: 'Atrial Natriuretic Peptide31-67: A Novel Therapeutic',
            description: 'Explores ANP fragments (ANP99-126, ANP31-67) as compensatory responses to heart failure-induced volume overload and adrenergic activation.',
            summary: 'Investigates fragment-based therapeutics for heart failure management.',
            source: 'Frontiers in Pharmacology (2021)',
            url: 'https://frontiersin.org',
            category: 'Cardiovascular'
        },
        {
            id: 'gnrh-agonist-bicalutamide-2024',
            name: 'GnRH Antagonist Monotherapy Versus GnRH Agonist Plus Bicalutamide',
            description: 'Combined androgen blockade (CAB) with GnRH agonist and bicalutamide more effective than GnRH antagonist monotherapy in advanced HSPC. GnRH agonist SC injections combined with bicalutamide (80 mg/day) showed superior PSA progression-free survival.',
            summary: 'CAB offers superior treatment efficacy for high-risk metastatic prostate cancer compared to antagonist monotherapy alone.',
            source: 'Japanese Urological Association (2024)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Oncology'
        },
        {
            id: 'nafarelin-intranasal-2022',
            name: 'Nafarelin Acetate Nasal Solution - Pfizer Prescribing Info',
            description: 'Nafarelin (Synarel) intranasal 400-600 μg twice daily for central precocious puberty. Bioavailability 2.8% (range 1.2-5.6%) from intranasal route. Half-life ~3 hours. 80% plasma protein binding. Suppresses LH/FSH within 1 month to prepubertal ranges.',
            summary: 'Indicated for central precocious puberty in children.',
            source: 'Pfizer/FDA (2022)',
            url: 'https://labeling.pfizer.com',
            category: 'Endocrinology'
        },
        {
            id: 'pyy-appetite-satiety-2013',
            name: 'Role of Peptide YY(3–36) in Satiety Produced by Gastric Delivery',
            description: 'Intravenous infusion of PYY(3-36) reduced cumulative food intake by 58-62% at 1-4 hours post-infusion vs. vehicle (p<0.05). Y2 receptor blockade reversed PYY-induced anorexia. PYY(3-36) acts at Y2 receptors on arcuate nucleus neurons to mediate nutrient-induced satiety.',
            summary: 'Essential role in gut-brain appetite regulation pathway.',
            source: 'American Journal of Physiology (2013)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Metabolic'
        },
        {
            id: 'pyy-obesity-attenuated-2005',
            name: 'Attenuated Peptide YY Release in Obese Subjects',
            description: 'Intravenous infusion study showed obese subjects had significantly lower endogenous postprandial PYY levels compared to normal-weight controls. Obese subjects demonstrated reduced satiety signaling despite equivalent meal stimulus.',
            summary: 'Lower PYY concentrations predispose to obesity development and maintenance.',
            source: 'American Journal of Physiology - Endocrinology and Metabolism (2005)',
            url: 'https://academic.oup.com',
            category: 'Metabolic'
        },
        {
            id: 'abiraterone-degarelix-mhspc-2021',
            name: 'Abiraterone Acetate Versus Bicalutamide in Combination with GnRH Antagonist',
            description: 'Retrospective comparison of abiraterone acetate (1000 mg + prednisone 5 mg) with degarelix vs. bicalutamide with degarelix in 149 mHSPC patients. Abiraterone + degarelix showed significantly longer PSA-PFS (p<0.05) and improved overall survival.',
            summary: 'Superior androgen deprivation achieved with abiraterone combination. Degarelix (GnRH antagonist) SC injection component.',
            source: 'Nature (2021)',
            url: 'https://academic.oup.com',
            category: 'Oncology'
        },
        {
            id: 'degarelix-bicalutamide-phase2-2015',
            name: 'Phase II Study of Degarelix/Bicalutamide Combination for Prostate Cancer',
            description: '73 prostate cancer patients randomly assigned degarelix/bicalutamide combination or degarelix alone. Degarelix 240 mg initial SC dose, then 80 mg every 4 weeks. Bicalutamide 80 mg daily. Combination showed 90% PSA decline >90% at day 28 with greater sustained PSA reduction vs. monotherapy (p=0.382 at 12 weeks).',
            summary: 'Combination therapy demonstrated enhanced PSA response rates.',
            source: 'Journal of Clinical Oncology (2015)',
            url: 'https://ascopubs.org',
            category: 'Oncology'
        },
        {
            id: 'igf1-gene-transfer-aging-1998',
            name: 'Viral Mediated Expression of IGF-I Blocks Muscle Wasting',
            description: 'Viral IGF-1 expression in muscle increased mass 15% and strength 14% in young adult mice, and remarkably prevented aging-related changes with 27% strength increase in old mice compared to uninjected age-matched controls. Maintained fast-twitch fiber types. Activated satellite cell proliferation and differentiation.',
            summary: 'Demonstrates IGF-1 gene therapy potential for age-related sarcopenia.',
            source: 'PNAS (1998)',
            url: 'https://pnas.org',
            category: 'Musculoskeletal'
        },
        {
            id: 'igf1-muscle-repair-2013',
            name: 'The Therapeutic Potential of IGF-I in Skeletal Muscle Repair',
            description: 'Preclinical studies demonstrate IGF-1 increases muscle mass and strength, reduces degeneration, inhibits prolonged inflammatory response, and increases satellite cell proliferation. Therapeutic potential for age-related sarcopenia, motor neuron disease, cancer cachexia, heart failure, and ischemic muscle damage.',
            summary: 'Local injection demonstrated superior efficacy.',
            source: 'NIH/PMC (2013)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Musculoskeletal'
        },
        {
            id: 'ghrp2-growth-hormone-2025',
            name: 'GHRP-2 Guide: Benefits, Dosage, Stacking and Side Effects',
            description: 'Growth hormone-releasing peptide-2 (GHRP-2) stimulates pulsatile GH secretion via GHS-R1a receptor. Recommended SC injection doses 100-200 mcg 2-3 times daily. Enhances GH pulse amplitude to promote youthful GH patterns. Stacking with CJC-1295 maximizes anabolic effects.',
            summary: 'Enhanced muscle growth, fat loss, improved nutrient partitioning, and tissue repair.',
            source: 'Swolverine (2025)',
            url: 'https://swolverine.com',
            category: 'Growth Hormone'
        },
        {
            id: 'manp-hypertension-2021',
            name: 'A First In Human Study of MANP in Hypertension',
            description: 'First-in-human study of MANP (modified ANP analogue) SC injection in hypertensive patients. Single ascending doses (0.03-0.3 mg) were safe and well-tolerated. Dose-dependent BP reduction >30 mmHg systolic in 50% of highest-dose recipients. Increased plasma cGMP and urinary sodium excretion. Aldosterone suppression observed.',
            summary: 'Demonstrates clinical antihypertensive potential of designer ANP peptide.',
            source: 'NIH/PMC (2021)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Cardiovascular'
        },
        {
            id: 'manp-designer-anp-2021',
            name: 'Novel ANP (Atrial Natriuretic Peptide)-Based Therapy for Hypertension',
            description: 'MANP provides greater enzymatic resistance to degradation than native ANP. Targets GC-A receptors promoting cGMP elevation. Subcutaneous 7-day repeated dosing reduced blood pressure long-term in hypertensive rats vs. vehicle.',
            summary: 'First designer peptide targeting ANP pathway to achieve clinical BP reduction.',
            source: 'Circulation (2021)',
            url: 'https://ahajournals.org',
            category: 'Cardiovascular'
        },
        {
            id: 'secretin-pancreatic-testing-2025',
            name: 'Secretin Human for Injection (ChiRhoStim)',
            description: 'Secretin (27-amino acid peptide) IV stimulation of pancreatic secretions. Induces volume response of 2 mL/kg/hr with peak bicarbonate 80 mEq/L indicating normal pancreatic function. Useful for diagnosing exocrine pancreatic dysfunction.',
            summary: 'FDA-approved as ChiRhoStim for diagnostic use during MRCP imaging.',
            source: 'ChiRhoClin (2025)',
            url: 'https://chirhoclin.com',
            category: 'Diagnostic'
        },
        {
            id: 'porcine-secretin-2002',
            name: 'Porcine Secretin for Injection Label',
            description: 'Porcine secretin for IV injection aids diagnosis of exocrine pancreas dysfunction by stimulating pancreatic juice and bicarbonate secretion. Also used to diagnose gastrinoma via gastrin release stimulation.',
            summary: 'FDA approved for diagnostic indications requiring pancreatic stimulation.',
            source: 'FDA (2002)',
            url: 'https://accessdata.fda.gov',
            category: 'Diagnostic'
        },
        {
            id: 'motilin-gastric-motility-2010',
            name: 'The Roles of Motilin and Ghrelin in Gastrointestinal Motility',
            description: 'Motilin peptide hormone regulates interdigestive migrating contractions every 90-120 minutes during fasting. Motilin receptor agonists (macrolide antibiotics like erythromycin) stimulate phase III gastric contractions. Therapeutic potential for prokinetic effects to accelerate gastric emptying.',
            summary: 'Mitemcinal (GM-611) selective motilin receptor agonist shows promising results.',
            source: 'NIH/PMC (2010)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Gastrointestinal'
        },
        {
            id: 'erythromycin-gastroparesis-2021',
            name: 'New Developments in Prokinetic Therapy for Gastric Motility Disorders',
            description: 'Erythromycin macrolide 1.5-3 mg/kg IV infusion over 45 min every 6-8 hours or 125 mg oral twice daily stimulates fundic/antral contractions while inhibiting pyloric activity. Improves gastric emptying in gastroparesis but tachyphylaxis develops within 4 weeks.',
            summary: 'Dual effect on GI motility mechanisms.',
            source: 'Frontiers in Medicine (2021)',
            url: 'https://frontiersin.org',
            category: 'Gastrointestinal'
        },
        {
            id: 'ghrelin-gastroparesis-2010',
            name: 'The Roles of Motilin and Ghrelin in Gastrointestinal Motility',
            description: 'Intravenous ghrelin injection accelerates gastric emptying in idiopathic gastroparesis patients with deficient gastric innervation. Reverses postoperative gastric ileus in conscious animals.',
            summary: 'Potent gastrokinetic peptide hormone. RC-1139 ghrelin analog similarly effective as prokinetic agent.',
            source: 'NIH/PMC (2010)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Gastrointestinal'
        },
        {
            id: 'substance-p-pain-modulation-2012',
            name: 'Supraspinal Injection of Substance P Attenuates Allodynia',
            description: 'Intracerebral ventricular (i.c.v.) injection of substance P (3.5-7 μg/5 μl) showed dose-dependent inhibition of carrageenan-induced inflammatory pain allodynia and hyperalgesia in rats. NK1 receptor antagonist L-733,060 blocked SP analgesia. Opioid antagonist naloxone reduced SP analgesia by 50%, suggesting endogenous opioid involvement.',
            summary: 'Reveals supraspinal substance P analgesia mechanism via NK1 and opioid pathways.',
            source: 'Peptides (2012)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Pain Management'
        },
        {
            id: 'nk1-antagonist-postop-pain-2025',
            name: 'The Effect of Neurokinin-1 Receptor Antagonists on Postoperative Pain',
            description: 'Meta-analysis of randomized controlled trials. Preoperative single administration of NK-1 antagonists reduced postoperative pain significantly. Analgesic effect consistent with 9-12 hour half-life of NK1 inhibitors and preclinical substance P neurotransmission data.',
            summary: 'Peripheral and central NK-1 receptor antagonism effective.',
            source: 'Journal of Anesthesia (2025)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Pain Management'
        },
        {
            id: 'nk1-intrawound-intrathecal-2015',
            name: 'Role of Neurokinin Type 1 Receptor in Nociception',
            description: 'Intrawound (i.w.) or intrathecal (i.t.) injection of NK1 receptor antagonist L760735 in surgical pain model. Combined i.w. + i.t. administration most effective for antinociception. Reduced guarding scores 2 hours post-injection. Reduced substance P expression in dorsal horn spinal cord.',
            summary: 'Dual route administration maximizes NK1 antagonist efficacy.',
            source: 'Nature (2015)',
            url: 'https://nature.com',
            category: 'Pain Management'
        },
        {
            id: 'glucagon-hypoglycemia-fda',
            name: 'Glucagon for Injection - FDA Prescribing Information',
            description: 'Glucagon (29-amino acid peptide hormone) 1 mg IM/SC/IV for severe hypoglycemia reversal. Alternative intranasal 3 mg (single nostril). Causes hepatic glycogen release to elevate blood glucose within 15 minutes. Unconscious patients awaken within 15 minutes typically.',
            summary: 'May repeat in 15 minutes if no response.',
            source: 'FDA',
            url: 'https://accessdata.fda.gov',
            category: 'Emergency Medicine'
        },
        {
            id: 'calcitonin-vertebral-fractures-2004',
            name: 'Calcitonin: A Useful Old Friend',
            description: 'PROOF study (n=1255): 5-year daily intranasal salmon calcitonin 200 IU vs. placebo. 33-36% reduction in vertebral fracture risk (p<0.05). Lumbar spine BMD increased 1-1.5% vs. 0.2% placebo. Reduced bone resorption markers.',
            summary: 'Calcitonin available as SC 100 IU daily or nasal spray 200 IU daily.',
            source: 'NIH/PMC (2004)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Musculoskeletal'
        },
        {
            id: 'calcitonin-pagets-2023',
            name: 'Calcitonin - StatPearls NCBI',
            description: 'Salmon calcitonin SC/IM injection 50-100 IU daily reduces bone turnover markers (alkaline phosphatase, hydroxyproline) by ~50% in initial months.',
            summary: 'Second-line EMA-authorized and FDA-approved therapy when zoledronic acid not tolerated or surgery urgently needed.',
            source: 'NIH (2023)',
            url: 'https://ncbi.nlm.nih.gov',
            category: 'Musculoskeletal'
        },
        {
            id: 'calcitonin-acute-pain-2016',
            name: 'Calcitonin Acute Pain Management',
            description: 'Salmon calcitonin demonstrated significant analgesic efficacy in acute vertebral compression fracture pain.',
            summary: 'Recommended for acute pain management, then substituted with long-term therapy once pain resolves. Most potent form is salmon rather than human calcitonin.',
            source: 'Bone Health & Osteoporosis Foundation (2016)',
            url: 'https://bonehealthandosteoporosis.org',
            category: 'Pain Management'
        },
        {
            id: 'cosyntropin-adrenal-testing-2023',
            name: 'Adrenocorticotropic Hormone (Cosyntropin) Stimulation Test',
            description: 'Cosyntropin (synthetic ACTH) 250 mcg IV/IM stimulation test. Stimulates cortisol release from adrenal cortex within 30-60 minutes. Cortisol rise >9 mcg/dL from baseline indicates adequate adrenal reserve.',
            summary: 'Used to diagnose adrenal insufficiency in critically ill patients and non-critically ill population.',
            source: 'NCBI (2023)',
            url: 'https://ncbi.nlm.nih.gov',
            category: 'Diagnostic'
        },
        {
            id: 'acthar-gel-2024',
            name: 'Repository Corticotropin Injection (Acthar Gel)',
            description: 'Porcine-derived ACTH SC/IM depot injection. 75 U/m2 twice daily IM for 2 weeks (total 150 U/m2/day) for infantile spasms (West syndrome). 76% excellent effect on seizures, 17% good effect. Gradually tapered over 2 weeks to prevent adrenal insufficiency.',
            summary: 'Melanocortin peptide with steroid-dependent and independent effects.',
            source: 'FDA/Aetna (2024)',
            url: 'https://accessdata.fda.gov',
            category: 'Neuropsychiatry'
        },
        {
            id: 'glucagon-gi-imaging-2025',
            name: 'Glucagon Injection: MedlinePlus Drug Information',
            description: 'Glucagon 0.5-1 mg IM/IV reduces peristalsis and induces hypotonia of bowel/upper GI tract for imaging enhancement. Facilitates esophageal food bolus passage. Used during abdominal vascular procedures to reduce bowel movement artifact.',
            summary: 'Diagnostic aid during gastrointestinal X-ray and CT studies.',
            source: 'MedlinePlus (2025)',
            url: 'https://medlineplus.gov',
            category: 'Diagnostic'
        },
        {
            id: 'intranasal-glucagon-2025',
            name: 'Glucagon - StatPearls NCBI',
            description: 'Glucagon nasal powder 3 mg single nostril administration for severe hypoglycemia emergency. Convenient alternative to IM injection for emergency glucagon delivery.',
            summary: 'Same effectiveness as injectable formulation. May repeat dose in single nostril if inadequate response.',
            source: 'NIH (2025)',
            url: 'https://ncbi.nlm.nih.gov',
            category: 'Emergency Medicine'
        },
        {
            id: 'igf1-pi3k-akt-mtor-2019',
            name: 'The Role of IGF-1 Signaling Cascade in Muscle Protein',
            description: 'IGF-1 inversely regulates atrophy-induced genes via PI3K/akt/mTORC1 phosphorylation cascade in skeletal muscle. mTORC1 phosphorylation elevated post-absorptively in anabolic-resistant muscle (sarcopenia, cachexia).',
            summary: 'Therapeutic IGF-1 injection targets this pathway for muscle protein preservation.',
            source: 'Frontiers in Nutrition (2019)',
            url: 'https://frontiersin.org',
            category: 'Musculoskeletal'
        },
        {
            id: 'gh-doping-2012',
            name: 'Growth Hormone Doping in Sports: A Critical Review',
            description: 'Exogenous growth hormone SC injection pharmacokinetics: 22 min IV half-life. After SC injection peak plasma achieved 4 hours, half-life 3.8-4 hours, remains elevated ≥12 hours. Suppresses endogenous GH secretion for 12+ hours.',
            summary: 'Performance enhancement in sports banned by WADA.',
            source: 'Sports Medicine (2012)',
            url: 'https://academic.oup.com',
            category: 'Sports Medicine'
        },
        {
            id: 'np-bp-homeostasis-2022',
            name: 'Natriuretic Peptides and Blood Pressure Homeostasis',
            description: 'Hypertension characterized as relative ANP/BNP deficiency state. SC MANP injection 7-day repeated dosing induced sustained cGMP elevation and long-term BP reduction in hypertensive rats.',
            summary: 'NP therapy represents novel mechanism-based antihypertensive strategy targeting cGMP modulators.',
            source: 'Frontiers in Cardiovascular Medicine (2022)',
            url: 'https://frontiersin.org',
            category: 'Cardiovascular'
        },
        {
            id: 'felcisetrag-gastroparesis-2021',
            name: 'New Developments in Prokinetic Therapy for Gastric Motility',
            description: 'Novel 5-HT4 receptor agonist IV infusion significantly accelerated gastric emptying, small bowel transit, and colonic transit in gastroparesis patients with previously confirmed delayed emptying vs. placebo.',
            summary: 'Well-tolerated prokinetic peptide agent.',
            source: 'Frontiers in Medicine (2021)',
            url: 'https://frontiersin.org',
            category: 'Gastrointestinal'
        }
        ,
        {
            id: 'ipamorelin-selective-ghs-1998',
            name: 'Ipamorelin, the First Selective Growth Hormone Secretagogue',
            description: 'Pentapeptide ipamorelin demonstrated high GH-releasing potency and specificity for pituitary somatotrophs without affecting FSH, LH, PRL, or TSH. Did not release ACTH or cortisol even at 200-fold ED50 for GH release.',
            summary: 'First GHRP-receptor agonist with selectivity comparable to GHRH.',
            source: 'PubMed (1998)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Growth Hormone'
        },
        {
            id: 'tesamorelin-vat-reduction-hiv-2012',
            name: 'Reductions in Visceral Fat During Tesamorelin Therapy Associated with Metabolic Benefits',
            description: 'Meta-analysis of 599 HIV patients: 69% of tesamorelin-treated achieved ≥8% VAT reduction at week 26 vs. 33% placebo; 72% responded by week 52 with improved adiponectin, triglycerides, and preserved glucose homeostasis.',
            summary: 'Significant VAT reduction with metabolic benefits and low serious adverse events.',
            source: 'AIDS Map (2012)',
            url: 'https://aidsmap.com',
            category: 'Metabolic'
        },
        {
            id: 'tesamorelin-fat-quality-2021',
            name: 'Tesamorelin Improves Fat Quality Independent of Changes in Fat Quantity',
            description: 'CT imaging showed tesamorelin improved VAT and SAT density (Hounsfield Units) independent of quantity changes, associated with improved adiponectin, total cholesterol, and triglycerides.',
            summary: 'Supports improved adipose tissue function beyond fat reduction.',
            source: 'NIH/PMC (2021)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Metabolic'
        },
        {
            id: 'aod9604-obese-mice-2001',
            name: 'The Effects of Human GH and Its Lipolytic Fragment (AOD9604) on Obesity',
            description: 'Both hGH and AOD9604 reduced body weight gain in obese mice via increased fat oxidation and lipolysis. AOD9604 did not induce hyperglycemia or reduce insulin like hGH and does not compete for hGH receptor.',
            summary: 'Confirms hGH functions as pro-hormone with active lipolytic fragments.',
            source: 'Journal of Cellular Biochemistry (2001)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Metabolic'
        },
        {
            id: 'retatrutide-triple-agonist-2024',
            name: 'Triple Hormone Receptor Agonist Retatrutide for Metabolic Dysfunction and Obesity',
            description: 'Phase 2, 48-week study: 8 and 12 mg achieved 22.8% and 24.2% weight reduction. At 24 weeks: up to 86% achieved <5% liver fat vs. 0% placebo; associated with improved insulin sensitivity and lipid metabolism.',
            summary: 'Superior liver fat reduction vs. GLP-1 mono and tirzepatide dual agonist.',
            source: 'Nature (2024)',
            url: 'https://nature.com',
            category: 'Metabolic'
        },
        {
            id: 'motsc-diabetes-2025',
            name: 'Mitochondria-Derived Peptide MOTS-c Restores Mitochondrial Function in Type 2 Diabetes',
            description: 'Type 2 diabetic rats treated with MOTS-c showed decreased fasting glucose, improved homeostasis, and decreased cardiac hypertrophy with increased OXPHOS and mitochondrial biogenesis via AMPK activation.',
            summary: 'Improves mitochondrial function and glycemic control.',
            source: 'Frontiers in Physiology (2025)',
            url: 'https://frontiersin.org',
            category: 'Metabolic / Mitochondrial'
        },
        {
            id: 'motsc-exercise-2021',
            name: 'MOTS-c is an Exercise-Induced Mitochondrial-Encoded Regulator',
            description: 'Exercise induced an 11.9-fold increase in skeletal muscle MOTS-c with sustained elevation; significantly regulated glycolysis/PPP and amino acid metabolism post-exercise.',
            summary: 'Represents novel endocrine signaling from mitochondria.',
            source: 'Nature (2021)',
            url: 'https://nature.com',
            category: 'Metabolic / Mitochondrial'
        },
        {
            id: 'cjc1295-ghrhko-mice-2006',
            name: 'Once-Daily CJC-1295 Maintains Normal Body Composition in GHRHKO Mice',
            description: 'GHRH knockout mice treated with daily CJC-1295 normalized growth, body composition, and lean mass; induced somatotroph proliferation and increased GH mRNA 13–16 fold/day; long half-life via albumin conjugation.',
            summary: 'Albumin-binding GHRH analog restores growth parameters.',
            source: 'Journal of Physiology (2006)',
            url: 'https://journals.physiology.org',
            category: 'Growth Hormone'
        },
        {
            id: 'cjc1295-human-2006',
            name: 'Prolonged Stimulation of Growth Hormone and Insulin-Like Growth Factor-I',
            description: 'Subcutaneous CJC-1295 in healthy adults produced sustained, dose-dependent increases in GH and IGF-I with extended half-life vs. native GHRH.',
            summary: 'Safe and relatively well tolerated in PK studies.',
            source: 'PubMed (2006)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Growth Hormone'
        },
        {
            id: 'epitalon-telomerase-2025',
            name: 'Epitalon Increases Telomere Length in Human Cell Lines',
            description: 'Epitalon induced telomerase expression and increased telomere length; 4-day treatment produced dose-dependent extension from 2.4 kb to 4 kb at 0.5–1 μg/ml; cells surpassed Hayflick limit.',
            summary: 'Increases hTERT expression and telomere length in vitro.',
            source: 'NIH/PMC (2025)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Aging / Telomeres'
        },
        {
            id: 'epitalon-human-longevity-2025',
            name: 'Telomeres and Aging: Can Peptides Like Epitalon Slow the Clock?',
            description: 'Clinical trials in older adults reported telomere length increases; 12-year follow-up showed 28% lower all-cause and 50% lower cardiovascular mortality with epitalon treatment; animal studies showed lifespan extension.',
            summary: 'Suggests potential longevity benefits associated with telomere maintenance.',
            source: 'Livv Natural (2025)',
            url: 'https://livvnatural.com',
            category: 'Aging / Telomeres'
        },
        {
            id: 'thymalin-severe-covid-2021',
            name: 'Peptide Drug Thymalin Regulates Immune Status in Severe COVID-19',
            description: 'In 36 severe COVID-19 patients vs. 44 controls, Thymalin increased lymphocytes 92%, boosted T/B/NK-cells 2–4x, reduced IL-6 6.5-fold, D-dimer 1.5-fold, and LDH 1.9-fold with faster clinical improvement.',
            summary: 'Enhanced immune recovery and inflammatory marker reduction.',
            source: 'NIH/PMC (2021)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Immunology / COVID-19'
        },
        {
            id: 'ta1-covid19-2020',
            name: 'Thymalfasin (Thymosin Alpha 1) to Treat COVID-19 Infection',
            description: 'Hospitalized COVID-19 patients with lymphocytopenia received Ta1 1.6 mg SC daily for 1 week to enhance immune recognition and modulate T cell activity; trial evaluates improved recovery time and severity.',
            summary: 'Immunomodulatory peptide under clinical evaluation for COVID-19.',
            source: 'ClinicalTrials.gov (2020)',
            url: 'https://clinicaltrials.gov',
            category: 'Immunology / COVID-19'
        },
        {
            id: 'ghkcu-collagen-2025',
            name: 'GHK-Cu: The Regenerative Peptide for Skin, Hair, and Healing',
            description: 'GHK-Cu stimulates Type I and III collagen up to 70%, enhances fibroblast proliferation, keratinocyte migration, endothelial growth, and decorin synthesis, improving collagen cross-linking.',
            summary: 'Reverses age-related decline in collagen production.',
            source: 'Pulse & Remedy (2025)',
            url: 'https://pulseandremedy.com',
            category: 'Dermatology / Wound Healing'
        },
        {
            id: 'ghkcu-wound-acceleration-2025',
            name: 'GHK-Cu Peptide',
            description: 'Clinical evidence shows 30–50% reduction in healing time across wound types; post-procedure use reduces downtime and scarring by promoting organized collagen deposition.',
            summary: 'Accelerates wound healing and reduces scarring.',
            source: 'Skin & Healing Benefits',
            url: '#',
            category: 'Dermatology / Wound Healing'
        },
        {
            id: 'ghkcu-gene-expression-2015',
            name: 'GHK Peptide as a Natural Modulator of Multiple Cellular Pathways',
            description: 'GHK-Cu complex accelerates wound healing and skin repair, stimulating collagen synthesis and breakdown, resetting gene expression toward healthier dermal repair and reducing NF-κB up to 60%.',
            summary: 'Broad gene expression modulation supporting skin repair.',
            source: 'NIH/PMC (2015)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Dermatology / Wound Healing'
        },
        {
            id: 'tb500-wound-healing-1999',
            name: 'Thymosin Beta4 Accelerates Wound Healing',
            description: 'Topical or intraperitoneal TB-500 increased re-epithelialization 42% by day 4 and 61% by day 7 vs. saline; increased collagen deposition and angiogenesis; stimulated keratinocyte migration 2–3 fold.',
            summary: 'Demonstrates robust wound healing acceleration.',
            source: 'PubMed (1999)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Wound Healing'
        },
        {
            id: 'pt141-ed-nonresponders-2025',
            name: 'PT-141 for Men - Tower Urology',
            description: 'Phase II trials: 7.5+ mg PT-141 induced significant erectile responses; 34% reported better results vs. 9% placebo; effective in sildenafil failures and synergistic with sildenafil.',
            summary: 'Effective in non-responders and synergistic with PDE-5 inhibitors.',
            source: 'Tower Urology (2025)',
            url: 'https://towerurology.com',
            category: 'Sexual Health'
        },
        {
            id: 'pt141-diabetes-ed-2025',
            name: 'PT-141 (Bremelanotide) in Men and Women',
            description: 'Phase IIB trial in diabetes-induced ED showed significant IIEF score increases; melanocortin agonism addresses root dysfunction beyond blood flow.',
            summary: 'Alternative mechanism to PDE-5s with benefits in diabetes ED.',
            source: 'TC Compound (2025)',
            url: 'https://tccompound.com',
            category: 'Sexual Health'
        },
        {
            id: 'pt141-mechanism-synergy-2025',
            name: 'Novel Emerging Therapies for Erectile Dysfunction',
            description: 'PT-141 activates MC3R/MC4R increasing nitric oxide for erection; co-administration with sildenafil enhances response and may address psychological ED via brain-based arousal.',
            summary: 'Complementary central mechanism to PDE-5s.',
            source: 'Healthon (2025)',
            url: 'https://healthon.com',
            category: 'Sexual Health'
        },
        {
            id: 'dsip-insomnia-2008',
            name: 'Effects of Delta Sleep-Inducing Peptide on Sleep of Chronic Insomnia',
            description: 'Double-blind study (n=16) with IV DSIP 25 nmol/kg vs. placebo showed higher sleep efficiency and shorter latency; overall effects statistically significant but modest.',
            summary: 'Short-term DSIP unlikely major benefit for chronic insomnia.',
            source: 'Karger (2008)',
            url: 'https://karger.com',
            category: 'Sleep'
        },
        {
            id: 'dsip-gh-sws-2025',
            name: 'Evidence for a Role of DSIP in Slow-Wave Sleep',
            description: 'Sleep-deprived rats receiving DSIP showed increased GH release and SWS above baseline; anti-DSIP antiserum blocked effects, indicating physiological role.',
            summary: 'DSIP mediates sleep-related GH release and SWS induction.',
            source: 'PNAS (2025)',
            url: 'https://pnas.org',
            category: 'Sleep'
        },
        {
            id: 'melanotan1-uvb-synergy-2004',
            name: 'Melanotan-1: New Tanning Approach with UV-B Light',
            description: 'Phase 1 trials: 3/4 MT-1 subjects achieved significant tanning with 47% fewer sunburn cells; higher dose more effective; UV-B produced further enhancement with tanning maintained 3+ weeks.',
            summary: 'Synergistic tanning with UV-B and prolonged maintenance.',
            source: 'Innovations Report (2004)',
            url: 'https://innovations-report.com',
            category: 'Dermatology'
        },
        {
            id: 'melanotan1-jama-2004',
            name: 'Effects of a Superpotent Melanotropic Peptide in Combination',
            description: 'JAMA study: MT-1 safely combined with UV-B or sunlight with synergistic tanning; higher dose darkened more sites; tanning maintained 3+ weeks longer than sunlight-only; minimal transient adverse effects.',
            summary: 'Demonstrates safety and efficacy of MT-1 with UV.',
            source: 'JAMA (2004)',
            url: 'https://jamanetwork.com',
            category: 'Dermatology'
        },
        {
            id: 'melanotan-pigmentation-2025',
            name: 'Melanotan Peptides: Tan Faster & Even Your Skin Tone',
            description: 'Melanotan activates MC1R increasing tyrosinase activity and melanin production; boosts existing melanocyte function for darker tone and UV protection without creating new cells.',
            summary: 'Direct melanogenesis stimulation mechanism.',
            source: 'Age Well ATL (2025)',
            url: 'https://agewellatl.net',
            category: 'Dermatology'
        },
        {
            id: 'ss31-mito-ros-2014',
            name: 'Mitochondria-Targeted Antioxidant SS-31',
            description: 'SS-31 inhibits mitochondrial permeability transition, reduces ROS, prevents swelling, scavenges ROS, and inhibits lipid peroxidation with neuroprotective effects in ALS, Alzheimer’s, and ischemia models.',
            summary: 'Tetrapeptide shows broad mitochondrial protection.',
            source: 'NIH/PMC (2014)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Mitochondrial / Neuroprotection'
        },
        {
            id: 'ss31-retinal-2014',
            name: 'SS-31 Tetrapeptide Szeto-Schiller Neuroprotection',
            description: 'SS-31 prevented mitochondrial dysfunction-related retinal ganglion cell apoptosis in diabetic rats by promoting antiapoptotic proteins and inhibiting proapoptotic pathways.',
            summary: 'Prevents RGC apoptosis via mitochondrial restoration.',
            source: 'NIH/PMC (2014)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Mitochondrial / Ophthalmology'
        },
        {
            id: 'ss31-barth-2024',
            name: 'SS-31 Treatment Ameliorates Cardiac Mitochondrial Morphology',
            description: 'In tafazzin-deficient mice, long-term SS-31 restored cardiac mitochondrial morphology, reduced vacuolated mitochondria and autophagic vacuoles, normalized DRP1 phosphorylation, and improved bioenergetics.',
            summary: 'Improves mitochondrial structure and function in BTHS model.',
            source: 'Nature (2024)',
            url: 'https://nature.com',
            category: 'Mitochondrial / Cardiology'
        },
        {
            id: 'll37-atherosclerosis-2006',
            name: 'Involvement of the Antimicrobial Peptide LL-37 in Human Atherosclerosis',
            description: 'LL-37 produced in atherosclerotic lesions functions as immune modulator, activating adhesion molecules and chemokines that enhance innate immunity in lesion progression.',
            summary: 'Links LL-37 to inflammatory activation in vascular disease.',
            source: 'Circulation (2006)',
            url: 'https://ahajournals.org',
            category: 'Immunology / Cardiovascular'
        },
        {
            id: 'tb500-anti-aging-2024',
            name: 'MAA - TB-500 Medical Evidence',
            description: 'TB-500 demonstrates potential anti-aging effects via cellular-level tissue damage repair, accelerating wound healing and recovery with strong topical evidence.',
            summary: 'Highlights tissue repair potential relevant to aging.',
            source: 'Medical Anti-Aging (2024)',
            url: 'https://medicalantiaging.com',
            category: 'Wound Healing / Anti-aging'
        },
        {
            id: 'tb500-actin-binding',
            name: 'TB-500 Peptide',
            description: 'TB-500 binds G-actin monomers preventing polymerization into F-actin, promoting endothelial cell movement for angiogenesis, immune cell trafficking, keratinocyte and fibroblast migration, and tissue remodeling.',
            summary: 'Actin-binding mechanism facilitates repair and angiogenesis.',
            source: 'Healing & Flexibility',
            url: '#',
            category: 'Wound Healing'
        },
        {
            id: 'tb500-metabolite-2025',
            name: 'TB4 and TB-500 Peptide Therapy',
            description: 'TB-500 wound-healing activity may derive from metabolite Ac-LKKTE rather than parent Ac-LKKTETQ; metabolite more active in healing protocols, underscoring importance of peptide metabolism.',
            summary: 'Suggests active metabolite drives wound-healing efficacy.',
            source: 'Inner Body (2025)',
            url: 'https://innerbody.co',
            category: 'Wound Healing'
        },
        {
            id: 'igf1-lr3-satellite-cell-2025',
            name: 'IGF-1 LR3 Muscle Satellite Cell Activation',
            description: 'IGF-1 LR3 directly activates satellite cells (muscle stem cells), promoting rapid migration to damaged muscle areas and faster muscle fiber rebuilding. Satellite cell activation critical for hypertrophy and recovery.',
            summary: 'IGF-1 LR3 increases myofibril density, improving speed and quality of muscle regeneration. Enhanced protein synthesis markedly exceeds protein breakdown, maintaining lean mass during intense training and injury recovery periods.',
            source: 'Age Well ATL (2025)',
            url: 'https://agewellatl.net',
            category: 'Muscle Growth & Recovery'
        },
        {
            id: 'igf1-pi3k-akt-2000',
            name: 'IGF-I Muscle Protein Synthesis PI3K/Akt',
            description: 'IGF-1 activates PI3K/Akt pathway signaling in muscle cells, promoting protein synthesis while inhibiting proteolysis. Stimulates satellite cell proliferation and differentiation essential for muscle hypertrophy independent of systemic GH action.',
            summary: 'Functions as autocrine-paracrine growth factor in skeletal muscle tissue.',
            source: 'Endocrine Society (2000)',
            url: 'https://academic.oup.com',
            category: 'Muscle Growth & Recovery'
        },
        {
            id: 'igf1-lr3-glucose-uptake-2017',
            name: 'IGF-1 LR3 Glucose Uptake Nutrient Partitioning',
            description: 'IGF-1 LR3 enhances glucose transport into muscle cells via GLUT4 translocation, improving post-workout nutrient delivery and muscle fuel availability. Nutrient partitioning redirects dietary amino acids and carbohydrates toward muscle tissue rather than fat storage.',
            summary: 'Improved energy substrate availability supports faster muscle recovery and hypertrophy.',
            source: 'Journal of Clinical Investigation (2017)',
            url: 'https://jci.org',
            category: 'Muscle Growth & Recovery'
        },
        {
            id: 'igf1-lr3-anti-apoptotic-2017',
            name: 'IGF-1 LR3 Anti-Apoptotic Mitochondrial Protection',
            description: 'IGF-1 LR3 PI3K/Akt activation inhibits mitochondrial apoptosis pathways, protecting muscle tissue from programmed cell death. Maintains mitochondrial integrity during catabolic states (injury, caloric deficit, illness).',
            summary: 'Preserves cellular viability during stress conditions promoting tissue survival and regeneration.',
            source: 'Journal of Clinical Investigation (2017)',
            url: 'https://jci.org',
            category: 'Muscle Growth & Recovery'
        },
        {
            id: 'kisspeptin-fertility-restoration-2025',
            name: 'Kisspeptin Fertility Restoration Human Clinical',
            description: 'Exogenous kisspeptin administration in infertile patients with reduced endogenous kisspeptin expression restored fertility potential. Kisspeptins essential for proper HPG axis function and puberty onset.',
            summary: 'Clinical efficacy demonstrated in ovarian stimulation protocols and fertility restoration without side effects of conventional treatments.',
            source: 'NIH/PMC (2025)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Reproductive Health'
        },
        {
            id: 'kisspeptin54-ivf-2014',
            name: 'Kisspeptin-54 IVF Egg Maturation',
            description: 'Single subcutaneous injection of kisspeptin-54 induced egg maturation in 53 women undergoing IVF therapy. Fertilization of eggs occurred in 92% (49/53) of treated patients. Biochemical pregnancy rate 40% (21/53), clinical pregnancy rate 23% (12/53).',
            summary: '10 women achieved live births (8 singletons, 2 twin sets). Represents first human clinical demonstration of kisspeptin triggering successful ovulation.',
            source: 'Journal of Clinical Investigation (2014)',
            url: 'https://jci.org',
            category: 'Reproductive Health'
        },
        {
            id: 'kisspeptin-gnrh-pulsatile-2025',
            name: 'Kisspeptin GnRH Pulsatile Release',
            description: 'Subcutaneous bolus injection of kisspeptin-54 in healthy women during follicular phase caused pulsatile LH secretion mimicking natural GnRH patterns. Kisspeptin acts at KISS1R receptors on GnRH neurons stimulating hormone secretion.',
            summary: 'Therapeutic potential for women with insufficient GnRH secretion restoring pulsatile LH and fertility.',
            source: 'NIH/PMC (2025)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Reproductive Health'
        },
        {
            id: 'vip-intestinal-immune-2019',
            name: 'VIP Intestinal Immune Regulatory B Cell Function',
            description: 'Vasoactive intestinal peptide stabilizes IL-10 mRNA in regulatory B cells (Bregs), maintaining anti-inflammatory IL-10 expression. VIP forms complex with TTP protein blocking IL-10 mRNA decay. Serum VIP and IL-10 significantly lower in IgE+ ulcerative colitis patients than healthy controls.',
            summary: 'VIP administration efficiently inhibited experimental colitis in mice.',
            source: 'NIH/PMC (2019)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Immunology'
        },
        {
            id: 'vip-mast-cell-suppression-2019',
            name: 'VIP Mast Cell FcɛRI Suppression',
            description: 'VIP suppressed high-affinity IgE receptor (FcɛRI) expression on mast cells in concentration-dependent manner. VIP-treated mice showed markedly reduced FcɛRI expression vs. untreated controls. VIP suppression of FcɛRI mediated via IL-10, reducing allergic inflammatory responses.',
            summary: 'Frequency of mast cells significantly reduced in colon mucosa of VIP-treated mice.',
            source: 'NIH/PMC (2019)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Immunology'
        },
        {
            id: 'vip-autoimmune-thyroid-2020',
            name: 'VIP Autoimmune Thyroid Disease',
            description: 'VIP system dysfunction identified in autoimmune thyroid disease (AITD) patients. Reduced serum VIP levels and alterations in VIP signaling pathways in peripheral immune cells. VIP\'s anti-inflammatory effects reduced when dysregulated.',
            summary: 'Abnormal thyroid hormone levels exacerbate VIP axis alterations. VIP repletion represents therapeutic strategy for AITD immune dysregulation.',
            source: 'Nature (2020)',
            url: 'https://nature.com',
            category: 'Immunology'
        },
        {
            id: 'vip-innate-immune-2008',
            name: 'VIP Innate Immune Cell Modulation',
            description: 'VIP dramatically inhibits eosinophil migration and IL-16 production in vitro, subsequently reducing lymphocyte and monocyte chemotaxis into immune compartments. VIP exerts potent anti-inflammatory effects on innate immune cells.',
            summary: 'Therapeutic potential in parasitic/allergic responses and inflammatory diseases via VIP inhibition of chemokine cascades.',
            source: 'Cytokine (2008)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Immunology'
        },
        {
            id: 'kpv-tnf-alpha-colitis-2025',
            name: 'KPV TNF-Alpha Downregulation Colitis',
            description: 'KPV tripeptide (lysine-proline-valine) downregulates TNF-alpha production in intestinal epithelial and immune cells. Animal models: KPV accelerated mucosal healing and reduced pro-inflammatory cytokine levels. In vitro: KPV inhibited NF-κB and MAP kinase inflammatory signaling pathways.',
            summary: 'KPV without significant adverse effects unlike conventional UC drugs.',
            source: 'TRT MD (2025)',
            url: 'https://trtmd.com',
            category: 'Anti-inflammatory'
        },
        {
            id: 'kpv-oral-targeted-delivery-2017',
            name: 'KPV Oral Targeted Delivery Ulcerative Colitis',
            description: 'Hyaluronic acid-functionalized nanoparticles loaded with KPV peptide targeted colonic tissue in UC models. HA-KPV-NPs attached to inflamed mucosa via CD44 receptor on epithelial/immune cells. Nanoparticles penetrated deeply into inflamed tissue enabling intracellular KPV delivery.',
            summary: 'Reduced colitis incidence and promoted mucosal healing without systemic absorption.',
            source: 'NIH/PMC (2017)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Anti-inflammatory'
        },
        {
            id: 'kpv-inflammatory-bowel-2024',
            name: 'KPV Inflammatory Bowel Disease',
            description: 'KPV effectively ameliorates inflammatory responses of colonic epithelial and immune cells. Exerts anti-inflammatory function inside cells inactivating problematic inflammatory pathways. Acts without notable side effects compared to conventional IBD medications (TNF inhibitors, corticosteroids).',
            summary: 'Particularly beneficial for IBS, Crohn\'s disease, and colitis management.',
            source: 'Sky Health Wellness Clinic (2024)',
            url: 'https://drsobo.com',
            category: 'Anti-inflammatory'
        },
        {
            id: 'semax-bdnf-upregulation-2025',
            name: 'Semax BDNF Upregulation',
            description: 'Semax synthetic peptide derived from ACTH 4-10 rapidly increases brain-derived neurotrophic factor (BDNF) levels and TrkB receptor expression in hippocampus. Enhanced BDNF promotes neuroplasticity, learning, and long-term memory formation.',
            summary: 'Semax neuroprotective without affecting cortisol unlike full ACTH molecule.',
            source: 'Revolution Health (2025)',
            url: 'https://revolutionhealth.org',
            category: 'Neurology'
        },
        {
            id: 'semax-neurotransmitter-modulation-2025',
            name: 'Semax Neurotransmitter Modulation',
            description: 'Semax modulates dopamine, serotonin, and norepinephrine systems. Enhanced neurotransmitter release promotes motivation, mood stability, and mental drive. Improved cerebral blood flow and oxygenation in brain tissue.',
            summary: 'Reduces oxidative stress and suppresses pro-inflammatory cytokines in CNS. Neuroprotection against neuronal injury and trauma.',
            source: 'Enhanced Wellness NY (2025)',
            url: 'https://enhancedwellnessny.com',
            category: 'Neurology'
        },
        {
            id: 'semax-cognitive-adhd-2025',
            name: 'Semax Cognitive Performance ADHD',
            description: 'Semax particularly effective for ADHD symptoms, brain fog, and concentration difficulties. Sustains attention and executive function without crash associated with stimulants. Enhances both short-term and long-term memory recall, especially under high cognitive demand.',
            summary: 'Accelerates neural regeneration aiding recovery from traumatic brain injury or stroke.',
            source: 'Revolution Health (2025)',
            url: 'https://revolutionhealth.org',
            category: 'Neurology'
        },
        {
            id: 'semax-copper-neuroprotection-2022',
            name: 'Semax Copper-Induced Neuroprotection',
            description: 'Semax neuroprotective properties mitigate copper-induced oxidative stress and neurodegeneration. Pronounced nootropic, neuroprotective, and neurotrophic effects. Stimulates learning and memory formation in rodents and humans.',
            summary: 'Effects associated with modulation of neurotrophic factor expression protecting against age-related cognitive decline.',
            source: 'NIH/PMC (2022)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Neurology'
        },
        {
            id: 'selank-anxiolytic-gad-2025',
            name: 'Selank Anxiolytic GAD',
            description: '62-participant clinical trial comparing Selank to medazepam for generalized anxiety disorder (GAD). Selank showed effects similar to medazepam but with additional positive outcomes, particularly reducing neurasthenia symptoms. Severity and duration of GAD symptoms significantly decreased with Selank treatment.',
            summary: 'Psychostimulant effects observed without sedation.',
            source: 'Swolverine (2025)',
            url: 'https://swolverine.com',
            category: 'Neurology'
        },
        {
            id: 'selank-anxiety-benzodiazepine-2017',
            name: 'Selank Anxiety vs. Benzodiazepine',
            description: 'Institute of Molecular Genetics clinical trials: Selank anxiolytic effects comparable to low-dose diazepam without dependency or withdrawal symptoms. Reduced symptoms of generalized anxiety disorder (GAD) and post-traumatic stress disorder (PTSD) without impairing alertness.',
            summary: 'Long-term improvements in anxiety symptoms suggesting HPA axis balance restoration.',
            source: 'NIH/PMC (2017)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Neurology'
        },
        {
            id: 'selank-stress-anxiety-2017',
            name: 'Selank Stress-Induced Anxiety',
            description: 'Selank most effective in reducing elevated anxiety induced by medication administration. In unpredictable chronic mild stress conditions, diazepam + Selank combination most effective. Selank administration restored anxiety indicators toward baseline.',
            summary: 'Acts as both nootropic and adaptogen via dopamine/serotonin modulation and immunomodulation.',
            source: 'NIH/PMC (2017)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Neurology'
        },
        {
            id: 'oxytocin-social-conformity-2019',
            name: 'Oxytocin Social Conformity Learning',
            description: 'Intranasal oxytocin enhances social conformity to trusted individuals, particularly perceived experts. Oxytocin facilitates social learning from in-group members. Effects context-dependent: oxytocin increases conformity with reliable individuals but not unreliable ones.',
            summary: 'Oxytocin effects modulated by previous trust experience and attachment security.',
            source: 'NIH/PMC (2019)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Neurology'
        },
        {
            id: 'oxytocin-autism-social-2010',
            name: 'Oxytocin Autism Social Behavior',
            description: 'Intranasal oxytocin (24 IU) in 13 high-functioning autism subjects during simulated ball game. Oxytocin-treated patients exhibited stronger interactions with cooperative partners and reported enhanced trust/preference feelings. Oxytocin selectively increased gazing time on eyes (socially informative facial region).',
            summary: 'Improved social cue processing.',
            source: 'PNAS (2010)',
            url: 'https://pnas.org',
            category: 'Neurology'
        },
        {
            id: 'oxytocin-sexual-behavior-rats-2025',
            name: 'Oxytocin Sexual Behavior Male Rats',
            description: 'Intranasal oxytocin (10 mM) in sexually inactive male rats. By week 7 treatment: significantly decreased mount/intromission latencies (p<0.01). Increased mount frequency (p<0.01), intromission frequency (p=0.026), ejaculation frequency (p<0.01).',
            summary: 'Marked improvement in sexually inactive males suggesting oxytocin overcomes sexual motivation deficits.',
            source: 'Oxford Academic Press (2025)',
            url: 'https://academic.oup.com',
            category: 'Reproductive Health'
        },
        {
            id: 'oxytocin-reproductive-function-2025',
            name: 'Oxytocin Reproductive Function Enhancement',
            description: 'Oxytocin increased sperm motility rate, progressive motility, and sperm count (all p<0.001) in treated vs. control male rats. Significantly increased epididymal, seminal vesicle, and prostate weights.',
            summary: 'Enhanced peripheral reproductive organ function without affecting testis weight, indicating oxytocin improves accessory gland activity and epididymal epithelial cell function.',
            source: 'Oxford Academic Press (2025)',
            url: 'https://academic.oup.com',
            category: 'Reproductive Health'
        },
        {
            id: 'oxytocin-female-hsdd-2017',
            name: 'Oxytocin Female HSDD Sexual Function',
            description: 'Male Sexual Life Quality questionnaire improved significantly from baseline (-7.4±9.9) to 8.2±12 with female oxytocin therapy. Evaluation of female partner\'s performance by men improved significantly from 8.9±2.8 to 10.6±2.2 with oxytocin.',
            summary: 'Significant improvements in male sexual quality of life reported when female partner received intranasal oxytocin.',
            source: 'PubMed (2017)',
            url: 'https://pubmed.ncbi.nlm.nih.gov',
            category: 'Reproductive Health'
        },
        {
            id: 'oxytocin-avpd-sexual-wellbeing-2025',
            name: 'Oxytocin AVP-D Sexual Well-Being',
            description: 'Randomized, double-blind, placebo-controlled crossover trial investigating intranasal oxytocin (24 IU) effects on sexual well-being in arginine vasopressin deficiency patients. Part A: 7-day treatment with assessment of sexual well-being and intimacy. Part B: single-dose acute effects on sexual arousal, empathy, and hormonal responses.',
            summary: 'Addresses unrecognized oxytocin deficiency in psychosocial dysfunction.',
            source: 'ClinicalTrials.gov (2025)',
            url: 'https://clinicaltrials.gov',
            category: 'Reproductive Health'
        },
        {
            id: 'oxytocin-attachment-trust-2017',
            name: 'Oxytocin Attachment-Related Trust Security',
            description: 'Paradoxical oxytocin effects on trust modulated by attachment security. Securely attached individuals experienced trust-enhancing effects from oxytocin, while insecurely attached individuals showed opposite effects. Oxytocin increases positive attachment memories in secure individuals but negative memories in insecure individuals.',
            summary: 'Differential oxytocin response based on attachment history.',
            source: 'NIH/PMC (2017)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Neurology'
        },
        {
            id: 'nad-mitochondrial-stem-cell-2017',
            name: 'NAD+ Mitochondrial Function Stem Cell Rejuvenation',
            description: 'Treatment with NAD+ precursor nicotinamide riboside (NR) in aged mice rejuvenated muscle stem cells (MuSCs). NR induced mitochondrial unfolded protein response and prohibitin synthesis. Improved mitochondrial activity corrected age-related mitochondrial dysfunction.',
            summary: 'Enhanced MuSC self-renewal capacity preventing senescence and maintaining tissue regeneration.',
            source: 'American Journal of Managed Care (2017)',
            url: 'https://amj.amegroups.org',
            category: 'Anti-aging'
        },
        {
            id: 'nad-lifespan-extension-2016',
            name: 'NAD+ Lifespan Extension',
            description: 'Nicotinamide riboside (NR) supplementation extended lifespan in aged mice. NR treatment commenced late in life (24 months) still produced survival benefit. NAD+ repletion effect more generalizable across tissues (not organ-specific).',
            summary: 'Boosting NAD+ levels improves multiple aging hallmarks beyond single pathway.',
            source: 'Science (2016)',
            url: 'https://science.org',
            category: 'Anti-aging'
        },
        {
            id: 'nad-stem-cell-senescence-2016',
            name: 'NAD+ Muscle Stem Cell Senescence Prevention',
            description: 'NAD+ precursor NR prevented muscle stem cell senescence by regulating mitochondrial response. MuSCs from NR-treated aged mice showed enhanced myogenic colony formation. Reduced senescence markers (p16INK4A, p21) and DNA damage markers (γH2AX).',
            summary: 'SIRT1 required for NAD+ beneficial effects on mitochondrial function and MuSC senescence.',
            source: 'Science (2016)',
            url: 'https://science.org',
            category: 'Anti-aging'
        },
        {
            id: 'nad-metabolic-homeostasis-2020',
            name: 'NAD+ Metabolic Homeostasis Aging',
            description: 'Declining NAD+ levels linked to aging; treatment with NAD+ precursors (NR or NMN) restores NAD+ with anti-aging effects. NMN treatment mitigated age-related physiological phenotypes: improved insulin sensitivity, dysregulated mitochondrial function, impaired eye function, and decreased bone density.',
            summary: 'NAD+ repletion addresses fundamental aging hallmark.',
            source: 'NIH/PMC (2020)',
            url: 'https://pmc.ncbi.nlm.nih.gov',
            category: 'Anti-aging'
        }
    ];

    const studiesIndex = studies.map((study) => ({
        ...study,
        searchText: [
            study.name,
            study.description,
            study.summary,
            study.source,
            study.category
        ].filter(Boolean).join(' ').toLowerCase()
    }));

    window.peptideStudies = studiesIndex;

    let initialized = false;
    let listElement = null;
    let filterInput = null;
    let countElement = null;
    let activeFilter = '';

    function initializeStudiesPanel(options = {}) {
        if (initialized && options.deferRender !== false) {
            return;
        }

        listElement = document.getElementById('studies-list');
        filterInput = document.getElementById('studies-filter');
        countElement = document.getElementById('studies-count');
        const clearButton = document.getElementById('studies-clear-filter');

        if (!listElement || !filterInput || !countElement || !clearButton) {
            return;
        }

        if (!initialized) {
            filterInput.addEventListener('input', debounce((event) => {
                activeFilter = event.target.value.trim().toLowerCase();
                renderStudies();
            }, 200));

            clearButton.addEventListener('click', () => {
                filterInput.value = '';
                activeFilter = '';
                renderStudies();
                filterInput.focus();
            });

            initialized = true;
        }

        if (options.deferRender === false) {
            activeFilter = filterInput.value.trim().toLowerCase();
            renderStudies();
        }
    }

    function renderStudies() {
        if (!listElement || !countElement) return;

        const filter = activeFilter;
        const filtered = filter
            ? studiesIndex.filter(study => study.searchText.includes(filter))
            : studiesIndex;

        countElement.textContent = `${filtered.length} stud${filtered.length === 1 ? 'y' : 'ies'}`;

        if (filtered.length === 0) {
            listElement.innerHTML = `<div class="study-empty">No studies match "<strong>${escapeHtml(filter)}</strong>". Try another keyword.</div>`;
            return;
        }

        listElement.innerHTML = filtered.map(study => createStudyCard(study, filter)).join('');

        listElement.querySelectorAll('.study-card').forEach(card => {
            card.addEventListener('click', (event) => {
                const link = card.querySelector('a');
                if (event.target === link) {
                    return;
                }
                link?.focus();
            });
        });
    }

    function createStudyCard(study, filter) {
        const highlightedDescription = highlightMatches(study.description, filter);
        const highlightedSummary = study.summary ? highlightMatches(study.summary, filter) : '';
        const badge = study.category ? `<span class="study-badge">${escapeHtml(study.category)}</span>` : '';

        return `
            <article class="study-card" data-study-id="${study.id}">
                <div class="study-card-header">
                    ${badge}
                    <h3>${escapeHtml(study.name)}</h3>
                </div>
                <p class="study-description">${highlightedDescription}</p>
                ${highlightedSummary ? `<p class="study-summary">${highlightedSummary}</p>` : ''}
                <div class="study-footer">
                    <span class="study-source">${escapeHtml(study.source)}</span>
                    <a href="${study.url}" target="_blank" rel="noopener noreferrer">View study →</a>
                </div>
            </article>
        `;
    }

    function highlightMatches(text, filter) {
        if (!filter) {
            return escapeHtml(text);
        }
        const regex = new RegExp(`(${escapeRegExp(filter)})`, 'gi');
        return escapeHtml(text).replace(regex, '<mark>$1</mark>');
    }

    function showStudyDetails(studyId) {
        const study = studiesIndex.find(entry => entry.id === studyId);
        if (!study) return;

        if (typeof window.setStudiesPanelState === 'function') {
            window.setStudiesPanelState(true);
        }

        initializeStudiesPanel({ deferRender: false });
        renderStudies();

        const card = listElement?.querySelector(`[data-study-id="${studyId}"]`);
        if (card) {
            listElement.querySelectorAll('.study-card.highlight').forEach(el => el.classList.remove('highlight'));
            card.classList.add('highlight');
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 120);
        }
    }

    function escapeHtml(value) {
        return value
            ? value.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
            : '';
    }

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function debounce(fn, wait) {
        let timeout;
        return function debounced(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    document.addEventListener('DOMContentLoaded', () => initializeStudiesPanel({ deferRender: false }));

    window.initializeStudiesPanel = initializeStudiesPanel;
    window.showStudyDetails = showStudyDetails;
})();

