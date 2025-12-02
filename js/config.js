// API Configuration
// These keys are for client-side API access to public research databases
const API_CONFIG = {
    PUBMED_API_KEY: 'a91bf78556565d33e33d04fd28fe997f1e08',
    SEMANTIC_SCHOLAR_API_KEY: 'XVxzepJwOZ1lEgvUNLN7Ya3e5wabkmTG4BbTDheX',
    PUBMED_BASE_URL: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/',
    SEMANTIC_BASE_URL: 'https://api.semanticscholar.org/graph/v1/'
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
