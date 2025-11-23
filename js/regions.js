// ---- ANATOMICAL REGION DEFINITIONS (Bounding Boxes) ----
// Wait for THREE.js to be loaded before initializing regions
(function initializeRegions() {
    // Check if THREE is available
    if (typeof THREE === 'undefined') {
        // Wait for threeDepsReady event
        if (window.threeDepsReady) {
            // THREE should be available now, try again
            setTimeout(initializeRegions, 50);
        } else {
            window.addEventListener('threeDepsReady', () => {
                setTimeout(initializeRegions, 50);
            }, { once: true });
        }
        return;
    }

const defaultColor = 0x808080;
const highlightColor = 0xef4444;
const regionTolerance = 0.5;             // extra click radius

const regions = {
    'Head': new THREE.Box3(
        new THREE.Vector3(-1.2, 7.0, -1.2),
        new THREE.Vector3(1.2, 9.5, 1.2)
    ),
    'Neck': new THREE.Box3(
        new THREE.Vector3(-0.8, 6.0, -0.8),
        new THREE.Vector3(0.8, 7.2, 0.5)
    ),
    'Upper Chest': new THREE.Box3(
        new THREE.Vector3(-2.0, 5.0, -0.5),
        new THREE.Vector3(2.0, 6.5, 1.5)
    ),
    'Lower Chest': new THREE.Box3(
        new THREE.Vector3(-1.8, 3.5, -0.3),
        new THREE.Vector3(1.8, 5.0, 1.3)
    ),
    'Upper Abs': new THREE.Box3(
        new THREE.Vector3(-1.5, 2.8, 0.2),
        new THREE.Vector3(1.5, 4.2, 1.4)
    ),
    'Lower Abs': new THREE.Box3(
        new THREE.Vector3(-1.3, 1.5, 0.1),
        new THREE.Vector3(1.3, 2.8, 1.2)
    ),
    'Upper Back': new THREE.Box3(
        new THREE.Vector3(-2.2, 4.5, -1.8),
        new THREE.Vector3(2.2, 6.5, -0.2)
    ),
    'Mid Back': new THREE.Box3(
        new THREE.Vector3(-2.0, 2.5, -1.6),
        new THREE.Vector3(2.0, 4.5, -0.2)
    ),
    'Lower Back': new THREE.Box3(
        new THREE.Vector3(-1.5, 1.0, -1.4),
        new THREE.Vector3(1.5, 2.5, -0.2)
    ),
    'Right Anterior Deltoid': new THREE.Box3(
        new THREE.Vector3(-2.8, 5.8, -0.3),
        new THREE.Vector3(-2.2, 6.6, 0.8)
    ),
    'Right Lateral Deltoid': new THREE.Box3(
        new THREE.Vector3(-3.0, 5.8, -0.8),
        new THREE.Vector3(-2.3, 6.6, 0.3)
    ),
    'Right Posterior Deltoid': new THREE.Box3(
        new THREE.Vector3(-2.9, 5.8, -1.6),
        new THREE.Vector3(-2.3, 6.6, -0.5)
    ),
    'Right Bicep - Proximal': new THREE.Box3(
        new THREE.Vector3(-3.3, 5.0, -1.4),
        new THREE.Vector3(-2.6, 5.8, 0.0)
    ),
    'Right Bicep - Distal': new THREE.Box3(
        new THREE.Vector3(-3.5, 3.8, -1.7),
        new THREE.Vector3(-2.5, 5.0, 0.0)
    ),
    'Right Tricep - Lateral Head': new THREE.Box3(
        new THREE.Vector3(-3.5, 4.5, -1.8),
        new THREE.Vector3(-2.9, 5.5, -1.4)
    ),
    'Right Tricep - Long Head': new THREE.Box3(
        new THREE.Vector3(-3.4, 4.0, -1.9),
        new THREE.Vector3(-2.9, 5.8, -1.5)
    ),
    'Right Elbow': new THREE.Box3(
        new THREE.Vector3(-4.4, 3.2, -1.2),
        new THREE.Vector3(-4.0, 3.7, -0.4)
    ),
    'Right Forearm - Proximal Anterior': new THREE.Box3(
        new THREE.Vector3(-4.7, 2.8, -0.7),
        new THREE.Vector3(-4.1, 3.6, -0.3)
    ),
    'Right Forearm - Distal Anterior': new THREE.Box3(
        new THREE.Vector3(-5.0, 2.0, -0.7),
        new THREE.Vector3(-4.2, 2.8, -0.4)
    ),
    'Right Forearm - Proximal Posterior': new THREE.Box3(
        new THREE.Vector3(-4.8, 2.6, -1.6),
        new THREE.Vector3(-4.1, 3.4, -0.9)
    ),
    'Right Forearm - Distal Posterior': new THREE.Box3(
        new THREE.Vector3(-5.2, 1.5, -1.6),
        new THREE.Vector3(-4.5, 2.6, -0.9)
    ),
    'Right Wrist': new THREE.Box3(
        new THREE.Vector3(-5.6, 1.1, -0.9),
        new THREE.Vector3(-5.0, 1.7, -0.3)
    ),
    'Right Hand': new THREE.Box3(
        new THREE.Vector3(-5.8, 0.4, -0.8),
        new THREE.Vector3(-5.1, 1.2, -0.2)
    ),
    'Right Hip Flexor': new THREE.Box3(
        new THREE.Vector3(-1.5, 0.8, 0.0),
        new THREE.Vector3(-0.8, 1.8, 1.0)
    ),
    'Right Glute - Superior': new THREE.Box3(
        new THREE.Vector3(-1.7, 1.0, -1.5),
        new THREE.Vector3(-0.7, 1.5, -0.7)
    ),
    'Right Glute - Inferior': new THREE.Box3(
        new THREE.Vector3(-1.7, 0.5, -1.4),
        new THREE.Vector3(-0.7, 1.0, -0.7)
    ),
    'Right Quad - Proximal': new THREE.Box3(
        new THREE.Vector3(-1.6, 0.0, 0.3),
        new THREE.Vector3(-0.7, 1.2, 1.3)
    ),
    'Right Quad - Distal': new THREE.Box3(
        new THREE.Vector3(-1.7, -2.0, 0.2),
        new THREE.Vector3(-1.0, 0.0, 1.2)
    ),
    'Right Hamstring - Proximal': new THREE.Box3(
        new THREE.Vector3(-1.7, 0.0, -1.3),
        new THREE.Vector3(-1.2, 1.0, -0.8)
    ),
    'Right Hamstring - Distal': new THREE.Box3(
        new THREE.Vector3(-1.7, -3.5, -1.3),
        new THREE.Vector3(-1.3, 0.0, -0.9)
    ),
    'Right IT Band': new THREE.Box3(
        new THREE.Vector3(-1.9, -2.0, -0.2),
        new THREE.Vector3(-1.6, 1.0, 0.8)
    ),
    'Right Knee - Anterior': new THREE.Box3(
        new THREE.Vector3(-2.0, -4.2, 0.2),
        new THREE.Vector3(-1.7, -3.5, 0.7)
    ),
    'Right Knee - Posterior': new THREE.Box3(
        new THREE.Vector3(-2.0, -4.2, -1.1),
        new THREE.Vector3(-1.8, -3.5, -0.5)
    ),
    'Right Knee - Medial': new THREE.Box3(
        new THREE.Vector3(-1.6, -4.2, -0.5),
        new THREE.Vector3(-1.3, -3.5, 0.5)
    ),
    'Right Knee - Lateral': new THREE.Box3(
        new THREE.Vector3(-2.1, -4.2, -0.5),
        new THREE.Vector3(-1.9, -3.5, 0.5)
    ),
    'Right Shin - Proximal': new THREE.Box3(
        new THREE.Vector3(-1.9, -6.0, 0.0),
        new THREE.Vector3(-1.5, -4.0, 0.8)
    ),
    'Right Shin - Distal': new THREE.Box3(
        new THREE.Vector3(-2.0, -8.5, 0.0),
        new THREE.Vector3(-1.6, -6.0, 0.6)
    ),
    'Right Calf - Proximal (Gastrocnemius)': new THREE.Box3(
        new THREE.Vector3(-2.0, -6.0, -1.4),
        new THREE.Vector3(-1.6, -4.2, -0.9)
    ),
    'Right Calf - Distal (Soleus)': new THREE.Box3(
        new THREE.Vector3(-1.9, -7.7, -1.4),
        new THREE.Vector3(-1.7, -6.0, -1.0)
    ),
    'Right Ankle - Medial': new THREE.Box3(
        new THREE.Vector3(-1.7, -9.2, -0.9),
        new THREE.Vector3(-1.3, -8.8, -0.5)
    ),
    'Right Ankle - Lateral': new THREE.Box3(
        new THREE.Vector3(-2.2, -9.2, -0.9),
        new THREE.Vector3(-1.9, -8.8, -0.5)
    ),
    'Right Heel': new THREE.Box3(
        new THREE.Vector3(-1.9, -10.5, -1.4),
        new THREE.Vector3(-1.3, -9.0, -0.9)
    ),
    'Right Foot - Midfoot': new THREE.Box3(
        new THREE.Vector3(-2.0, -9.5, -0.5),
        new THREE.Vector3(-1.4, -8.7, 0.3)
    ),
    'Right Foot - Forefoot': new THREE.Box3(
        new THREE.Vector3(-2.0, -9.8, 0.0),
        new THREE.Vector3(-1.4, -9.3, 0.8)
    ),
    'Left Anterior Deltoid': new THREE.Box3(
        new THREE.Vector3(2.2, 5.8, -0.3),
        new THREE.Vector3(2.8, 6.6, 0.8)
    ),
    'Left Lateral Deltoid': new THREE.Box3(
        new THREE.Vector3(2.3, 5.8, -0.8),
        new THREE.Vector3(3.0, 6.6, 0.3)
    ),
    'Left Posterior Deltoid': new THREE.Box3(
        new THREE.Vector3(2.3, 5.8, -1.6),
        new THREE.Vector3(2.9, 6.6, -0.5)
    ),
    'Left Bicep - Proximal': new THREE.Box3(
        new THREE.Vector3(2.6, 5.0, -1.4),
        new THREE.Vector3(3.3, 5.8, 0.0)
    ),
    'Left Bicep - Distal': new THREE.Box3(
        new THREE.Vector3(2.5, 3.8, -1.7),
        new THREE.Vector3(3.5, 5.0, 0.0)
    ),
    'Left Tricep - Lateral Head': new THREE.Box3(
        new THREE.Vector3(2.9, 4.5, -1.8),
        new THREE.Vector3(3.5, 5.5, -1.4)
    ),
    'Left Tricep - Long Head': new THREE.Box3(
        new THREE.Vector3(2.9, 4.0, -1.9),
        new THREE.Vector3(3.4, 5.8, -1.5)
    ),
    'Left Elbow': new THREE.Box3(
        new THREE.Vector3(4.0, 3.2, -1.2),
        new THREE.Vector3(4.4, 3.7, -0.4)
    ),
    'Left Forearm - Proximal Anterior': new THREE.Box3(
        new THREE.Vector3(4.1, 2.8, -0.7),
        new THREE.Vector3(4.7, 3.6, -0.3)
    ),
    'Left Forearm - Distal Anterior': new THREE.Box3(
        new THREE.Vector3(4.2, 2.0, -0.7),
        new THREE.Vector3(5.0, 2.8, -0.4)
    ),
    'Left Forearm - Proximal Posterior': new THREE.Box3(
        new THREE.Vector3(4.1, 2.6, -1.6),
        new THREE.Vector3(4.8, 3.4, -0.9)
    ),
    'Left Forearm - Distal Posterior': new THREE.Box3(
        new THREE.Vector3(4.5, 1.5, -1.6),
        new THREE.Vector3(5.2, 2.6, -0.9)
    ),
    'Left Wrist': new THREE.Box3(
        new THREE.Vector3(5.0, 1.1, -0.9),
        new THREE.Vector3(5.6, 1.7, -0.3)
    ),
    'Left Hand': new THREE.Box3(
        new THREE.Vector3(5.1, 0.4, -0.8),
        new THREE.Vector3(5.8, 1.2, -0.2)
    ),
    'Left Hip Flexor': new THREE.Box3(
        new THREE.Vector3(0.8, 0.8, 0.0),
        new THREE.Vector3(1.5, 1.8, 1.0)
    ),
    'Left Glute - Superior': new THREE.Box3(
        new THREE.Vector3(0.7, 1.0, -1.5),
        new THREE.Vector3(1.7, 1.5, -0.7)
    ),
    'Left Glute - Inferior': new THREE.Box3(
        new THREE.Vector3(0.7, 0.5, -1.4),
        new THREE.Vector3(1.7, 1.0, -0.7)
    ),
    'Left Quad - Proximal': new THREE.Box3(
        new THREE.Vector3(0.7, 0.0, 0.3),
        new THREE.Vector3(1.6, 1.2, 1.3)
    ),
    'Left Quad - Distal': new THREE.Box3(
        new THREE.Vector3(1.0, -2.0, 0.2),
        new THREE.Vector3(1.7, 0.0, 1.2)
    ),
    'Left Hamstring - Proximal': new THREE.Box3(
        new THREE.Vector3(1.2, 0.0, -1.3),
        new THREE.Vector3(1.7, 1.0, -0.8)
    ),
    'Left Hamstring - Distal': new THREE.Box3(
        new THREE.Vector3(1.3, -3.5, -1.3),
        new THREE.Vector3(1.7, 0.0, -0.9)
    ),
    'Left IT Band': new THREE.Box3(
        new THREE.Vector3(1.6, -2.0, -0.2),
        new THREE.Vector3(1.9, 1.0, 0.8)
    ),
    'Left Knee - Anterior': new THREE.Box3(
        new THREE.Vector3(1.7, -4.2, 0.2),
        new THREE.Vector3(2.0, -3.5, 0.7)
    ),
    'Left Knee - Posterior': new THREE.Box3(
        new THREE.Vector3(1.8, -4.2, -1.1),
        new THREE.Vector3(2.0, -3.5, -0.5)
    ),
    'Left Knee - Medial': new THREE.Box3(
        new THREE.Vector3(1.3, -4.2, -0.5),
        new THREE.Vector3(1.6, -3.5, 0.5)
    ),
    'Left Knee - Lateral': new THREE.Box3(
        new THREE.Vector3(1.9, -4.2, -0.5),
        new THREE.Vector3(2.1, -3.5, 0.5)
    ),
    'Left Shin - Proximal': new THREE.Box3(
        new THREE.Vector3(1.5, -6.0, 0.0),
        new THREE.Vector3(1.9, -4.0, 0.8)
    ),
    'Left Shin - Distal': new THREE.Box3(
        new THREE.Vector3(1.6, -8.5, 0.0),
        new THREE.Vector3(2.0, -6.0, 0.6)
    ),
    'Left Calf - Proximal (Gastrocnemius)': new THREE.Box3(
        new THREE.Vector3(1.6, -6.0, -1.4),
        new THREE.Vector3(2.0, -4.2, -0.9)
    ),
    'Left Calf - Distal (Soleus)': new THREE.Box3(
        new THREE.Vector3(1.7, -7.7, -1.4),
        new THREE.Vector3(1.9, -6.0, -1.0)
    ),
    'Left Ankle - Medial': new THREE.Box3(
        new THREE.Vector3(1.3, -9.2, -0.9),
        new THREE.Vector3(1.7, -8.8, -0.5)
    ),
    'Left Ankle - Lateral': new THREE.Box3(
        new THREE.Vector3(1.9, -9.2, -0.9),
        new THREE.Vector3(2.2, -8.8, -0.5)
    ),
    'Left Heel': new THREE.Box3(
        new THREE.Vector3(1.3, -10.5, -1.4),
        new THREE.Vector3(1.9, -9.0, -0.9)
    ),
    'Left Foot - Midfoot': new THREE.Box3(
        new THREE.Vector3(1.4, -9.5, -0.5),
        new THREE.Vector3(2.0, -8.7, 0.3)
    ),
    'Left Foot - Forefoot': new THREE.Box3(
        new THREE.Vector3(1.4, -9.8, 0.0),
        new THREE.Vector3(2.0, -9.3, 0.8)
    )
};

const regionInjuries = {
    'Head': ['Concussion', 'Skull fracture', 'Traumatic brain injury', 'Brain contusion', 'Post-concussion syndrome', 'TMJ disorder', 'Chronic headaches', 'Migraine'],
    'Neck': ['Whiplash', 'Cervical strain', 'Cervical disc herniation', 'Neck sprain', 'Cervical radiculopathy', 'Facet joint syndrome', 'Neck muscle spasm', 'Facet joint pain'],
    'Upper Chest': ['Pectoralis major strain', 'Costochondritis', 'Intercostal strain', 'Rib stress fracture', 'Sternoclavicular joint sprain', 'Pectoral tear', 'Pectoralis minor strain', 'Lower rib injury'],
    'Lower Chest': ['Pectoralis major strain', 'Costochondritis', 'Intercostal strain', 'Rib stress fracture', 'Diaphragm strain', 'Pectoralis major tear', 'Lower rib injury'],
    'Upper Abs': ['Abdominal muscle strain', 'Hernia', 'Rectus abdominis strain', 'Oblique muscle tear', 'Diastasis recti', 'Sports hernia', 'Athletic pubalgia'],
    'Lower Abs': ['Abdominal muscle strain', 'Hernia', 'Inguinal hernia', 'Umbilical hernia', 'Sports hernia', 'Lower abdominal strain', 'Oblique muscle tear', 'Core muscle injury'],
    'Upper Back': ['Trapezius strain', 'Rhomboid strain', 'Levator scapulae strain', 'Scapular dyskinesis', 'Thoracic outlet syndrome', 'Upper back spasm'],
    'Mid Back': ['Thoracic strain', 'Thoracic disc herniation', 'Costovertebral sprain', 'Paraspinal strain', "Scheuermann's kyphosis", 'Rib dysfunction', 'Intercostal neuralgia', 'Mid-back spasm'],
    'Lower Back': ['Lumbar strain', 'Herniated disc', 'Sciatica', 'Spondylolisthesis', 'Facet joint arthritis', 'Sacroiliac dysfunction', 'Piriformis syndrome', 'Facet joint syndrome', 'Muscle spasm'],
    'Right Anterior Deltoid': ['Rotator cuff tear', 'Shoulder impingement', 'Deltoid strain', 'Labral tear', 'Bursitis', 'AC joint separation', 'Rotator cuff tendinopathy', 'Subacromial bursitis', 'Biceps tendinitis', 'Supraspinatus tendinitis', 'Shoulder instability'],
    'Right Lateral Deltoid': ['Rotator cuff tear', 'Shoulder impingement', 'Deltoid strain', 'Labral tear', 'Bursitis', 'AC joint separation', 'Supraspinatus tendinitis', 'Shoulder instability', 'Rotator cuff tendinopathy'],
    'Right Posterior Deltoid': ['Rotator cuff tear', 'Shoulder impingement', 'Deltoid strain', 'Labral tear', 'Bursitis', 'AC joint separation', 'Infraspinatus tendinitis', 'Teres minor strain', 'Posterior impingement', 'Shoulder instability'],
    'Right Bicep - Proximal': ['Proximal biceps tendon rupture', 'Biceps tendonitis', 'SLAP lesion', 'Bicep muscle strain', 'SLAP tear', 'Bicipital tenosynovitis', 'Long head biceps tendinopathy'],
    'Right Bicep - Distal': ['Distal biceps tendon rupture', 'Bicep tear', 'Elbow flexor strain', 'Distal biceps tendonitis', 'Partial biceps tear'],
    'Right Tricep - Lateral Head': ['Triceps strain', 'Triceps tendonitis', 'Triceps rupture', 'Olecranon bursitis', 'Lateral head tear', 'Triceps insertion tendinopathy'],
    'Right Tricep - Long Head': ['Triceps strain', 'Triceps tendonitis', 'Triceps rupture', 'Olecranon bursitis', 'Long head tear', 'Triceps tendon rupture'],
    'Right Elbow': ['Tennis elbow (lateral epicondylitis)', "Golfer's elbow (medial epicondylitis)", 'Ulnar collateral ligament tear', 'Radial tunnel syndrome', 'Elbow bursitis', 'Elbow tendinopathy', 'Ulnar collateral ligament injury'],
    'Right Forearm - Proximal Anterior': ['Forearm strain', 'Compartment syndrome', 'Pronator teres syndrome', 'Flexor tendinitis', 'Flexor-pronator mass injury', 'Medial forearm pain'],
    'Right Forearm - Distal Anterior': ['Forearm strain', 'Compartment syndrome', 'Flexor tendinitis', 'Wrist flexor strain', 'Wrist flexor tendonitis', 'Carpal tunnel syndrome', 'Median nerve compression'],
    'Right Forearm - Proximal Posterior': ['Forearm strain', 'Compartment syndrome', 'Extensor tendinitis', 'Radial nerve entrapment', 'Forearm extensor strain', 'Radial tunnel syndrome', 'Posterior interosseous syndrome'],
    'Right Forearm - Distal Posterior': ['Forearm strain', 'Compartment syndrome', 'Extensor tendinitis', 'Wrist extensor strain', 'Wrist extensor tendonitis', 'De Quervain tenosynovitis', 'Intersection syndrome'],
    'Right Wrist': ['Wrist sprain', 'Carpal tunnel syndrome', "De Quervain's tenosynovitis", 'TFCC tear', 'Ganglion cyst', 'Wrist tendonitis', 'Scapholunate ligament injury'],
    'Right Hand': ['Finger fracture', "Boxer's fracture", 'Mallet finger', 'Trigger finger', "Dupuytren's contracture", 'Jersey finger', 'Metacarpal fracture', 'Finger tendon injury'],
    'Right Hip Flexor': ['Hip flexor strain', 'Iliopsoas tendinopathy', 'Hip labral tear', 'FAI (femoroacetabular impingement)', 'Snapping hip syndrome', 'Hip flexor tear', 'Iliopsoas bursitis'],
    'Right Glute - Superior': ['Gluteus medius tear', 'Piriformis syndrome', 'Trochanteric bursitis', 'Gluteal tendinopathy', 'Hip abductor strain', 'Gluteus medius tendinopathy', 'Greater trochanteric pain syndrome', 'Hip bursitis'],
    'Right Glute - Inferior': ['Gluteus maximus strain', 'Gluteal muscle tear', 'Sciatic nerve entrapment', 'Proximal hamstring tendinopathy', 'Ischial tuberosity bursitis'],
    'Right Quad - Proximal': ['Quadriceps strain', 'Quadriceps tendonitis', 'Rectus femoris tear', 'Hip pointer', 'Hip flexor strain'],
    'Right Quad - Distal': ['Quadriceps strain', 'Quadriceps tendonitis', 'Quadriceps tendon rupture', 'Patellar tendinopathy', 'Patellar tendonitis', 'Distal quad strain', 'Vastus medialis strain'],
    'Right Hamstring - Proximal': ['Hamstring strain', 'Ischial tuberosity avulsion', 'Hamstring tendinopathy', 'Proximal hamstring tear', 'Proximal hamstring tendinopathy', 'High hamstring tear'],
    'Right Hamstring - Distal': ['Hamstring tear', 'Distal hamstring strain', 'Popliteal tendonitis', 'Knee flexor injury'],
    'Right IT Band': ['IT band syndrome', 'Lateral knee pain', 'Greater trochanteric pain syndrome', 'IT band friction syndrome', 'Iliotibial band friction syndrome', 'TFL strain'],
    'Right Knee - Anterior': ["Patellar tendonitis (jumper's knee)", 'ACL tear', 'Patellar fracture', 'Quadriceps tendon tear', 'Osgood-Schlatter disease', 'Patellofemoral pain syndrome', 'Patellar tracking disorder'],
    'Right Knee - Posterior': ['PCL tear', "Baker's cyst", 'Popliteus tendinitis', 'Posterior capsule strain', 'Hamstring insertion tendinopathy', 'Popliteus strain'],
    'Right Knee - Medial': ['MCL tear', 'Meniscus tear', 'Pes anserine bursitis', 'Medial plica syndrome', 'MCL sprain', 'Medial meniscus tear', 'Medial collateral ligament injury'],
    'Right Knee - Lateral': ['LCL tear', 'IT band friction', 'Lateral meniscus tear', 'Popliteus strain', 'LCL sprain', 'IT band friction syndrome', 'Popliteus tendinitis'],
    'Right Shin - Proximal': ['Shin splints (medial tibial stress syndrome)', 'Stress fracture', 'Anterior compartment syndrome', 'Tibial periostitis', 'Tibial stress fracture', 'Periostitis'],
    'Right Shin - Distal': ['Shin splints (medial tibial stress syndrome)', 'Stress fracture', 'Distal tibia stress fracture', 'Shin splints', 'Chronic exertional compartment syndrome'],
    'Right Calf - Proximal (Gastrocnemius)': ['Gastrocnemius strain', 'Tennis leg', 'Achilles tendinopathy', 'Calf muscle tear', 'Medial gastrocnemius tear'],
    'Right Calf - Distal (Soleus)': ['Soleus strain', 'Deep calf strain', 'Achilles tendon strain', 'Soleus tear', 'Chronic calf pain'],
    'Right Ankle - Medial': ['Medial ankle sprain', 'Deltoid ligament tear', 'Tibialis posterior tendinitis', 'Tarsal tunnel syndrome', 'Posterior tibial tendonitis', 'Medial malleolus stress fracture'],
    'Right Ankle - Lateral': ['Lateral ankle sprain', 'ATFL tear', 'Peroneal tendonitis', 'Syndesmotic ankle sprain', 'Calcaneofibular ligament tear', 'CFL tear', 'Chronic ankle instability'],
    'Right Heel': ['Achilles tendonitis', 'Plantar fasciitis', 'Retrocalcaneal bursitis', 'Heel spur syndrome', 'Achilles rupture', 'Achilles tendinopathy', 'Heel spur'],
    'Right Foot - Midfoot': ['Lisfranc injury', 'Stress fracture', 'Navicular stress fracture', 'Cuboid syndrome', 'Midfoot sprain', 'Posterior tibial tendon dysfunction'],
    'Right Foot - Forefoot': ['Metatarsal stress fracture', 'Turf toe', "Morton's neuroma", 'Sesamoiditis', 'Hallux valgus', 'Morton neuroma', 'Metatarsalgia'],
    'Left Anterior Deltoid': ['Rotator cuff tear', 'Shoulder impingement', 'Deltoid strain', 'Labral tear', 'Bursitis', 'AC joint separation', 'Rotator cuff tendinopathy', 'Subacromial bursitis', 'Biceps tendinitis', 'Supraspinatus tendinitis', 'Shoulder instability'],
    'Left Lateral Deltoid': ['Rotator cuff tear', 'Shoulder impingement', 'Deltoid strain', 'Labral tear', 'Bursitis', 'AC joint separation', 'Supraspinatus tendinitis', 'Shoulder instability', 'Rotator cuff tendinopathy'],
    'Left Posterior Deltoid': ['Rotator cuff tear', 'Shoulder impingement', 'Deltoid strain', 'Labral tear', 'Bursitis', 'AC joint separation', 'Infraspinatus tendinitis', 'Teres minor strain', 'Posterior impingement', 'Shoulder instability'],
    'Left Bicep - Proximal': ['Proximal biceps tendon rupture', 'Biceps tendonitis', 'SLAP lesion', 'Bicep muscle strain', 'SLAP tear', 'Bicipital tenosynovitis', 'Long head biceps tendinopathy'],
    'Left Bicep - Distal': ['Distal biceps tendon rupture', 'Bicep tear', 'Elbow flexor strain', 'Distal biceps tendonitis', 'Partial biceps tear'],
    'Left Tricep - Lateral Head': ['Triceps strain', 'Triceps tendonitis', 'Triceps rupture', 'Olecranon bursitis', 'Lateral head tear', 'Triceps insertion tendinopathy'],
    'Left Tricep - Long Head': ['Triceps strain', 'Triceps tendonitis', 'Triceps rupture', 'Olecranon bursitis', 'Long head tear', 'Triceps tendon rupture'],
    'Left Elbow': ['Tennis elbow (lateral epicondylitis)', "Golfer's elbow (medial epicondylitis)", 'Ulnar collateral ligament tear', 'Radial tunnel syndrome', 'Elbow bursitis', 'Elbow tendinopathy', 'Ulnar collateral ligament injury'],
    'Left Forearm - Proximal Anterior': ['Forearm strain', 'Compartment syndrome', 'Pronator teres syndrome', 'Flexor tendinitis', 'Flexor-pronator mass injury', 'Medial forearm pain'],
    'Left Forearm - Distal Anterior': ['Forearm strain', 'Compartment syndrome', 'Flexor tendinitis', 'Wrist flexor strain', 'Wrist flexor tendonitis', 'Carpal tunnel syndrome', 'Median nerve compression'],
    'Left Forearm - Proximal Posterior': ['Forearm strain', 'Compartment syndrome', 'Extensor tendinitis', 'Radial nerve entrapment', 'Forearm extensor strain', 'Radial tunnel syndrome', 'Posterior interosseous syndrome'],
    'Left Forearm - Distal Posterior': ['Forearm strain', 'Compartment syndrome', 'Extensor tendinitis', 'Wrist extensor strain', 'Wrist extensor tendonitis', 'De Quervain tenosynovitis', 'Intersection syndrome'],
    'Left Wrist': ['Wrist sprain', 'Carpal tunnel syndrome', "De Quervain's tenosynovitis", 'TFCC tear', 'Ganglion cyst', 'Wrist tendonitis', 'Scapholunate ligament injury'],
    'Left Hand': ['Finger fracture', "Boxer's fracture", 'Mallet finger', 'Trigger finger', "Dupuytren's contracture", 'Jersey finger', 'Metacarpal fracture', 'Finger tendon injury'],
    'Left Hip Flexor': ['Hip flexor strain', 'Iliopsoas tendinopathy', 'Hip labral tear', 'FAI (femoroacetabular impingement)', 'Snapping hip syndrome', 'Hip flexor tear', 'Iliopsoas bursitis'],
    'Left Glute - Superior': ['Gluteus medius tear', 'Piriformis syndrome', 'Trochanteric bursitis', 'Gluteal tendinopathy', 'Hip abductor strain', 'Gluteus medius tendinopathy', 'Greater trochanteric pain syndrome', 'Hip bursitis'],
    'Left Glute - Inferior': ['Gluteus maximus strain', 'Gluteal muscle tear', 'Sciatic nerve entrapment', 'Proximal hamstring tendinopathy', 'Ischial tuberosity bursitis'],
    'Left Quad - Proximal': ['Quadriceps strain', 'Quadriceps tendonitis', 'Rectus femoris tear', 'Hip pointer', 'Hip flexor strain'],
    'Left Quad - Distal': ['Quadriceps strain', 'Quadriceps tendonitis', 'Quadriceps tendon rupture', 'Patellar tendinopathy', 'Patellar tendonitis', 'Distal quad strain', 'Vastus medialis strain'],
    'Left Hamstring - Proximal': ['Hamstring strain', 'Ischial tuberosity avulsion', 'Hamstring tendinopathy', 'Proximal hamstring tear', 'Proximal hamstring tendinopathy', 'High hamstring tear'],
    'Left Hamstring - Distal': ['Hamstring tear', 'Distal hamstring strain', 'Popliteal tendonitis', 'Knee flexor injury'],
    'Left IT Band': ['IT band syndrome', 'Lateral knee pain', 'Greater trochanteric pain syndrome', 'IT band friction syndrome', 'Iliotibial band friction syndrome', 'TFL strain'],
    'Left Knee - Anterior': ["Patellar tendonitis (jumper's knee)", 'ACL tear', 'Patellar fracture', 'Quadriceps tendon tear', 'Osgood-Schlatter disease', 'Patellofemoral pain syndrome', 'Patellar tracking disorder'],
    'Left Knee - Posterior': ['PCL tear', "Baker's cyst", 'Popliteus tendinitis', 'Posterior capsule strain', 'Hamstring insertion tendinopathy', 'Popliteus strain'],
    'Left Knee - Medial': ['MCL tear', 'Meniscus tear', 'Pes anserine bursitis', 'Medial plica syndrome', 'MCL sprain', 'Medial meniscus tear', 'Medial collateral ligament injury'],
    'Left Knee - Lateral': ['LCL tear', 'IT band friction', 'Lateral meniscus tear', 'Popliteus strain', 'LCL sprain', 'IT band friction syndrome', 'Popliteus tendinitis'],
    'Left Shin - Proximal': ['Shin splints (medial tibial stress syndrome)', 'Stress fracture', 'Anterior compartment syndrome', 'Tibial periostitis', 'Tibial stress fracture', 'Periostitis'],
    'Left Shin - Distal': ['Shin splints (medial tibial stress syndrome)', 'Stress fracture', 'Distal tibia stress fracture', 'Shin splints', 'Chronic exertional compartment syndrome'],
    'Left Calf - Proximal (Gastrocnemius)': ['Gastrocnemius strain', 'Tennis leg', 'Achilles tendinopathy', 'Calf muscle tear', 'Medial gastrocnemius tear'],
    'Left Calf - Distal (Soleus)': ['Soleus strain', 'Deep calf strain', 'Achilles tendon strain', 'Soleus tear', 'Chronic calf pain'],
    'Left Ankle - Medial': ['Medial ankle sprain', 'Deltoid ligament tear', 'Tibialis posterior tendinitis', 'Tarsal tunnel syndrome', 'Posterior tibial tendonitis', 'Medial malleolus stress fracture'],
    'Left Ankle - Lateral': ['Lateral ankle sprain', 'ATFL tear', 'Peroneal tendonitis', 'Syndesmotic ankle sprain', 'Calcaneofibular ligament tear', 'CFL tear', 'Chronic ankle instability'],
    'Left Heel': ['Achilles tendonitis', 'Plantar fasciitis', 'Retrocalcaneal bursitis', 'Heel spur syndrome', 'Achilles rupture', 'Achilles tendinopathy', 'Heel spur'],
    'Left Foot - Midfoot': ['Lisfranc injury', 'Stress fracture', 'Navicular stress fracture', 'Cuboid syndrome', 'Midfoot sprain', 'Posterior tibial tendon dysfunction'],
    'Left Foot - Forefoot': ['Metatarsal stress fracture', 'Turf toe', "Morton's neuroma", 'Sesamoiditis', 'Hallux valgus', 'Morton neuroma', 'Metatarsalgia']
};

const regionProcedures = {
    'Head': {
        technique: 'Subcutaneous (SC) - EXTREME CAUTION',
        position: 'Supine or seated with head supported',
        landmark: 'Area of maximal tenderness in defined head region, avoiding temporal artery and major cranial sutures',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle, very shallow subcutaneous injection only',
        volume: '0.1-0.2 mL',
        notes: 'HEAD INJECTIONS ARE HIGH-RISK. Should only be performed by specialists for specific conditions. Avoid areas overlying cranial sutures and major blood vessels.'
    },
    'Neck': {
        technique: 'Subcutaneous (SC) or Superficial Intramuscular (IM)',
        position: 'Supine with neck slightly extended, or seated',
        landmark: 'Area of maximal tenderness in posterior cervical muscles, avoiding midline spine and anterior carotid triangle',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '45 degree angle, shallow injection (0.25-0.5")',
        volume: '0.1-0.3 mL',
        notes: 'ASPIRATE before injection. Avoid anterior triangle containing carotid artery and jugular vein. Use extreme caution near spinal column.'
    },
    'Upper Chest': {
        technique: 'Intramuscular (IM)',
        position: 'Supine',
        landmark: 'Pectoralis major muscle belly, avoiding nipple and sternum',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle for IM injection',
        volume: '0.3-0.5 mL',
        notes: 'Avoid penetrating rib cage. For pectoralis major strains, target the muscle belly away from sternal attachments.'
    },
    'Lower Chest': {
        technique: 'Intramuscular (IM)',
        position: 'Supine',
        landmark: 'Inferior pectoralis major and serratus anterior muscles',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle for IM injection',
        volume: '0.3-0.5 mL',
        notes: 'Stay clear of costal margin and abdominal cavity. Target muscle belly only.'
    },
    'Upper Abs': {
        technique: 'Intramuscular (IM) with tissue pinch',
        position: 'Supine',
        landmark: 'Rectus abdominis muscle, lateral to linea alba (midline)',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '45-90 degree angle with tissue pinch to ensure IM injection',
        volume: '0.2-0.4 mL',
        notes: 'PINCH technique recommended. Avoid intra-peritoneal injection. Stay lateral to midline.'
    },
    'Lower Abs': {
        technique: 'Intramuscular (IM) with tissue pinch',
        position: 'Supine',
        landmark: 'Inferior rectus abdominis, above inguinal ligament',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '45-90 degree angle with tissue pinch',
        volume: '0.2-0.4 mL',
        notes: 'Avoid lower quadrants where organs may be more vulnerable. Use pinch technique for safety.'
    },
    'Upper Back': {
        technique: 'Intramuscular (IM)',
        position: 'Prone (face down)',
        landmark: 'Trapezius and rhomboid muscles, avoiding spinal processes',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle for IM injection',
        volume: '0.3-0.5 mL',
        notes: 'Stay clear of midline spinal processes. Target muscle bellies of upper back muscles.'
    },
    'Mid Back': {
        technique: 'Intramuscular (IM)',
        position: 'Prone',
        landmark: 'Thoracic erector spinae and latissimus dorsi muscles',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle for IM injection',
        volume: '0.3-0.5 mL',
        notes: 'Avoid penetrating rib cage. Target para-spinal muscles.'
    },
    'Lower Back': {
        technique: 'Intramuscular (IM)',
        position: 'Prone',
        landmark: 'Lumbar erector spinae and quadratus lumborum muscles',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle for IM injection',
        volume: '0.3-0.5 mL',
        notes: 'Stay clear of kidneys. For lumbar strains, target muscle bellies rather than spinal elements.'
    },
    'Right Anterior Deltoid': {
        technique: 'Intramuscular (IM) or Peri-tendinous',
        position: 'Seated or supine',
        landmark: 'Anterior deltoid muscle belly or anterior shoulder tendon',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '90 degree angle for muscle, 45 degrees for tendon',
        volume: '0.3-0.5 mL',
        notes: 'Classic deltoid IM site. For rotator cuff issues, target peri-tendinous tissue.'
    },
    'Right Lateral Deltoid': {
        technique: 'Intramuscular (IM)',
        position: 'Seated or supine',
        landmark: 'Lateral deltoid muscle, 2-3 finger widths below acromion',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '90 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'Standard deltoid injection site. Avoid axillary nerve in posterior deltoid.'
    },
    'Right Posterior Deltoid': {
        technique: 'Intramuscular (IM) or Peri-tendinous',
        position: 'Prone or seated leaning forward',
        landmark: 'Posterior deltoid muscle or posterior rotator cuff tendons',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '90 degree angle for muscle, 45 degrees for tendon',
        volume: '0.3-0.5 mL',
        notes: 'For posterior rotator cuff tears, target peri-tendinous tissue around infraspinatus and teres minor.'
    },
    'Right Bicep - Proximal': {
        technique: 'Intramuscular (IM)',
        position: 'Seated with arm supported',
        landmark: 'Proximal biceps brachii muscle belly',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'For proximal biceps tendonitis, target muscle-tendon junction. Avoid neurovascular bundle.'
    },
    'Right Bicep - Distal': {
        technique: 'Peri-tendinous - HIGH RISK',
        position: 'Supine, arm extended and supinated',
        landmark: 'Area around distal biceps tendon at elbow crease',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '45 degree angle, shallow',
        volume: '0.1-0.3 mL',
        notes: 'HIGH-RISK AREA due to brachial artery and median nerve. ULTRASOUND GUIDANCE STRONGLY RECOMMENDED.'
    },
    'Right Tricep - Lateral Head': {
        technique: 'Intramuscular (IM)',
        position: 'Prone or seated with arm flexed',
        landmark: 'Lateral head of triceps brachii muscle',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'Target muscle belly of lateral triceps head. Avoid radial nerve in spiral groove.'
    },
    'Right Tricep - Long Head': {
        technique: 'Intramuscular (IM)',
        position: 'Prone or seated with arm flexed',
        landmark: 'Long head of triceps brachii muscle',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'For triceps tendonitis, target muscle-tendon junction near axilla.'
    },
    'Right Elbow': {
        technique: 'Peri-tendinous',
        position: 'Seated, elbow flexed 90 degrees',
        landmark: 'Lateral epicondyle for tennis elbow, medial epicondyle for golfer\'s elbow',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle to skin, fenestration technique',
        volume: '0.2-0.4 mL',
        notes: 'Use peppering/fenestration technique for tendinopathy. Do not inject directly into tendon body.'
    },
    'Right Forearm - Proximal Anterior': {
        technique: 'Intramuscular (IM)',
        position: 'Seated, arm supinated',
        landmark: 'Flexor-pronator muscle group',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '45-90 degree angle',
        volume: '0.2-0.4 mL',
        notes: 'Avoid median nerve and brachial artery. Target muscle bellies only.'
    },
    'Right Forearm - Distal Anterior': {
        technique: 'Subcutaneous (SC) or Superficial IM',
        position: 'Seated, arm supinated',
        landmark: 'Distal forearm flexors',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '45 degree angle',
        volume: '0.1-0.3 mL',
        notes: 'Multiple superficial nerves and vessels. Use caution with depth.'
    },
    'Right Forearm - Proximal Posterior': {
        technique: 'Intramuscular (IM)',
        position: 'Seated, arm pronated',
        landmark: 'Extensor muscle group',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '45-90 degree angle',
        volume: '0.2-0.4 mL',
        notes: 'Target extensor muscle bellies. Avoid posterior interosseous nerve.'
    },
    'Right Forearm - Distal Posterior': {
        technique: 'Subcutaneous (SC) or Superficial IM',
        position: 'Seated, arm pronated',
        landmark: 'Distal forearm extensors',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '45 degree angle',
        volume: '0.1-0.3 mL',
        notes: 'Multiple superficial structures. Use shallow injection technique.'
    },
    'Right Wrist': {
        technique: 'Subcutaneous (SC) or Peri-tendinous',
        position: 'Seated, wrist neutral',
        landmark: 'Area of maximal tenderness, avoiding flexor retinaculum',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-45 degree angle, very shallow',
        volume: '0.1-0.2 mL',
        notes: 'Avoid carpal tunnel and ulnar artery. For carpal tunnel syndrome, subcutaneous injection only.'
    },
    'Right Hand': {
        technique: 'Subcutaneous (SC)',
        position: 'Seated, hand relaxed',
        landmark: 'Dorsal hand surface, avoiding veins and tendons',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle, very shallow',
        volume: '0.1-0.2 mL',
        notes: 'Dorsal approach preferred. Avoid palmar surface with digital nerves and arteries.'
    },
    'Right Hip Flexor': {
        technique: 'Intramuscular (IM) - HIGH RISK',
        position: 'Supine',
        landmark: 'Iliopsoas muscle, below inguinal ligament',
        needle: '30G, 1.0" (25mm)',
        angleDepth: '90 degree angle, deep IM',
        volume: '0.3-0.5 mL',
        notes: 'HIGH-RISK due to femoral nerve and artery. ULTRASOUND GUIDANCE RECOMMENDED. ASPIRATE carefully.'
    },
    'Right Glute - Superior': {
        technique: 'Intramuscular (IM)',
        position: 'Lateral decubitus (on side)',
        landmark: 'Gluteus medius muscle, ventrogluteal site',
        needle: '25-27G, 1.5" (38mm)',
        angleDepth: '90 degree angle, deep IM',
        volume: '0.5-1.0 mL',
        notes: 'Ventrogluteal site is safest. Avoid sciatic nerve. ASPIRATE before injection.'
    },
    'Right Glute - Inferior': {
        technique: 'Intramuscular (IM)',
        position: 'Lateral decubitus or prone',
        landmark: 'Gluteus maximus muscle, upper outer quadrant',
        needle: '25-27G, 1.5" (38mm)',
        angleDepth: '90 degree angle, deep IM',
        volume: '0.5-1.0 mL',
        notes: 'Use upper outer quadrant only. Avoid sciatic nerve. ASPIRATE before injection.'
    },
    'Right Quad - Proximal': {
        technique: 'Intramuscular (IM)',
        position: 'Supine, leg relaxed',
        landmark: 'Proximal quadriceps muscle, vastus lateralis',
        needle: '25-27G, 1.0" (25mm)',
        angleDepth: '90 degree angle',
        volume: '0.5-1.0 mL',
        notes: 'Vastus lateralis is preferred site. Avoid femoral triangle.'
    },
    'Right Quad - Distal': {
        technique: 'Intramuscular (IM)',
        position: 'Supine, leg relaxed',
        landmark: 'Distal quadriceps muscle',
        needle: '25-27G, 1.0" (25mm)',
        angleDepth: '90 degree angle',
        volume: '0.5-1.0 mL',
        notes: 'Target vastus medialis or lateralis. Stay proximal to knee joint.'
    },
    'Right Hamstring - Proximal': {
        technique: 'Intramuscular (IM)',
        position: 'Prone',
        landmark: 'Proximal hamstring muscles at ischial tuberosity',
        needle: '25-27G, 1.0"-1.5" (25-38mm)',
        angleDepth: '90 degree angle',
        volume: '0.5-1.0 mL',
        notes: 'For proximal hamstring tears, target muscle-tendon junction. Avoid sciatic nerve.'
    },
    'Right Hamstring - Distal': {
        technique: 'Intramuscular (IM)',
        position: 'Prone',
        landmark: 'Distal hamstring muscles',
        needle: '25-27G, 1.0" (25mm)',
        angleDepth: '90 degree angle',
        volume: '0.5-1.0 mL',
        notes: 'Target semitendinosus, semimembranosus, biceps femoris. Avoid popliteal fossa.'
    },
    'Right IT Band': {
        technique: 'Peri-tendinous/Subfascial',
        position: 'Lateral decubitus (affected side up)',
        landmark: 'IT band along lateral thigh, proximal to lateral femoral condyle',
        needle: '30G, 1.0" (25mm)',
        angleDepth: '45-90 degree angle, subfascial injection',
        volume: '0.3-0.5 mL',
        notes: 'Target tissue deep to IT band, not the band itself. Multiple penetration technique may be used.'
    },
    'Right Knee - Anterior': {
        technique: 'Peri-tendinous',
        position: 'Supine, knee extended',
        landmark: 'Patellar tendon at inferior pole of patella',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '45 degree angle, tendon-bone interface',
        volume: '0.3-0.5 mL',
        notes: 'For patellar tendonitis, use fenestration technique at tendon origin. Do not inject tendon midsubstance.'
    },
    'Right Knee - Posterior': {
        technique: 'Intra-articular or Peri-tendinous',
        position: 'Prone or supine with knee flexed',
        landmark: 'Popliteal fossa, medial to biceps femoris tendon',
        needle: '27-30G, 1.0"-1.5" (25-38mm)',
        angleDepth: '90 degree angle for intra-articular',
        volume: '0.5-1.0 mL',
        notes: 'HIGH-RISK due to popliteal vessels and tibial nerve. ULTRASOUND GUIDANCE STRONGLY RECOMMENDED.'
    },
    'Right Knee - Medial': {
        technique: 'Peri-tendinous/Peri-ligamentous',
        position: 'Supine, knee slightly flexed',
        landmark: 'Medial joint line for meniscus, medial epicondyle for MCL',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '45 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'For MCL tears, target ligament fibers. For meniscus, target peri-meniscal tissue.'
    },
    'Right Knee - Lateral': {
        technique: 'Peri-tendinous/Peri-ligamentous',
        position: 'Supine, knee slightly flexed',
        landmark: 'Lateral joint line for meniscus, lateral epicondyle for LCL',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '45 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'For LCL tears, target ligament fibers. For IT band friction, target tissue deep to IT band insertion.'
    },
    'Right Shin - Proximal': {
        technique: 'Periosteal/Subcutaneous',
        position: 'Supine',
        landmark: 'Medial tibial border, proximal third',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '15-30 degree angle, shallow periosteal injection',
        volume: '0.2-0.4 mL',
        notes: 'For shin splints, target tissue along medial tibial border. Avoid anterior compartment vessels.'
    },
    'Right Shin - Distal': {
        technique: 'Periosteal/Subcutaneous',
        position: 'Supine',
        landmark: 'Medial tibial border, distal third',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '15-30 degree angle, shallow periosteal injection',
        volume: '0.2-0.4 mL',
        notes: 'For distal shin splints or stress fractures. Use multiple shallow injections along painful area.'
    },
    'Right Calf - Proximal (Gastrocnemius)': {
        technique: 'Intramuscular (IM)',
        position: 'Prone',
        landmark: 'Proximal gastrocnemius muscle belly',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'For tennis leg (gastrocnemius strain), target muscle-tendon junction. Avoid sural nerve.'
    },
    'Right Calf - Distal (Soleus)': {
        technique: 'Intramuscular (IM)',
        position: 'Prone',
        landmark: 'Distal soleus muscle, deep to gastrocnemius',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'Soleus is deep to gastrocnemius. May require slightly deeper injection.'
    },
    'Right Ankle - Medial': {
        technique: 'Peri-ligamentous',
        position: 'Supine, ankle neutral',
        landmark: 'Medial malleolus and deltoid ligament complex',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle, shallow',
        volume: '0.1-0.3 mL',
        notes: 'For medial ankle sprains, target ligament fibers around medial malleolus. Avoid posterior tibial neurovascular bundle.'
    },
    'Right Ankle - Lateral': {
        technique: 'Peri-ligamentous',
        position: 'Supine, ankle neutral',
        landmark: 'Lateral malleolus and ATFL/CFL ligaments',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle, shallow',
        volume: '0.1-0.3 mL',
        notes: 'For lateral ankle sprains, target anterior talofibular ligament and calcaneofibular ligament.'
    },
    'Right Heel': {
        technique: 'Peri-tendinous/Peri-fascial',
        position: 'Prone or lateral decubitus',
        landmark: 'Medial calcaneal tubercle for plantar fasciitis, Achilles tendon insertion for Achilles tendonitis',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '45 degree angle from medial approach for plantar fascia',
        volume: '0.2-0.4 mL',
        notes: 'For plantar fasciitis, approach from medial side. For Achilles issues, target paratenon, not tendon itself.'
    },
    'Right Foot - Midfoot': {
        technique: 'Subcutaneous (SC) or Peri-ligamentous',
        position: 'Supine',
        landmark: 'Dorsal midfoot, avoiding extensor tendons',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle, very shallow',
        volume: '0.1-0.2 mL',
        notes: 'Dorsal approach preferred. For Lisfranc injuries, target ligamentous structures. Avoid dorsal pedis artery.'
    },
    'Right Foot - Forefoot': {
        technique: 'Subcutaneous (SC)',
        position: 'Supine',
        landmark: 'Dorsal forefoot, metatarsal heads',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle, very shallow',
        volume: '0.1-0.2 mL',
        notes: 'For metatarsal stress fractures or turf toe. Dorsal approach between metatarsals.'
    },
    // Left side procedures (mirror of right side)
    'Left Anterior Deltoid': {
        technique: 'Intramuscular (IM) or Peri-tendinous',
        position: 'Seated or supine',
        landmark: 'Anterior deltoid muscle belly or anterior shoulder tendon',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '90 degree angle for muscle, 45 degrees for tendon',
        volume: '0.3-0.5 mL',
        notes: 'Classic deltoid IM site. For rotator cuff issues, target peri-tendinous tissue.'
    },
    'Left Lateral Deltoid': {
        technique: 'Intramuscular (IM)',
        position: 'Seated or supine',
        landmark: 'Lateral deltoid muscle, 2-3 finger widths below acromion',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '90 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'Standard deltoid injection site. Avoid axillary nerve in posterior deltoid.'
    },
    'Left Posterior Deltoid': {
        technique: 'Intramuscular (IM) or Peri-tendinous',
        position: 'Prone or seated leaning forward',
        landmark: 'Posterior deltoid muscle or posterior rotator cuff tendons',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '90 degree angle for muscle, 45 degrees for tendon',
        volume: '0.3-0.5 mL',
        notes: 'For posterior rotator cuff tears, target peri-tendinous tissue around infraspinatus and teres minor.'
    },
    'Left Bicep - Proximal': {
        technique: 'Intramuscular (IM)',
        position: 'Seated with arm supported',
        landmark: 'Proximal biceps brachii muscle belly',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'For proximal biceps tendonitis, target muscle-tendon junction. Avoid neurovascular bundle.'
    },
    'Left Bicep - Distal': {
        technique: 'Peri-tendinous - HIGH RISK',
        position: 'Supine, arm extended and supinated',
        landmark: 'Area around distal biceps tendon at elbow crease',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '45 degree angle, shallow',
        volume: '0.1-0.3 mL',
        notes: 'HIGH-RISK AREA due to brachial artery and median nerve. ULTRASOUND GUIDANCE STRONGLY RECOMMENDED.'
    },
    'Left Tricep - Lateral Head': {
        technique: 'Intramuscular (IM)',
        position: 'Prone or seated with arm flexed',
        landmark: 'Lateral head of triceps brachii muscle',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'Target muscle belly of lateral triceps head. Avoid radial nerve in spiral groove.'
    },
    'Left Tricep - Long Head': {
        technique: 'Intramuscular (IM)',
        position: 'Prone or seated with arm flexed',
        landmark: 'Long head of triceps brachii muscle',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'For triceps tendonitis, target muscle-tendon junction near axilla.'
    },
    'Left Elbow': {
        technique: 'Peri-tendinous',
        position: 'Seated, elbow flexed 90 degrees',
        landmark: 'Lateral epicondyle for tennis elbow, medial epicondyle for golfer\'s elbow',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle to skin, fenestration technique',
        volume: '0.2-0.4 mL',
        notes: 'Use peppering/fenestration technique for tendinopathy. Do not inject directly into tendon body.'
    },
    'Left Forearm - Proximal Anterior': {
        technique: 'Intramuscular (IM)',
        position: 'Seated, arm supinated',
        landmark: 'Flexor-pronator muscle group',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '45-90 degree angle',
        volume: '0.2-0.4 mL',
        notes: 'Avoid median nerve and brachial artery. Target muscle bellies only.'
    },
    'Left Forearm - Distal Anterior': {
        technique: 'Subcutaneous (SC) or Superficial IM',
        position: 'Seated, arm supinated',
        landmark: 'Distal forearm flexors',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '45 degree angle',
        volume: '0.1-0.3 mL',
        notes: 'Multiple superficial nerves and vessels. Use caution with depth.'
    },
    'Left Forearm - Proximal Posterior': {
        technique: 'Intramuscular (IM)',
        position: 'Seated, arm pronated',
        landmark: 'Extensor muscle group',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '45-90 degree angle',
        volume: '0.2-0.4 mL',
        notes: 'Target extensor muscle bellies. Avoid posterior interosseous nerve.'
    },
    'Left Forearm - Distal Posterior': {
        technique: 'Subcutaneous (SC) or Superficial IM',
        position: 'Seated, arm pronated',
        landmark: 'Distal forearm extensors',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '45 degree angle',
        volume: '0.1-0.3 mL',
        notes: 'Multiple superficial structures. Use shallow injection technique.'
    },
    'Left Wrist': {
        technique: 'Subcutaneous (SC) or Peri-tendinous',
        position: 'Seated, wrist neutral',
        landmark: 'Area of maximal tenderness, avoiding flexor retinaculum',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-45 degree angle, very shallow',
        volume: '0.1-0.2 mL',
        notes: 'Avoid carpal tunnel and ulnar artery. For carpal tunnel syndrome, subcutaneous injection only.'
    },
    'Left Hand': {
        technique: 'Subcutaneous (SC)',
        position: 'Seated, hand relaxed',
        landmark: 'Dorsal hand surface, avoiding veins and tendons',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle, very shallow',
        volume: '0.1-0.2 mL',
        notes: 'Dorsal approach preferred. Avoid palmar surface with digital nerves and arteries.'
    },
    'Left Hip Flexor': {
        technique: 'Intramuscular (IM) - HIGH RISK',
        position: 'Supine',
        landmark: 'Iliopsoas muscle, below inguinal ligament',
        needle: '30G, 1.0" (25mm)',
        angleDepth: '90 degree angle, deep IM',
        volume: '0.3-0.5 mL',
        notes: 'HIGH-RISK due to femoral nerve and artery. ULTRASOUND GUIDANCE RECOMMENDED. ASPIRATE carefully.'
    },
    'Left Glute - Superior': {
        technique: 'Intramuscular (IM)',
        position: 'Lateral decubitus (on side)',
        landmark: 'Gluteus medius muscle, ventrogluteal site',
        needle: '25-27G, 1.5" (38mm)',
        angleDepth: '90 degree angle, deep IM',
        volume: '0.5-1.0 mL',
        notes: 'Ventrogluteal site is safest. Avoid sciatic nerve. ASPIRATE before injection.'
    },
    'Left Glute - Inferior': {
        technique: 'Intramuscular (IM)',
        position: 'Lateral decubitus or prone',
        landmark: 'Gluteus maximus muscle, upper outer quadrant',
        needle: '25-27G, 1.5" (38mm)',
        angleDepth: '90 degree angle, deep IM',
        volume: '0.5-1.0 mL',
        notes: 'Use upper outer quadrant only. Avoid sciatic nerve. ASPIRATE before injection.'
    },
    'Left Quad - Proximal': {
        technique: 'Intramuscular (IM)',
        position: 'Supine, leg relaxed',
        landmark: 'Proximal quadriceps muscle, vastus lateralis',
        needle: '25-27G, 1.0" (25mm)',
        angleDepth: '90 degree angle',
        volume: '0.5-1.0 mL',
        notes: 'Vastus lateralis is preferred site. Avoid femoral triangle.'
    },
    'Left Quad - Distal': {
        technique: 'Intramuscular (IM)',
        position: 'Supine, leg relaxed',
        landmark: 'Distal quadriceps muscle',
        needle: '25-27G, 1.0" (25mm)',
        angleDepth: '90 degree angle',
        volume: '0.5-1.0 mL',
        notes: 'Target vastus medialis or lateralis. Stay proximal to knee joint.'
    },
    'Left Hamstring - Proximal': {
        technique: 'Intramuscular (IM)',
        position: 'Prone',
        landmark: 'Proximal hamstring muscles at ischial tuberosity',
        needle: '25-27G, 1.0"-1.5" (25-38mm)',
        angleDepth: '90 degree angle',
        volume: '0.5-1.0 mL',
        notes: 'For proximal hamstring tears, target muscle-tendon junction. Avoid sciatic nerve.'
    },
    'Left Hamstring - Distal': {
        technique: 'Intramuscular (IM)',
        position: 'Prone',
        landmark: 'Distal hamstring muscles',
        needle: '25-27G, 1.0" (25mm)',
        angleDepth: '90 degree angle',
        volume: '0.5-1.0 mL',
        notes: 'Target semitendinosus, semimembranosus, biceps femoris. Avoid popliteal fossa.'
    },
    'Left IT Band': {
        technique: 'Peri-tendinous/Subfascial',
        position: 'Lateral decubitus (affected side up)',
        landmark: 'IT band along lateral thigh, proximal to lateral femoral condyle',
        needle: '30G, 1.0" (25mm)',
        angleDepth: '45-90 degree angle, subfascial injection',
        volume: '0.3-0.5 mL',
        notes: 'Target tissue deep to IT band, not the band itself. Multiple penetration technique may be used.'
    },
    'Left Knee - Anterior': {
        technique: 'Peri-tendinous',
        position: 'Supine, knee extended',
        landmark: 'Patellar tendon at inferior pole of patella',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '45 degree angle, tendon-bone interface',
        volume: '0.3-0.5 mL',
        notes: 'For patellar tendonitis, use fenestration technique at tendon origin. Do not inject tendon midsubstance.'
    },
    'Left Knee - Posterior': {
        technique: 'Intra-articular or Peri-tendinous',
        position: 'Prone or supine with knee flexed',
        landmark: 'Popliteal fossa, medial to biceps femoris tendon',
        needle: '27-30G, 1.0"-1.5" (25-38mm)',
        angleDepth: '90 degree angle for intra-articular',
        volume: '0.5-1.0 mL',
        notes: 'HIGH-RISK due to popliteal vessels and tibial nerve. ULTRASOUND GUIDANCE STRONGLY RECOMMENDED.'
    },
    'Left Knee - Medial': {
        technique: 'Peri-tendinous/Peri-ligamentous',
        position: 'Supine, knee slightly flexed',
        landmark: 'Medial joint line for meniscus, medial epicondyle for MCL',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '45 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'For MCL tears, target ligament fibers. For meniscus, target peri-meniscal tissue.'
    },
    'Left Knee - Lateral': {
        technique: 'Peri-tendinous/Peri-ligamentous',
        position: 'Supine, knee slightly flexed',
        landmark: 'Lateral joint line for meniscus, lateral epicondyle for LCL',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '45 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'For LCL tears, target ligament fibers. For IT band friction, target tissue deep to IT band insertion.'
    },
    'Left Shin - Proximal': {
        technique: 'Periosteal/Subcutaneous',
        position: 'Supine',
        landmark: 'Medial tibial border, proximal third',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '15-30 degree angle, shallow periosteal injection',
        volume: '0.2-0.4 mL',
        notes: 'For shin splints, target tissue along medial tibial border. Avoid anterior compartment vessels.'
    },
    'Left Shin - Distal': {
        technique: 'Periosteal/Subcutaneous',
        position: 'Supine',
        landmark: 'Medial tibial border, distal third',
        needle: '30G, 0.5" (13mm)',
        angleDepth: '15-30 degree angle, shallow periosteal injection',
        volume: '0.2-0.4 mL',
        notes: 'For distal shin splints or stress fractures. Use multiple shallow injections along painful area.'
    },
    'Left Calf - Proximal (Gastrocnemius)': {
        technique: 'Intramuscular (IM)',
        position: 'Prone',
        landmark: 'Proximal gastrocnemius muscle belly',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'For tennis leg (gastrocnemius strain), target muscle-tendon junction. Avoid sural nerve.'
    },
    'Left Calf - Distal (Soleus)': {
        technique: 'Intramuscular (IM)',
        position: 'Prone',
        landmark: 'Distal soleus muscle, deep to gastrocnemius',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '90 degree angle',
        volume: '0.3-0.5 mL',
        notes: 'Soleus is deep to gastrocnemius. May require slightly deeper injection.'
    },
    'Left Ankle - Medial': {
        technique: 'Peri-ligamentous',
        position: 'Supine, ankle neutral',
        landmark: 'Medial malleolus and deltoid ligament complex',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle, shallow',
        volume: '0.1-0.3 mL',
        notes: 'For medial ankle sprains, target ligament fibers around medial malleolus. Avoid posterior tibial neurovascular bundle.'
    },
    'Left Ankle - Lateral': {
        technique: 'Peri-ligamentous',
        position: 'Supine, ankle neutral',
        landmark: 'Lateral malleolus and ATFL/CFL ligaments',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle, shallow',
        volume: '0.1-0.3 mL',
        notes: 'For lateral ankle sprains, target anterior talofibular ligament and calcaneofibular ligament.'
    },
    'Left Heel': {
        technique: 'Peri-tendinous/Peri-fascial',
        position: 'Prone or lateral decubitus',
        landmark: 'Medial calcaneal tubercle for plantar fasciitis, Achilles tendon insertion for Achilles tendonitis',
        needle: '30G, 0.5"-1.0" (13-25mm)',
        angleDepth: '45 degree angle from medial approach for plantar fascia',
        volume: '0.2-0.4 mL',
        notes: 'For plantar fasciitis, approach from medial side. For Achilles issues, target paratenon, not tendon itself.'
    },
    'Left Foot - Midfoot': {
        technique: 'Subcutaneous (SC) or Peri-ligamentous',
        position: 'Supine',
        landmark: 'Dorsal midfoot, avoiding extensor tendons',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle, very shallow',
        volume: '0.1-0.2 mL',
        notes: 'Dorsal approach preferred. For Lisfranc injuries, target ligamentous structures. Avoid dorsal pedis artery.'
    },
    'Left Foot - Forefoot': {
        technique: 'Subcutaneous (SC)',
        position: 'Supine',
        landmark: 'Dorsal forefoot, metatarsal heads',
        needle: '31G, 0.5" (8mm)',
        angleDepth: '15-30 degree angle, very shallow',
        volume: '0.1-0.2 mL',
        notes: 'For metatarsal stress fractures or turf toe. Dorsal approach between metatarsals.'
    }
};

// Make regions and related variables globally accessible
window.regions = regions;
window.defaultColor = defaultColor;
window.highlightColor = highlightColor;
window.regionTolerance = regionTolerance;

// Signal that regions data is ready (after all data is defined)
// Use setTimeout to ensure initState is initialized in init.js first
(function signalRegionsReady() {
    if (typeof initState !== 'undefined') {
        initState.regionsReady = true;
        console.log('✅ Regions data loaded');
        if (typeof checkReadiness === 'function') {
            checkReadiness();
        }
    } else {
        // If initState isn't ready yet, try again after a short delay
        setTimeout(signalRegionsReady, 50);
    }
})();

})(); // End of initializeRegions IIFE