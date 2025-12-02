// Research Studies Search Functionality
(function() {
    const PUBMED_API_KEY = API_CONFIG.PUBMED_API_KEY;
    const SEMANTIC_API_KEY = API_CONFIG.SEMANTIC_SCHOLAR_API_KEY;
    const PUBMED_BASE_URL = API_CONFIG.PUBMED_BASE_URL;
    const SEMANTIC_BASE_URL = API_CONFIG.SEMANTIC_BASE_URL;

    const peptideDatabase = {
        '5-amino-1mq': ['5-Amino-1MQ', 'NNMT Inhibitor', '5-Amino-1-methylquinolinium'],
        'aod9604': ['AOD', 'AOD9604', 'AOD-9604', 'Advanced Obesity Drug'],
        'ara-290': ['ARA-290', 'Cibinetide', 'Erythropoietin-derived peptide'],
        'bpc157': ['BPC', 'BPC-157', 'Body Protecting Compound'],
        'bremelanotide': ['PT-141', 'Bremelanotide', 'PTMS', 'Melanotan metabolite'],
        'cjc1295': ['CJC1295', 'CJC-1295', 'GHRH Analog', 'Growth Hormone Releasing Hormone'],
        'cjc1295-ipamorelin': ['CJC1295/Ipamorelin', 'CJC-1295/Ipamorelin', 'GHRH/GHRP combo', 'Growth Hormone Stack'],
        'dihexa': ['Dihexa', 'HGF mimetic', 'Cognitive enhancer'],
        'dsip': ['DSIP', 'Delta Sleep Peptide', 'Sleep-inducing peptide', 'Delta Sleep-Inducing Peptide'],
        'epithalon': ['Epithalon', 'Epitalon', 'Telomere peptide', 'Telomerase Activator'],
        'exenatide': ['Exenatide', 'Byetta', 'Bydureon', 'GLP-1 analog'],
        'ghk-cu': ['GHK-Cu', 'GHK', 'Copper peptide', 'Skin regenerative peptide'],
        'glutathione': ['GSH', 'Glutathione', 'L-Glutathione', 'Master Antioxidant'],
        'hexarelin': ['Hexarelin', 'Examorelin', 'GHRP-6 analog'],
        'igf1-lr3': ['IGF-1 LR3', 'IGF1LR3', 'Long R3 IGF-1', 'Long R3 Insulin-like Growth Factor-1'],
        'kisspeptin': ['Kisspeptin', 'Kisspeptin-10', 'Kp-10', 'Metastin', 'GnRH Secretagogue'],
        'kpv': ['KPV', 'Lys-Pro-Val', 'Lysine-Proline-Valine', 'Anti-inflammatory peptide'],
        'll-37': ['LL-37', 'Cathelicidin', 'Antimicrobial peptide', 'Human Cathelicidin'],
        'melanotan-ii': ['MT-II', 'Melanotan', 'Melanotan II', 'Tanning peptide', 'Melanocortin Agonist'],
        'mk-677': ['MK677', 'MK-677', 'Ibutamoren', 'Oral GHS', 'Growth hormone releaser'],
        'mots-c': ['MOTS-C', 'Mitochondrial peptide', 'Exercise mimetic', 'Mitochondrial ORF'],
        'nad': ['NAD+', 'NAD', 'Nicotinamide adenine dinucleotide', 'Nicotinamide Adenine Dinucleotide'],
        'retatrutide': ['Retatrutide', 'LY3437943', 'Triple agonist', 'GLP-1/GIP/Glucagon'],
        'selank': ['Selank', 'TP-7', 'Anxiolytic peptide', 'Russian peptide'],
        'semaglutide': ['Semaglutide', 'Ozempic', 'Wegovy', 'Rybelsus', 'GLP-1 agonist', 'GLP-1 Analog'],
        'semax': ['Semax', 'Nootropic peptide', 'Cognitive enhancer', 'Met-Glu-His-Phe-Pro-Gly-Pro'],
        'sermorelin': ['Sermorelin', 'Sermorelin Acetate', 'GHRH 1-29', 'Growth hormone releaser'],
        'ss-31': ['SS-31', 'Elamipretide', 'MTP-131', 'Mitochondrial peptide', 'Mitochondrial Protective Peptide'],
        'tb-500': ['TB-500', 'TB500', 'Thymosin Beta-4', 'TB4', 'Healing peptide'],
        'tesofensine': ['Tesofensine', 'NS2330', 'Weight loss compound', 'Triple Monoamine Reuptake Inhibitor'],
        'tta': ['TTA', 'TTA-A', 'Tetradecyl', 'Tetradecyl Thioacetic Acid', 'Modified fatty acid'],
        'thymosin-alpha-1': ['TA1', 'Thymalfasin', 'Thymosin α1', 'Thymosin Alpha-1', 'Immune peptide'],
        'thymulin': ['Thymulin', 'FTS', 'Thymic hormone', 'Zinc thymulin', 'Facteur Thymique Serique'],
        'tirzepatide': ['Tirzepatide', 'Mounjaro', 'Dual agonist', 'GIP/GLP-1', 'Dual GIP/GLP-1 Agonist']
    };

    const peptides = Object.values(peptideDatabase).flat();
    
    const researchKeywords = [
        'human model', 'human study', 'human trial', 'tissue recovery', 'metabolism', 
        'wound healing', 'anti-inflammatory', 'muscle repair', 'gut healing', 
        'neuroprotection', 'anxiolytic', 'nootropic', 'telomere', 'mitochondria', 
        'antioxidant', 'antimicrobial', 'immune boost', 'fat loss', 'muscle growth', 
        'hormone release', 'sleep induction', 'erectile dysfunction', 'skin rejuvenation', 
        'in vivo', 'in vitro', 'clinical trial', 'animal study', 'randomized controlled trial',
        'double-blind', 'placebo-controlled', 'meta-analysis', 'systematic review',
        'tendon healing', 'ligament repair', 'joint health', 'cartilage regeneration',
        'bone healing', 'nerve regeneration', 'brain health', 'cognitive function',
        'longevity', 'aging', 'inflammation', 'autophagy', 'stem cells'
    ];
    
    let currentPage = 1;
    let lastDetectedPeptides = [];
    let lastSearchResults = [];
    let currentStudy = null;

    function expandPeptideNames(query) {
        const queryLower = query.toLowerCase();
        const detectedPeptides = new Set();
        lastDetectedPeptides = [];
        
        for (const [key, synonyms] of Object.entries(peptideDatabase)) {
            for (const synonym of synonyms) {
                if (queryLower.includes(synonym.toLowerCase())) {
                    detectedPeptides.add(key);
                    lastDetectedPeptides.push({key, synonyms});
                    break;
                }
            }
        }
        
        if (detectedPeptides.size === 0) {
            return query;
        }
        
        let expandedQuery = query;
        for (const peptideKey of detectedPeptides) {
            const synonyms = peptideDatabase[peptideKey];
            const orClause = synonyms.map(s => `"${s}"`).join(' OR ');
            expandedQuery += ` AND (${orClause})`;
        }
        
        return expandedQuery;
    }

    function toCommonPaper(p, source) {
        let date = null;
        if (p.publicationDate) {
            date = new Date(p.publicationDate);
        } else if (p.pubdate) {
            date = new Date(p.pubdate);
        } else if (p.year) {
            date = new Date(p.year, 0, 1);
        }
        return {
            title: p.title || 'No title',
            authors: p.authors ? p.authors.map(a => a.name) : [],
            year: p.year || (p.pubdate ? parseInt(p.pubdate.split(' ')[0]) : null),
            abstract: p.abstract || null,
            citationCount: p.citationCount !== undefined ? p.citationCount : null,
            url: source === 'semantic' ? (p.url || `https://www.semanticscholar.org/paper/${p.paperId}`) : `https://pubmed.ncbi.nlm.nih.gov/${p.uid}/`,
            doi: source === 'semantic' ? p.externalIds?.DOI : p.articleids?.find(a => a.idtype === 'doi')?.value,
            pmid: source === 'semantic' ? p.externalIds?.PubMed : p.uid,
            journal: p.venue || p.fulljournalname || p.source || 'Unknown',
            source: source,
            date: date
        };
    }

    async function performSearch() {
        const queryValue = document.getElementById('research-query').value.trim();
        const maxResults = parseInt(document.getElementById('research-max-results').value);
        const sortOrder = document.getElementById('research-sort').value;
        const yearFrom = document.getElementById('research-year-from').value;
        const yearTo = document.getElementById('research-year-to').value;
        const primaryTermsInput = document.getElementById('research-primary-terms').value;
        const secondaryTermsInput = document.getElementById('research-secondary-terms').value;

        const primaryTerms = primaryTermsInput ? primaryTermsInput.split(',').map(t => t.trim()).filter(t => t) : [];
        const secondaryTerms = secondaryTermsInput ? secondaryTermsInput.split(',').map(t => t.trim()).filter(t => t) : [];

        if (!queryValue) return;

        const expandedQuery = expandPeptideNames(queryValue);
        const searchBtn = document.getElementById('research-search-btn');
        const resultsContainer = document.getElementById('research-results');
        
        searchBtn.disabled = true;
        searchBtn.textContent = 'Searching...';
        
        let searchMessage = 'Searching databases...';
        if (expandedQuery !== queryValue) {
            searchMessage += '<br><small style="color: var(--text-accent); margin-top: 10px; display: block;">Including alternative peptide names in search</small>';
        }
        
        resultsContainer.innerHTML = `
            <div class="research-loading">
                <div class="research-spinner"></div>
                <p>${searchMessage}</p>
            </div>
        `;

        const offset = (currentPage - 1) * maxResults;

        try {
            let yearFilterPubMed = '';
            let yearFilterSemantic = '';
            if (yearFrom || yearTo) {
                const from = yearFrom || '1900';
                const to = yearTo || new Date().getFullYear();
                yearFilterPubMed = ` AND ${from}:${to}[dp]`;
                yearFilterSemantic = `&year=${yearFrom ? yearFrom : ''}-${yearTo ? yearTo : ''}`;
            }

            let pubmedSort = sortOrder === 'citations' ? 'relevance' : sortOrder;
            let semanticSort = '';
            if (sortOrder === 'relevance') semanticSort = 'relevance';
            else if (sortOrder === 'pub+date') semanticSort = 'publication-date';
            else if (sortOrder === 'citations') semanticSort = 'papers-cited';

            let pubmedQuery = expandedQuery + yearFilterPubMed;
            if (primaryTerms.length > 0) {
                const primaryPart = primaryTerms.map(t => `"${t}"[ti]`).join(' OR ');
                pubmedQuery += ` AND (${primaryPart})`;
            }
            if (secondaryTerms.length > 0) {
                const secondaryPart = secondaryTerms.map(t => `"${t}"`).join(' OR ');
                pubmedQuery += ` AND (${secondaryPart})`;
            }

            let semanticQuery = queryValue;
            if (secondaryTerms.length > 0) {
                const secondaryPart = secondaryTerms.map(t => `"${t}"`).join(' OR ');
                semanticQuery += ` AND (${secondaryPart})`;
            }
            const encodedSemanticQuery = encodeURIComponent(semanticQuery);

            const pubmedCountUrl = `${PUBMED_BASE_URL}esearch.fcgi?db=pubmed&term=${encodeURIComponent(pubmedQuery)}&retmax=0&retmode=json&api_key=${PUBMED_API_KEY}`;
            const pubmedCountResponse = await fetch(pubmedCountUrl);
            const pubmedCountData = await pubmedCountResponse.json();
            let pubmedTotal = pubmedCountData.esearchresult?.count || 0;

            let semanticTotal = 1000;
            try {
                const semanticCountUrl = `${SEMANTIC_BASE_URL}paper/search?query=${encodedSemanticQuery}&limit=1&fields=title${yearFilterSemantic}`;
                const semanticCountResponse = await fetch(semanticCountUrl, {
                    headers: { 'x-api-key': SEMANTIC_API_KEY }
                });
                if (semanticCountResponse.ok) {
                    const semanticCountData = await semanticCountResponse.json();
                    semanticTotal = semanticCountData.total || 0;
                }
            } catch (e) {
                console.warn('Could not get Semantic Scholar count:', e);
            }

            const MAX_FETCH = 1000;
            const fetchLimit = Math.min(pubmedTotal, MAX_FETCH);
            
            const pubmedFullUrl = `${PUBMED_BASE_URL}esearch.fcgi?db=pubmed&term=${encodeURIComponent(pubmedQuery)}&retmax=${fetchLimit}&retstart=0&retmode=json&api_key=${PUBMED_API_KEY}`;
            const pubmedFullResponse = await fetch(pubmedFullUrl);
            const pubmedFullData = await pubmedFullResponse.json();
            const pubmedIds = pubmedFullData.esearchresult?.idlist || [];

            let pubmedPapers = [];
            if (pubmedIds.length > 0) {
                const pubmedSummaryUrl = `${PUBMED_BASE_URL}esummary.fcgi?db=pubmed&id=${pubmedIds.join(',')}&retmode=json&api_key=${PUBMED_API_KEY}`;
                const pubmedSummaryResponse = await fetch(pubmedSummaryUrl);
                const pubmedSummaryData = await pubmedSummaryResponse.json();
                pubmedPapers = pubmedIds.map(id => pubmedSummaryData.result[id]).filter(Boolean);
            }

            const semanticFetchLimit = Math.min(semanticTotal, MAX_FETCH);
            let semanticPapers = [];
            
            try {
                const semanticFullUrl = `${SEMANTIC_BASE_URL}paper/search?query=${encodedSemanticQuery}&limit=${semanticFetchLimit}&offset=0&fields=title,authors,year,citationCount,abstract,url,publicationDate,externalIds,venue${yearFilterSemantic}`;
                const semanticFullResponse = await fetch(semanticFullUrl, {
                    headers: { 'x-api-key': SEMANTIC_API_KEY }
                });
                if (semanticFullResponse.ok) {
                    const semanticFullData = await semanticFullResponse.json();
                    semanticPapers = semanticFullData.data || [];

                    if (primaryTerms.length > 0) {
                        semanticPapers = semanticPapers.filter(p => primaryTerms.some(term => p.title.toLowerCase().includes(term.toLowerCase())));
                    }
                }
            } catch (e) {
                console.warn('Semantic Scholar fetch failed:', e);
            }

            const allPapers = [
                ...semanticPapers.map(p => toCommonPaper(p, 'semantic')),
                ...pubmedPapers.map(p => toCommonPaper(p, 'pubmed'))
            ];

            const paperMap = new Map();
            for (let paper of allPapers) {
                let key = null;
                if (paper.doi) key = 'doi:' + paper.doi.toLowerCase();
                else if (paper.pmid) key = 'pmid:' + paper.pmid;
                else key = paper.title.toLowerCase() + '|' + paper.authors.sort().join('|').toLowerCase();

                if (paperMap.has(key)) {
                    const existing = paperMap.get(key);
                    if (!existing.abstract && paper.abstract) existing.abstract = paper.abstract;
                    if (existing.citationCount === null && paper.citationCount !== null) existing.citationCount = paper.citationCount;
                    if (existing.source !== paper.source) existing.source = 'both';
                    if (!existing.journal && paper.journal) existing.journal = paper.journal;
                    if (!existing.url && paper.url) existing.url = paper.url;
                    if (!existing.year && paper.year) existing.year = paper.year;
                    if (!existing.date && paper.date) existing.date = paper.date;
                } else {
                    paperMap.set(key, paper);
                }
            }
            let uniquePapers = Array.from(paperMap.values());

            const papersNeedingCitation = uniquePapers.filter(p => p.citationCount === null && p.pmid);
            if (papersNeedingCitation.length > 0) {
                const promises = papersNeedingCitation.map(async (p) => {
                    try {
                        const res = await fetch(`${SEMANTIC_BASE_URL}paper/PMID:${p.pmid}?fields=citationCount`, {
                            headers: { 'x-api-key': SEMANTIC_API_KEY }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            p.citationCount = data.citationCount !== undefined ? data.citationCount : null;
                        }
                    } catch {}
                });
                await Promise.all(promises);
            }

            const papersNeedingAbstract = uniquePapers.filter(p => !p.abstract && p.pmid);
            if (papersNeedingAbstract.length > 0) {
                const ids = papersNeedingAbstract.map(p => p.pmid).join(',');
                const res = await fetch(`${PUBMED_BASE_URL}efetch.fcgi?db=pubmed&id=${ids}&rettype=abstract&retmode=text&api_key=${PUBMED_API_KEY}`);
                if (res.ok) {
                    const text = await res.text();
                    const blocks = text.split(/\n{3,}/);
                    blocks.forEach((block, i) => {
                        if (i >= papersNeedingAbstract.length) return;
                        const abstractMatch = block.match(/(?:Abstract|ABSTRACT)\s*\n([\s\S]*?)(?=\n\n[A-Z ]+:|$)/i);
                        if (abstractMatch) {
                            papersNeedingAbstract[i].abstract = abstractMatch[1].trim().replace(/\s+/g, ' ');
                        }
                    });
                }
            }

            const queryLower = expandedQuery.toLowerCase();
            const searchedPeptides = peptides.filter(p => queryLower.includes(p.toLowerCase()));
            if (searchedPeptides.length > 0) {
                uniquePapers = uniquePapers.filter(p => {
                    const text = (p.title + ' ' + (p.abstract || '')).toLowerCase();
                    return searchedPeptides.some(sp => text.includes(sp.toLowerCase()));
                });
            }

            if (sortOrder === 'likes') {
                await fetchAndSortByLikes(uniquePapers);
            } else if (sortOrder === 'pub+date') {
                uniquePapers.sort((a, b) => (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0));
            } else if (sortOrder === 'citations') {
                uniquePapers.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
            }

            lastSearchResults = uniquePapers;
            const total = uniquePapers.length;
            const paginatedPapers = uniquePapers.slice(offset, offset + maxResults);
            await displayResults(paginatedPapers, total);

        } catch (error) {
            console.error('Error:', error);
            resultsContainer.innerHTML = `
                <div class="research-error">
                    <strong>Error:</strong> ${error.message}
                </div>
            `;
        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = 'Search';
        }
    }

    async function displayResults(papers, total) {
        const resultsContainer = document.getElementById('research-results');
        const maxResults = parseInt(document.getElementById('research-max-results').value);
        const totalPages = Math.ceil(total / maxResults);

        if (papers.length === 0) {
            resultsContainer.innerHTML = `
                <div class="research-no-results">
                    <div class="research-no-results-icon">🔍</div>
                    <h3>No results found</h3>
                    <p>Try different search terms or adjust your filters</p>
                </div>
            `;
            return;
        }

        const studyIds = papers.map(p => getStudyIdentifier(p)).filter(Boolean);
        let interactionsData = {};
        
        if (studyIds.length > 0) {
            try {
                const response = await fetch('/api/study-interactions-bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ study_ids: studyIds })
                });
                if (response.ok) {
                    interactionsData = await response.json();
                }
            } catch (error) {
                console.warn('Failed to fetch interaction data:', error);
            }
        }

        const rangeStart = (currentPage - 1) * maxResults + 1;
        const rangeEnd = rangeStart + papers.length - 1;

        let html = `
            <div class="research-results-header">
                <div class="research-results-count">Showing ${rangeStart}-${rangeEnd} of ${total} results</div>
            </div>
        `;

        if (lastDetectedPeptides.length > 0) {
            html += '<div class="research-enhanced-notice">';
            html += '<strong>🔍 Search Enhanced:</strong> Including alternative names for: ';
            html += lastDetectedPeptides.map(p => {
                const names = p.synonyms.slice(0, 3).join(', ') + (p.synonyms.length > 3 ? ` +${p.synonyms.length - 3} more` : '');
                return `<span>${names}</span>`;
            }).join(' | ');
            html += '</div>';
        }

        papers.forEach((paper, index) => {
            const authorsStr = paper.authors.slice(0, 5).join(', ') + (paper.authors.length > 5 ? ' et al.' : '');
            const abstractStr = paper.abstract ? paper.abstract.substring(0, 300) + (paper.abstract.length > 300 ? '...' : '') : 'No abstract available.';
            const paperIndex = ((currentPage - 1) * maxResults) + index;
            
            const studyId = getStudyIdentifier(paper);
            const interactions = studyId ? interactionsData[studyId] : null;
            const upvotes = interactions?.upvotes || 0;
            const downvotes = interactions?.downvotes || 0;
            const commentCount = interactions?.comments || 0;
            
            html += `
                <div class="research-article" data-paper-index="${paperIndex}">
                    <div class="research-article-title" data-paper-index="${paperIndex}">${paper.title}</div>
                    <div class="research-article-interactions">
                        <span class="interaction-item"><span class="interaction-icon">👍</span> ${upvotes}</span>
                        <span class="interaction-item"><span class="interaction-icon">👎</span> ${downvotes}</span>
                        <span class="interaction-item"><span class="interaction-icon">💬</span> ${commentCount}</span>
                    </div>
                    <div class="research-article-authors">${authorsStr || 'Unknown authors'}</div>
                    <div class="research-article-journal">${paper.journal}</div>
                    <div class="research-article-meta">
                        <span class="research-meta-item"><strong>Year:</strong> ${paper.year || 'N/A'}</span>
                        <span class="research-meta-item"><strong>Citations:</strong> ${paper.citationCount !== null ? paper.citationCount : 'N/A'}</span>
                        <span class="research-meta-item"><strong>Source:</strong> ${paper.source.toUpperCase()}</span>
                    </div>
                    <div class="research-article-abstract">${abstractStr}</div>
                </div>
            `;
        });

        if (totalPages > 1) {
            html += buildPagination(currentPage, totalPages);
        }

        resultsContainer.innerHTML = html;

        const articleTitles = document.querySelectorAll('.research-article-title');
        articleTitles.forEach(title => {
            title.addEventListener('click', () => {
                const paperIndex = parseInt(title.dataset.paperIndex);
                const paper = lastSearchResults[paperIndex];
                if (paper) {
                    openStudyModal(paper);
                }
            });
        });

        const pageBtns = document.querySelectorAll('.research-page-btn');
        pageBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                currentPage = parseInt(btn.dataset.page);
                const maxResults = parseInt(document.getElementById('research-max-results').value);
                const offset = (currentPage - 1) * maxResults;
                const paginatedPapers = lastSearchResults.slice(offset, offset + maxResults);
                await displayResults(paginatedPapers, lastSearchResults.length);
                document.getElementById('research-results').scrollTop = 0;
            });
        });
    }

    function buildPagination(currentPage, totalPages) {
        let html = '<div class="research-pagination">';
        if (currentPage > 1) {
            html += `<button class="research-page-btn" data-page="1">&lt;&lt;</button>`;
            html += `<button class="research-page-btn" data-page="${currentPage - 1}">&lt;</button>`;
        }
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, currentPage + 2);
        if (start > 1) html += '<span>...</span>';
        for (let i = start; i <= end; i++) {
            html += `<button class="research-page-btn${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
        }
        if (end < totalPages) html += '<span>...</span>';
        if (currentPage < totalPages) {
            html += `<button class="research-page-btn" data-page="${currentPage + 1}">&gt;</button>`;
            html += `<button class="research-page-btn" data-page="${totalPages}">&gt;&gt;</button>`;
        }
        html += '</div>';
        return html;
    }

    function toggleFilters() {
        const filtersContent = document.getElementById('research-filters-content');
        const toggleBtn = document.getElementById('research-filters-toggle');
        
        if (filtersContent.style.display === 'none') {
            filtersContent.style.display = 'grid';
            toggleBtn.textContent = '▼ Hide Filters';
        } else {
            filtersContent.style.display = 'none';
            toggleBtn.textContent = '▶ Show Filters';
        }
    }

    function getStudyIdentifier(study) {
        return study.doi || study.pmid || null;
    }

    async function fetchAndSortByLikes(papers) {
        const studyIds = papers.map(p => getStudyIdentifier(p)).filter(Boolean);
        
        if (studyIds.length === 0) {
            return;
        }
        
        try {
            const response = await fetch('/api/study-interactions-bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ study_ids: studyIds })
            });
            
            if (response.ok) {
                const interactionsData = await response.json();
                
                papers.forEach(paper => {
                    const studyId = getStudyIdentifier(paper);
                    if (studyId && interactionsData[studyId]) {
                        const interactions = interactionsData[studyId];
                        paper.netLikes = (interactions.upvotes || 0) - (interactions.downvotes || 0);
                    } else {
                        paper.netLikes = 0;
                    }
                });
                
                papers.sort((a, b) => (b.netLikes || 0) - (a.netLikes || 0));
            }
        } catch (error) {
            console.warn('Failed to fetch interactions for sorting:', error);
        }
    }

    async function openStudyModal(study) {
        currentStudy = study;
        const modal = document.getElementById('study-modal');
        const modalTitle = document.querySelector('.study-modal-title');
        const modalAuthors = document.querySelector('.study-modal-authors');
        const modalJournal = document.querySelector('.study-modal-journal');
        const openLink = document.getElementById('study-open-link');
        
        modalTitle.textContent = study.title;
        modalAuthors.textContent = study.authors.slice(0, 10).join(', ') + (study.authors.length > 10 ? ' et al.' : '');
        modalJournal.textContent = `${study.journal} (${study.year || 'N/A'})`;
        openLink.href = study.url;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        await loadStudyVotesAndComments(study);
    }

    function closeStudyModal() {
        const modal = document.getElementById('study-modal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        currentStudy = null;
    }

    async function loadStudyVotesAndComments(study) {
        const identifier = getStudyIdentifier(study);
        if (!identifier) return;
        
        try {
            const response = await fetch(`/api/study-interactions/${encodeURIComponent(identifier)}`);
            if (response.ok) {
                const data = await response.json();
                
                document.getElementById('study-upvote-count').textContent = data.upvotes || 0;
                document.getElementById('study-downvote-count').textContent = data.downvotes || 0;
                document.getElementById('study-comments-count').textContent = data.comments.length;
                
                displayComments(data.comments);
            }
        } catch (error) {
            console.error('Error loading study data:', error);
        }
    }

    function displayComments(comments) {
        const commentsList = document.getElementById('study-comments-list');
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="study-no-comments">No comments yet. Be the first to share your thoughts!</p>';
            return;
        }
        
        commentsList.innerHTML = comments.map(comment => `
            <div class="study-comment">
                <div class="study-comment-meta">
                    <span class="study-comment-date">${new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <div class="study-comment-text">${escapeHtml(comment.comment_text)}</div>
            </div>
        `).join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async function submitVote(voteValue) {
        if (!currentStudy) return;
        
        const identifier = getStudyIdentifier(currentStudy);
        if (!identifier) {
            alert('Cannot vote on this study - no identifier found');
            return;
        }
        
        try {
            const response = await fetch('/api/study-vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    study_id: identifier,
                    vote: voteValue,
                    title: currentStudy.title,
                    doi: currentStudy.doi,
                    pmid: currentStudy.pmid
                })
            });
            
            if (response.ok) {
                await loadStudyVotesAndComments(currentStudy);
            } else {
                alert('Failed to submit vote');
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Failed to submit vote');
        }
    }

    async function submitComment(commentText) {
        if (!currentStudy) return;
        
        const identifier = getStudyIdentifier(currentStudy);
        if (!identifier) {
            alert('Cannot comment on this study - no identifier found');
            return;
        }
        
        try {
            const response = await fetch('/api/study-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    study_id: identifier,
                    comment_text: commentText,
                    title: currentStudy.title,
                    doi: currentStudy.doi,
                    pmid: currentStudy.pmid
                })
            });
            
            if (response.ok) {
                document.getElementById('study-comment-input').value = '';
                document.getElementById('study-char-count').textContent = '0';
                await loadStudyVotesAndComments(currentStudy);
            } else {
                alert('Failed to submit comment');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Failed to submit comment');
        }
    }

    function populateAutocomplete() {
        const peptideDatalist = document.getElementById('research-peptide-suggestions');
        const keywordDatalist = document.getElementById('research-keyword-suggestions');
        
        if (peptideDatalist) {
            peptides.forEach(peptide => {
                const option = document.createElement('option');
                option.value = peptide;
                peptideDatalist.appendChild(option);
            });
        }
        
        if (keywordDatalist) {
            researchKeywords.forEach(keyword => {
                const option = document.createElement('option');
                option.value = keyword;
                keywordDatalist.appendChild(option);
            });
        }
    }

    function initResearchPanel() {
        populateAutocomplete();
        const searchForm = document.getElementById('research-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                currentPage = 1;
                performSearch();
            });
        }

        const filtersToggle = document.getElementById('research-filters-toggle');
        if (filtersToggle) {
            filtersToggle.addEventListener('click', toggleFilters);
        }
        
        const modalClose = document.querySelector('.study-modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', closeStudyModal);
        }
        
        const modal = document.getElementById('study-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeStudyModal();
                }
            });
        }
        
        const upvoteBtn = document.getElementById('study-upvote-btn');
        if (upvoteBtn) {
            upvoteBtn.addEventListener('click', () => submitVote(1));
        }
        
        const downvoteBtn = document.getElementById('study-downvote-btn');
        if (downvoteBtn) {
            downvoteBtn.addEventListener('click', () => submitVote(-1));
        }
        
        const commentForm = document.getElementById('study-comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const commentText = document.getElementById('study-comment-input').value.trim();
                if (commentText) {
                    submitComment(commentText);
                }
            });
        }
        
        const commentInput = document.getElementById('study-comment-input');
        if (commentInput) {
            commentInput.addEventListener('input', () => {
                document.getElementById('study-char-count').textContent = commentInput.value.length;
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initResearchPanel);
    } else {
        initResearchPanel();
    }

    window.researchStudies = {
        performSearch,
        toggleFilters,
        openStudyModal
    };
})();
