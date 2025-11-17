// Injection Point Images Catalog
// Manually add your image filenames here after placing them in images/injection_points/

const injectionPointImages = {
    // Example structure - uncomment and populate as you add images:
    
    // 'Right Knee - Medial': {
    //     'MCL sprain': [
    //         'right_knee_medial/mcl_sprain/01.png',
    //         'right_knee_medial/mcl_sprain/02.png'
    //     ],
    //     'Medial meniscus tear': ['right_knee_medial/medial_meniscus_tear/01.png'],
    //     'Pes anserine bursitis': ['right_knee_medial/pes_anserine_bursitis/01.png']
    // },
    
    // 'Left Deltoid - Anterior': {
    //     'Anterior deltoid strain': ['left_deltoid_anterior/anterior_deltoid_strain/01.png'],
    //     'Biceps tendinitis': ['left_deltoid_anterior/biceps_tendinitis/01.png']
    // },
    
    // 'Lower Back': {
    //     'Lumbar strain': ['lower_back/lumbar_strain/01.png', 'lower_back/lumbar_strain/02.png']
    // },
    
    // Add your images here following the pattern above
    // Region name must match exactly what's in injection-points.js
    // Injury names must match exactly
    // Path format: {region_folder}/{injury_folder}/{number}.png
};

// Function to get images for a specific region and injury
function getInjectionImages(region, injury) {
    if (injectionPointImages[region] && injectionPointImages[region][injury]) {
        return injectionPointImages[region][injury];
    }
    return [];
}

// Make globally accessible
window.getInjectionImages = getInjectionImages;
window.injectionPointImages = injectionPointImages;

console.log('📸 Injection images catalog loaded');
console.log('💡 Add image entries to js/injection-images.js as you add PNG files to images/injection_points/');
