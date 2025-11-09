// ---- ANATOMICAL REGION DEFINITIONS (Bounding Boxes) ----
const defaultColor = 0x808080;
const highlightColor = 0xef4444;
const regionTolerance = 0.5;             // extra click radius
const highlightDuration = 5000;          // sphere lifetime in milliseconds

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
    'Head': ['Concussion', 'Skull fracture'],
    'Neck': ['Whiplash', 'Cervical strain'],
    'Upper Chest': ['Pectoralis major strain', 'Costochondritis'],
    'Lower Chest': ['Pectoralis major strain', 'Costochondritis'],
    'Upper Abs': ['Abdominal muscle strain', 'Hernia'],
    'Lower Abs': ['Abdominal muscle strain', 'Hernia'],
    'Upper Back': ['Trapezius strain', 'Rhomboid strain'],
    'Mid Back': ['Thoracic strain'],
    'Lower Back': ['Lumbar strain', 'Herniated disc'],
    'Right Anterior Deltoid': ['Rotator cuff tear', 'Shoulder impingement', 'Deltoid strain'],
    'Right Lateral Deltoid': ['Rotator cuff tear', 'Shoulder impingement', 'Deltoid strain'],
    'Right Posterior Deltoid': ['Rotator cuff tear', 'Shoulder impingement', 'Deltoid strain'],
    'Right Bicep - Proximal': ['Proximal biceps tendon rupture', 'Biceps tendonitis'],
    'Right Bicep - Distal': ['Distal biceps tendon rupture'],
    'Right Tricep - Lateral Head': ['Triceps strain', 'Triceps tendonitis'],
    'Right Tricep - Long Head': ['Triceps strain', 'Triceps tendonitis'],
    'Right Elbow': ['Tennis elbow (lateral epicondylitis)', "Golfer's elbow (medial epicondylitis)"],
    'Right Forearm - Proximal Anterior': ['Forearm strain', 'Compartment syndrome'],
    'Right Forearm - Distal Anterior': ['Forearm strain', 'Compartment syndrome'],
    'Right Forearm - Proximal Posterior': ['Forearm strain', 'Compartment syndrome'],
    'Right Forearm - Distal Posterior': ['Forearm strain', 'Compartment syndrome'],
    'Right Wrist': ['Wrist sprain', 'Carpal tunnel syndrome'],
    'Right Hand': ['Finger fracture', "Boxer's fracture"],
    'Right Hip Flexor': ['Hip flexor strain', 'Iliopsoas tendinopathy'],
    'Right Glute - Superior': ['Gluteus medius tear', 'Piriformis syndrome'],
    'Right Glute - Inferior': ['Gluteus maximus strain'],
    'Right Quad - Proximal': ['Quadriceps strain', 'Quadriceps tendonitis'],
    'Right Quad - Distal': ['Quadriceps strain', 'Quadriceps tendonitis'],
    'Right Hamstring - Proximal': ['Hamstring strain', 'Ischial tuberosity avulsion'],
    'Right Hamstring - Distal': ['Hamstring tear'],
    'Right IT Band': ['IT band syndrome', 'Lateral knee pain'],
    'Right Knee - Anterior': ["Patellar tendonitis (jumper's knee)", 'ACL tear'],
    'Right Knee - Posterior': ['PCL tear', "Baker's cyst"],
    'Right Knee - Medial': ['MCL tear', 'Meniscus tear'],
    'Right Knee - Lateral': ['LCL tear', 'IT band friction'],
    'Right Shin - Proximal': ['Shin splints (medial tibial stress syndrome)', 'Stress fracture'],
    'Right Shin - Distal': ['Shin splints (medial tibial stress syndrome)', 'Stress fracture'],
    'Right Calf - Proximal (Gastrocnemius)': ['Gastrocnemius strain', 'Tennis leg'],
    'Right Calf - Distal (Soleus)': ['Soleus strain'],
    'Right Ankle - Medial': ['Medial ankle sprain', 'Deltoid ligament tear'],
    'Right Ankle - Lateral': ['Lateral ankle sprain', 'ATFL tear'],
    'Right Heel': ['Achilles tendonitis', 'Plantar fasciitis'],
    'Right Foot - Midfoot': ['Lisfranc injury', 'Stress fracture'],
    'Right Foot - Forefoot': ['Metatarsal stress fracture', 'Turf toe'],
    'Left Anterior Deltoid': ['Rotator cuff tear', 'Shoulder impingement', 'Deltoid strain'],
    'Left Lateral Deltoid': ['Rotator cuff tear', 'Shoulder impingement', 'Deltoid strain'],
    'Left Posterior Deltoid': ['Rotator cuff tear', 'Shoulder impingement', 'Deltoid strain'],
    'Left Bicep - Proximal': ['Proximal biceps tendon rupture', 'Biceps tendonitis'],
    'Left Bicep - Distal': ['Distal biceps tendon rupture'],
    'Left Tricep - Lateral Head': ['Triceps strain', 'Triceps tendonitis'],
    'Left Tricep - Long Head': ['Triceps strain', 'Triceps tendonitis'],
    'Left Elbow': ['Tennis elbow (lateral epicondylitis)', "Golfer's elbow (medial epicondylitis)"],
    'Left Forearm - Proximal Anterior': ['Forearm strain', 'Compartment syndrome'],
    'Left Forearm - Distal Anterior': ['Forearm strain', 'Compartment syndrome'],
    'Left Forearm - Proximal Posterior': ['Forearm strain', 'Compartment syndrome'],
    'Left Forearm - Distal Posterior': ['Forearm strain', 'Compartment syndrome'],
    'Left Wrist': ['Wrist sprain', 'Carpal tunnel syndrome'],
    'Left Hand': ['Finger fracture', "Boxer's fracture"],
    'Left Hip Flexor': ['Hip flexor strain', 'Iliopsoas tendinopathy'],
    'Left Glute - Superior': ['Gluteus medius tear', 'Piriformis syndrome'],
    'Left Glute - Inferior': ['Gluteus maximus strain'],
    'Left Quad - Proximal': ['Quadriceps strain', 'Quadriceps tendonitis'],
    'Left Quad - Distal': ['Quadriceps strain', 'Quadriceps tendonitis'],
    'Left Hamstring - Proximal': ['Hamstring strain', 'Ischial tuberosity avulsion'],
    'Left Hamstring - Distal': ['Hamstring tear'],
    'Left IT Band': ['IT band syndrome', 'Lateral knee pain'],
    'Left Knee - Anterior': ["Patellar tendonitis (jumper's knee)", 'ACL tear'],
    'Left Knee - Posterior': ['PCL tear', "Baker's cyst"],
    'Left Knee - Medial': ['MCL tear', 'Meniscus tear'],
    'Left Knee - Lateral': ['LCL tear', 'IT band friction'],
    'Left Shin - Proximal': ['Shin splints (medial tibial stress syndrome)', 'Stress fracture'],
    'Left Shin - Distal': ['Shin splints (medial tibial stress syndrome)', 'Stress fracture'],
    'Left Calf - Proximal (Gastrocnemius)': ['Gastrocnemius strain', 'Tennis leg'],
    'Left Calf - Distal (Soleus)': ['Soleus strain'],
    'Left Ankle - Medial': ['Medial ankle sprain', 'Deltoid ligament tear'],
    'Left Ankle - Lateral': ['Lateral ankle sprain', 'ATFL tear'],
    'Left Heel': ['Achilles tendonitis', 'Plantar fasciitis'],
    'Left Foot - Midfoot': ['Lisfranc injury', 'Stress fracture'],
    'Left Foot - Forefoot': ['Metatarsal stress fracture', 'Turf toe']
};