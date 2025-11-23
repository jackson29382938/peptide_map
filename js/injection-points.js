// ---- OPTIMAL INJECTION POINT DEFINITIONS ----
// Wait for THREE.js to be loaded before initializing injection points
(function initializeInjectionPoints() {
    // Check if THREE is available
    if (typeof THREE === 'undefined') {
        // Wait for threeDepsReady event
        if (window.threeDepsReady) {
            // THREE should be available now, try again
            setTimeout(initializeInjectionPoints, 50);
        } else {
            window.addEventListener('threeDepsReady', () => {
                setTimeout(initializeInjectionPoints, 50);
            }, { once: true });
        }
        return;
    }

// Each body region can have 2-4 optimal injection points
// Each point specifies: position (x,y,z), size, type (general or injury-specific)

// Color definitions for injection points
const INJECTION_COLORS = {
    GENERAL: 0x2d7a3e,      // Medium green - general injection sites
    INJURY_SPECIFIC: 0x1a4d2e  // Very dark green - injury-specific targeted sites
};

// Size guidelines for injection points
const INJECTION_SIZES = {
    SMALL: 0.25,    // Precise points (e.g., knee soft tissue, specific tendons)
    MEDIUM: 0.4,    // Moderate areas (e.g., muscle belly sections)
    LARGE: 0.6      // Broader areas (e.g., large muscle groups)
};

/**
 * Injection point data structure:
 * {
 *   position: THREE.Vector3 - 3D coordinates of injection point
 *   size: number - sphere radius (use INJECTION_SIZES constants)
 *   type: string - 'general' or 'injury_specific' (determines color)
 *   targetInjuries: array - list of injuries this point targets
 *   notes: string - additional guidance for this injection point
 * }
 */

const injectionPoints = {
    // ===== KNEE REGIONS =====
    'Right Knee': [
        {
            position: new THREE.Vector3(-2.2, -2.8, 0.8),  // Medial soft tissue
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['MCL sprain', 'Medial meniscus tear', 'Pes anserine bursitis'],
            notes: 'Medial knee soft tissue - target MCL and medial compartment'
        },
        {
            position: new THREE.Vector3(-1.6, -2.8, 0.8),  // Lateral soft tissue
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['LCL sprain', 'Lateral meniscus tear', 'IT band syndrome'],
            notes: 'Lateral knee soft tissue - target LCL and lateral compartment'
        },
        {
            position: new THREE.Vector3(-1.9, -2.5, 1.0),  // Anterior/patellar region
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Patellar tendonitis', 'Quadriceps tendon strain'],
            notes: 'Patellar tendon and anterior knee'
        }
    ],

    'Left Knee': [
        {
            position: new THREE.Vector3(2.2, -2.8, 0.8),   // Medial soft tissue
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['MCL sprain', 'Medial meniscus tear', 'Pes anserine bursitis'],
            notes: 'Medial knee soft tissue - target MCL and medial compartment'
        },
        {
            position: new THREE.Vector3(1.6, -2.8, 0.8),   // Lateral soft tissue
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['LCL sprain', 'Lateral meniscus tear', 'IT band syndrome'],
            notes: 'Lateral knee soft tissue - target LCL and lateral compartment'
        },
        {
            position: new THREE.Vector3(1.9, -2.5, 1.0),   // Anterior/patellar region
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Patellar tendonitis', 'Quadriceps tendon strain'],
            notes: 'Patellar tendon and anterior knee'
        }
    ],

    // ===== ABDOMINAL REGIONS =====
    'Upper Abs': [
        {
            position: new THREE.Vector3(-0.8, 3.5, 0.8),   // Left upper abdomen
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Rectus abdominis strain', 'Core weakness'],
            notes: 'Left upper rectus abdominis - SubQ or IM injection'
        },
        {
            position: new THREE.Vector3(0.8, 3.5, 0.8),    // Right upper abdomen
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Rectus abdominis strain', 'Core weakness'],
            notes: 'Right upper rectus abdominis - SubQ or IM injection'
        }
    ],

    'Lower Abs': [
        {
            position: new THREE.Vector3(-0.7, 2.0, 0.7),   // Left lower abdomen
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Lower abdominal strain', 'Hip flexor connection'],
            notes: 'Left lower rectus abdominis - SubQ injection preferred'
        },
        {
            position: new THREE.Vector3(0.7, 2.0, 0.7),    // Right lower abdomen
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Lower abdominal strain', 'Hip flexor connection'],
            notes: 'Right lower rectus abdominis - SubQ injection preferred'
        }
    ],

    // ===== QUADRICEPS REGIONS =====
    'Right Quad - Distal': [
        {
            position: new THREE.Vector3(-2.1, -1.5, 0.5),  // Distal VMO
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['VMO weakness', 'Patellar tracking issues', 'Distal quad strain'],
            notes: 'Vastus medialis obliquus (VMO) - distal portion'
        },
        {
            position: new THREE.Vector3(-1.7, -1.5, 0.8),  // Distal rectus femoris
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Rectus femoris strain', 'Quad tendon issues'],
            notes: 'Distal rectus femoris - central quadriceps'
        },
        {
            position: new THREE.Vector3(-1.3, -1.5, 0.5),  // Distal vastus lateralis
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Vastus lateralis strain', 'IT band connection'],
            notes: 'Distal vastus lateralis - lateral quadriceps'
        }
    ],

    'Right Quad - Proximal': [
        {
            position: new THREE.Vector3(-2.0, 0.2, 0.4),   // Proximal VMO
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Hip flexor strain', 'Proximal quad strain'],
            notes: 'Proximal vastus medialis - upper inner thigh'
        },
        {
            position: new THREE.Vector3(-1.7, 0.2, 0.7),   // Proximal rectus femoris
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Hip flexor injury', 'Rectus femoris tear'],
            notes: 'Proximal rectus femoris - hip flexor connection'
        },
        {
            position: new THREE.Vector3(-1.4, 0.2, 0.4),   // Proximal vastus lateralis
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Tensor fasciae latae', 'Proximal VL strain'],
            notes: 'Proximal vastus lateralis - upper outer thigh'
        }
    ],

    'Left Quad - Distal': [
        {
            position: new THREE.Vector3(2.1, -1.5, 0.5),   // Distal VMO
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['VMO weakness', 'Patellar tracking issues', 'Distal quad strain'],
            notes: 'Vastus medialis obliquus (VMO) - distal portion'
        },
        {
            position: new THREE.Vector3(1.7, -1.5, 0.8),   // Distal rectus femoris
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Rectus femoris strain', 'Quad tendon issues'],
            notes: 'Distal rectus femoris - central quadriceps'
        },
        {
            position: new THREE.Vector3(1.3, -1.5, 0.5),   // Distal vastus lateralis
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Vastus lateralis strain', 'IT band connection'],
            notes: 'Distal vastus lateralis - lateral quadriceps'
        }
    ],

    'Left Quad - Proximal': [
        {
            position: new THREE.Vector3(2.0, 0.2, 0.4),    // Proximal VMO
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Hip flexor strain', 'Proximal quad strain'],
            notes: 'Proximal vastus medialis - upper inner thigh'
        },
        {
            position: new THREE.Vector3(1.7, 0.2, 0.7),    // Proximal rectus femoris
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Hip flexor injury', 'Rectus femoris tear'],
            notes: 'Proximal rectus femoris - hip flexor connection'
        },
        {
            position: new THREE.Vector3(1.4, 0.2, 0.4),    // Proximal vastus lateralis
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Tensor fasciae latae', 'Proximal VL strain'],
            notes: 'Proximal vastus lateralis - upper outer thigh'
        }
    ],

    // ===== SHOULDER REGIONS =====
    'Right Anterior Deltoid': [
        {
            position: new THREE.Vector3(-2.5, 6.2, 0.3),   // Anterior deltoid belly
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Anterior deltoid strain', 'Shoulder impingement'],
            notes: 'Anterior deltoid - front shoulder muscle'
        },
        {
            position: new THREE.Vector3(-2.6, 6.0, 0.5),   // Rotator cuff connection
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Rotator cuff tendinitis', 'Supraspinatus tear'],
            notes: 'Rotator cuff insertion area - precise placement needed'
        }
    ],

    'Left Anterior Deltoid': [
        {
            position: new THREE.Vector3(2.5, 6.2, 0.3),    // Anterior deltoid belly
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Anterior deltoid strain', 'Shoulder impingement'],
            notes: 'Anterior deltoid - front shoulder muscle'
        },
        {
            position: new THREE.Vector3(2.6, 6.0, 0.5),    // Rotator cuff connection
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Rotator cuff tendinitis', 'Supraspinatus tear'],
            notes: 'Rotator cuff insertion area - precise placement needed'
        }
    ],

    // ===== LOWER LEG REGIONS =====
    'Right Calf - Gastrocnemius': [
        {
            position: new THREE.Vector3(-1.9, -4.2, -0.3), // Medial gastrocnemius
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Medial gastrocnemius strain', 'Calf tear'],
            notes: 'Medial head of gastrocnemius - common strain site'
        },
        {
            position: new THREE.Vector3(-1.7, -4.2, -0.3), // Lateral gastrocnemius
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Lateral gastrocnemius strain', 'Calf tear'],
            notes: 'Lateral head of gastrocnemius'
        },
        {
            position: new THREE.Vector3(-1.8, -3.8, -0.2), // Upper calf
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['General calf strain', 'Muscle tightness'],
            notes: 'Upper gastrocnemius - broader injection area'
        }
    ],

    'Left Calf - Gastrocnemius': [
        {
            position: new THREE.Vector3(1.9, -4.2, -0.3),  // Medial gastrocnemius
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Medial gastrocnemius strain', 'Calf tear'],
            notes: 'Medial head of gastrocnemius - common strain site'
        },
        {
            position: new THREE.Vector3(1.7, -4.2, -0.3),  // Lateral gastrocnemius
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Lateral gastrocnemius strain', 'Calf tear'],
            notes: 'Lateral head of gastrocnemius'
        },
        {
            position: new THREE.Vector3(1.8, -3.8, -0.2),  // Upper calf
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['General calf strain', 'Muscle tightness'],
            notes: 'Upper gastrocnemius - broader injection area'
        }
    ],

    // ===== BACK REGIONS =====
    'Lower Back': [
        {
            position: new THREE.Vector3(-0.8, 1.8, -0.8),  // Left erector spinae
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Lower back strain', 'Erector spinae pain'],
            notes: 'Left lower erector spinae'
        },
        {
            position: new THREE.Vector3(0.8, 1.8, -0.8),   // Right erector spinae
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Lower back strain', 'Erector spinae pain'],
            notes: 'Right lower erector spinae'
        },
        {
            position: new THREE.Vector3(-0.5, 1.5, -0.6),  // Left quadratus lumborum
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['QL strain', 'Lower back spasm'],
            notes: 'Left quadratus lumborum - lateral lower back'
        },
        {
            position: new THREE.Vector3(0.5, 1.5, -0.6),   // Right quadratus lumborum
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['QL strain', 'Lower back spasm'],
            notes: 'Right quadratus lumborum - lateral lower back'
        }
    ],

    // ===== HEAD & NECK =====
    'Head': [
        {
            position: new THREE.Vector3(-0.6, 8.0, 0.3),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Concussion recovery', 'Post-concussion syndrome', 'Chronic headaches'],
            notes: 'Left temporal region - subcutaneous only, avoid major vessels'
        },
        {
            position: new THREE.Vector3(0.6, 8.0, 0.3),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Concussion recovery', 'Post-concussion syndrome', 'Chronic headaches'],
            notes: 'Right temporal region - subcutaneous only, avoid major vessels'
        }
    ],

    'Neck': [
        {
            position: new THREE.Vector3(-0.4, 6.5, -0.3),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Whiplash', 'Cervical strain', 'Neck sprain'],
            notes: 'Left posterior cervical muscles - avoid anterior triangle'
        },
        {
            position: new THREE.Vector3(0.4, 6.5, -0.3),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Whiplash', 'Cervical strain', 'Neck sprain'],
            notes: 'Right posterior cervical muscles - avoid anterior triangle'
        },
        {
            position: new THREE.Vector3(0.0, 6.3, -0.5),
            size: INJECTION_SIZES.SMALL,
            type: 'general',
            targetInjuries: ['Cervical muscle spasm', 'Facet joint pain'],
            notes: 'Central posterior neck - paravertebral'
        }
    ],

    'Upper Chest': [
        {
            position: new THREE.Vector3(-1.0, 5.8, 0.5),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Pectoralis major strain', 'Intercostal strain'],
            notes: 'Left pectoralis major - upper portion'
        },
        {
            position: new THREE.Vector3(1.0, 5.8, 0.5),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Pectoralis major strain', 'Intercostal strain'],
            notes: 'Right pectoralis major - upper portion'
        }
    ],

    'Lower Chest': [
        {
            position: new THREE.Vector3(-1.2, 4.2, 0.5),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Pectoralis major strain', 'Lower rib injury'],
            notes: 'Left lower pectoralis major'
        },
        {
            position: new THREE.Vector3(1.2, 4.2, 0.5),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Pectoralis major strain', 'Lower rib injury'],
            notes: 'Right lower pectoralis major'
        }
    ],

    'Upper Back': [
        {
            position: new THREE.Vector3(-1.0, 5.5, -0.8),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Trapezius strain', 'Rhomboid strain'],
            notes: 'Left upper trapezius and rhomboids'
        },
        {
            position: new THREE.Vector3(1.0, 5.5, -0.8),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Trapezius strain', 'Rhomboid strain'],
            notes: 'Right upper trapezius and rhomboids'
        }
    ],

    'Mid Back': [
        {
            position: new THREE.Vector3(-0.8, 3.5, -0.8),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Thoracic strain', 'Paraspinal strain'],
            notes: 'Left thoracic paraspinals'
        },
        {
            position: new THREE.Vector3(0.8, 3.5, -0.8),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Thoracic strain', 'Paraspinal strain'],
            notes: 'Right thoracic paraspinals'
        }
    ],

    // ===== RIGHT ARM =====
    'Right Lateral Deltoid': [
        {
            position: new THREE.Vector3(-2.7, 6.2, -0.2),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Deltoid strain', 'Shoulder impingement'],
            notes: 'Lateral deltoid belly - standard IM site'
        },
        {
            position: new THREE.Vector3(-2.6, 6.0, 0.0),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Rotator cuff tear', 'Supraspinatus tendinitis'],
            notes: 'Supraspinatus tendon area'
        }
    ],

    'Right Posterior Deltoid': [
        {
            position: new THREE.Vector3(-2.6, 6.2, -1.0),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Posterior deltoid strain', 'Shoulder impingement'],
            notes: 'Posterior deltoid belly'
        },
        {
            position: new THREE.Vector3(-2.7, 6.0, -1.2),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Infraspinatus tendinitis', 'Teres minor strain'],
            notes: 'Posterior rotator cuff area'
        }
    ],

    'Right Bicep - Proximal': [
        {
            position: new THREE.Vector3(-3.0, 5.4, -0.6),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Proximal biceps tendon rupture', 'Biceps tendonitis'],
            notes: 'Proximal biceps belly'
        },
        {
            position: new THREE.Vector3(-2.9, 5.6, -0.4),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['SLAP lesion', 'Long head biceps tendinopathy'],
            notes: 'Biceps tendon origin area'
        }
    ],

    'Right Bicep - Distal': [
        {
            position: new THREE.Vector3(-3.0, 4.4, -0.8),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Distal biceps tendon rupture', 'Bicep tear'],
            notes: 'Distal biceps belly'
        },
        {
            position: new THREE.Vector3(-3.2, 3.9, -0.9),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Distal biceps tendonitis', 'Partial biceps tear'],
            notes: 'Distal biceps tendon insertion - use caution near vessels'
        }
    ],

    'Right Tricep - Lateral Head': [
        {
            position: new THREE.Vector3(-3.2, 5.0, -1.6),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Triceps strain', 'Lateral head tear'],
            notes: 'Lateral triceps head belly'
        },
        {
            position: new THREE.Vector3(-3.0, 4.7, -1.5),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Triceps tendonitis', 'Triceps insertion tendinopathy'],
            notes: 'Lateral head insertion area'
        }
    ],

    'Right Tricep - Long Head': [
        {
            position: new THREE.Vector3(-3.1, 4.9, -1.7),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Triceps strain', 'Long head tear'],
            notes: 'Long head triceps belly'
        },
        {
            position: new THREE.Vector3(-3.2, 5.5, -1.6),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Triceps rupture', 'Triceps tendon rupture'],
            notes: 'Proximal long head insertion'
        }
    ],

    'Right Elbow': [
        {
            position: new THREE.Vector3(-4.2, 3.5, -0.8),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Tennis elbow (lateral epicondylitis)', 'Extensor tendon injury'],
            notes: 'Lateral epicondyle - tennis elbow site'
        },
        {
            position: new THREE.Vector3(-4.2, 3.4, -0.5),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ["Golfer's elbow (medial epicondylitis)", 'Flexor tendon injury'],
            notes: 'Medial epicondyle - golfer elbow site'
        }
    ],

    'Right Forearm - Proximal Anterior': [
        {
            position: new THREE.Vector3(-4.4, 3.2, -0.5),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Forearm strain', 'Flexor tendinitis'],
            notes: 'Proximal flexor muscle group'
        },
        {
            position: new THREE.Vector3(-4.3, 3.0, -0.4),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Pronator teres syndrome', 'Medial forearm pain'],
            notes: 'Pronator teres area - avoid median nerve'
        }
    ],

    'Right Forearm - Distal Anterior': [
        {
            position: new THREE.Vector3(-4.6, 2.4, -0.5),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Wrist flexor strain', 'Wrist flexor tendonitis'],
            notes: 'Distal flexor tendons'
        },
        {
            position: new THREE.Vector3(-4.7, 2.2, -0.6),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Carpal tunnel syndrome', 'Median nerve compression'],
            notes: 'Proximal to carpal tunnel - SubQ only'
        }
    ],

    'Right Forearm - Proximal Posterior': [
        {
            position: new THREE.Vector3(-4.5, 3.0, -1.2),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Forearm extensor strain', 'Extensor tendinitis'],
            notes: 'Proximal extensor muscle group'
        },
        {
            position: new THREE.Vector3(-4.4, 2.9, -1.3),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Radial tunnel syndrome', 'Posterior interosseous syndrome'],
            notes: 'Radial nerve area - use caution'
        }
    ],

    'Right Forearm - Distal Posterior': [
        {
            position: new THREE.Vector3(-4.8, 2.1, -1.2),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Wrist extensor strain', 'Wrist extensor tendonitis'],
            notes: 'Distal extensor tendons'
        },
        {
            position: new THREE.Vector3(-4.9, 1.9, -1.1),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['De Quervain tenosynovitis', 'Intersection syndrome'],
            notes: 'First dorsal compartment'
        }
    ],

    'Right Wrist': [
        {
            position: new THREE.Vector3(-5.3, 1.4, -0.6),
            size: INJECTION_SIZES.SMALL,
            type: 'general',
            targetInjuries: ['Wrist sprain', 'Wrist tendonitis'],
            notes: 'Dorsal wrist - general injection site'
        },
        {
            position: new THREE.Vector3(-5.2, 1.3, -0.4),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['TFCC tear', 'Scapholunate ligament injury'],
            notes: 'Ulnar-sided wrist pain'
        }
    ],

    'Right Hand': [
        {
            position: new THREE.Vector3(-5.5, 0.8, -0.5),
            size: INJECTION_SIZES.SMALL,
            type: 'general',
            targetInjuries: ['Finger fracture', 'Metacarpal fracture'],
            notes: 'Dorsal hand - metacarpal area'
        },
        {
            position: new THREE.Vector3(-5.4, 0.7, -0.4),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Trigger finger', 'Finger tendon injury'],
            notes: 'Finger flexor tendon sheaths'
        }
    ],

    // ===== LEFT ARM ===== 
    'Left Lateral Deltoid': [
        {
            position: new THREE.Vector3(2.7, 6.2, -0.2),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Deltoid strain', 'Shoulder impingement'],
            notes: 'Lateral deltoid belly - standard IM site'
        },
        {
            position: new THREE.Vector3(2.6, 6.0, 0.0),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Rotator cuff tear', 'Supraspinatus tendinitis'],
            notes: 'Supraspinatus tendon area'
        }
    ],

    'Left Posterior Deltoid': [
        {
            position: new THREE.Vector3(2.6, 6.2, -1.0),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Posterior deltoid strain', 'Shoulder impingement'],
            notes: 'Posterior deltoid belly'
        },
        {
            position: new THREE.Vector3(2.7, 6.0, -1.2),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Infraspinatus tendinitis', 'Teres minor strain'],
            notes: 'Posterior rotator cuff area'
        }
    ],

    'Left Bicep - Proximal': [
        {
            position: new THREE.Vector3(3.0, 5.4, -0.6),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Proximal biceps tendon rupture', 'Biceps tendonitis'],
            notes: 'Proximal biceps belly'
        },
        {
            position: new THREE.Vector3(2.9, 5.6, -0.4),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['SLAP lesion', 'Long head biceps tendinopathy'],
            notes: 'Biceps tendon origin area'
        }
    ],

    'Left Bicep - Distal': [
        {
            position: new THREE.Vector3(3.0, 4.4, -0.8),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Distal biceps tendon rupture', 'Bicep tear'],
            notes: 'Distal biceps belly'
        },
        {
            position: new THREE.Vector3(3.2, 3.9, -0.9),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Distal biceps tendonitis', 'Partial biceps tear'],
            notes: 'Distal biceps tendon insertion - use caution near vessels'
        }
    ],

    'Left Tricep - Lateral Head': [
        {
            position: new THREE.Vector3(3.2, 5.0, -1.6),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Triceps strain', 'Lateral head tear'],
            notes: 'Lateral triceps head belly'
        },
        {
            position: new THREE.Vector3(3.0, 4.7, -1.5),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Triceps tendonitis', 'Triceps insertion tendinopathy'],
            notes: 'Lateral head insertion area'
        }
    ],

    'Left Tricep - Long Head': [
        {
            position: new THREE.Vector3(3.1, 4.9, -1.7),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Triceps strain', 'Long head tear'],
            notes: 'Long head triceps belly'
        },
        {
            position: new THREE.Vector3(3.2, 5.5, -1.6),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Triceps rupture', 'Triceps tendon rupture'],
            notes: 'Proximal long head insertion'
        }
    ],

    'Left Elbow': [
        {
            position: new THREE.Vector3(4.2, 3.5, -0.8),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Tennis elbow (lateral epicondylitis)', 'Extensor tendon injury'],
            notes: 'Lateral epicondyle - tennis elbow site'
        },
        {
            position: new THREE.Vector3(4.2, 3.4, -0.5),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ["Golfer's elbow (medial epicondylitis)", 'Flexor tendon injury'],
            notes: 'Medial epicondyle - golfer elbow site'
        }
    ],

    'Left Forearm - Proximal Anterior': [
        {
            position: new THREE.Vector3(4.4, 3.2, -0.5),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Forearm strain', 'Flexor tendinitis'],
            notes: 'Proximal flexor muscle group'
        },
        {
            position: new THREE.Vector3(4.3, 3.0, -0.4),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Pronator teres syndrome', 'Medial forearm pain'],
            notes: 'Pronator teres area - avoid median nerve'
        }
    ],

    'Left Forearm - Distal Anterior': [
        {
            position: new THREE.Vector3(4.6, 2.4, -0.5),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Wrist flexor strain', 'Wrist flexor tendonitis'],
            notes: 'Distal flexor tendons'
        },
        {
            position: new THREE.Vector3(4.7, 2.2, -0.6),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Carpal tunnel syndrome', 'Median nerve compression'],
            notes: 'Proximal to carpal tunnel - SubQ only'
        }
    ],

    'Left Forearm - Proximal Posterior': [
        {
            position: new THREE.Vector3(4.5, 3.0, -1.2),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Forearm extensor strain', 'Extensor tendinitis'],
            notes: 'Proximal extensor muscle group'
        },
        {
            position: new THREE.Vector3(4.4, 2.9, -1.3),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Radial tunnel syndrome', 'Posterior interosseous syndrome'],
            notes: 'Radial nerve area - use caution'
        }
    ],

    'Left Forearm - Distal Posterior': [
        {
            position: new THREE.Vector3(4.8, 2.1, -1.2),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Wrist extensor strain', 'Wrist extensor tendonitis'],
            notes: 'Distal extensor tendons'
        },
        {
            position: new THREE.Vector3(4.9, 1.9, -1.1),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['De Quervain tenosynovitis', 'Intersection syndrome'],
            notes: 'First dorsal compartment'
        }
    ],

    'Left Wrist': [
        {
            position: new THREE.Vector3(5.3, 1.4, -0.6),
            size: INJECTION_SIZES.SMALL,
            type: 'general',
            targetInjuries: ['Wrist sprain', 'Wrist tendonitis'],
            notes: 'Dorsal wrist - general injection site'
        },
        {
            position: new THREE.Vector3(5.2, 1.3, -0.4),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['TFCC tear', 'Scapholunate ligament injury'],
            notes: 'Ulnar-sided wrist pain'
        }
    ],

    'Left Hand': [
        {
            position: new THREE.Vector3(5.5, 0.8, -0.5),
            size: INJECTION_SIZES.SMALL,
            type: 'general',
            targetInjuries: ['Finger fracture', 'Metacarpal fracture'],
            notes: 'Dorsal hand - metacarpal area'
        },
        {
            position: new THREE.Vector3(5.4, 0.7, -0.4),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Trigger finger', 'Finger tendon injury'],
            notes: 'Finger flexor tendon sheaths'
        }
    ],

    // ===== HIP & GLUTE REGIONS =====
    'Right Hip Flexor': [
        {
            position: new THREE.Vector3(-1.2, 1.3, 0.5),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Hip flexor strain', 'Iliopsoas tendinopathy'],
            notes: 'Iliopsoas muscle - use caution near femoral vessels'
        },
        {
            position: new THREE.Vector3(-1.0, 1.0, 0.7),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Hip labral tear', 'FAI', 'Snapping hip syndrome'],
            notes: 'Hip flexor-labral area - deep injection'
        }
    ],

    'Right Glute - Superior': [
        {
            position: new THREE.Vector3(-1.2, 1.3, -1.1),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Gluteus medius tear', 'Trochanteric bursitis'],
            notes: 'Gluteus medius - ventrogluteal site'
        },
        {
            position: new THREE.Vector3(-1.0, 1.2, -1.0),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Piriformis syndrome', 'Gluteal tendinopathy'],
            notes: 'Deep gluteal region - piriformis area'
        }
    ],

    'Right Glute - Inferior': [
        {
            position: new THREE.Vector3(-1.2, 0.8, -1.1),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Gluteus maximus strain', 'Gluteal muscle tear'],
            notes: 'Gluteus maximus - upper outer quadrant'
        },
        {
            position: new THREE.Vector3(-1.0, 0.6, -1.0),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Proximal hamstring tendinopathy', 'Ischial tuberosity bursitis'],
            notes: 'Hamstring origin area'
        }
    ],

    'Right Hamstring - Proximal': [
        {
            position: new THREE.Vector3(-1.5, 0.5, -1.1),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Hamstring strain', 'Proximal hamstring tear'],
            notes: 'Proximal hamstring belly'
        },
        {
            position: new THREE.Vector3(-1.4, 0.8, -1.0),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Ischial tuberosity avulsion', 'High hamstring tear'],
            notes: 'Ischial tuberosity - hamstring origin'
        }
    ],

    'Right Hamstring - Distal': [
        {
            position: new THREE.Vector3(-1.5, -1.8, -1.1),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Hamstring tear', 'Distal hamstring strain'],
            notes: 'Distal hamstring belly'
        },
        {
            position: new THREE.Vector3(-1.6, -3.0, -1.0),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Popliteal tendonitis', 'Knee flexor injury'],
            notes: 'Distal hamstring insertion near knee'
        }
    ],

    'Right IT Band': [
        {
            position: new THREE.Vector3(-1.8, -0.5, 0.3),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['IT band syndrome', 'Greater trochanteric pain syndrome'],
            notes: 'Proximal IT band - greater trochanter area'
        },
        {
            position: new THREE.Vector3(-1.8, -2.5, 0.3),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['IT band friction syndrome', 'Lateral knee pain'],
            notes: 'Distal IT band - lateral knee approach'
        }
    ],

    // ===== KNEE VARIANTS =====
    'Right Knee - Anterior': [
        {
            position: new THREE.Vector3(-1.9, -3.9, 0.5),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Patellar tendonitis', 'Jumper knee'],
            notes: 'Patellar tendon - inferior pole of patella'
        },
        {
            position: new THREE.Vector3(-1.8, -3.7, 0.6),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['ACL tear', 'Quadriceps tendon tear'],
            notes: 'Anterior knee structures'
        }
    ],

    'Right Knee - Posterior': [
        {
            position: new THREE.Vector3(-1.9, -3.9, -0.8),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['PCL tear', 'Bakers cyst'],
            notes: 'Popliteal fossa - use caution near vessels'
        },
        {
            position: new THREE.Vector3(-1.8, -3.7, -0.7),
            size: INJECTION_SIZES.SMALL,
            type: 'general',
            targetInjuries: ['Popliteus tendinitis', 'Posterior capsule strain'],
            notes: 'Popliteus area'
        }
    ],

    'Right Knee - Medial': [
        {
            position: new THREE.Vector3(-1.5, -3.9, 0.0),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['MCL tear', 'Medial meniscus tear'],
            notes: 'Medial collateral ligament and meniscus'
        },
        {
            position: new THREE.Vector3(-1.4, -3.7, 0.2),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Pes anserine bursitis', 'Medial plica syndrome'],
            notes: 'Pes anserine area - medial knee'
        }
    ],

    'Right Knee - Lateral': [
        {
            position: new THREE.Vector3(-2.0, -3.9, 0.0),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['LCL tear', 'Lateral meniscus tear'],
            notes: 'Lateral collateral ligament and meniscus'
        },
        {
            position: new THREE.Vector3(-2.0, -3.7, 0.2),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['IT band friction', 'Popliteus strain'],
            notes: 'Lateral knee - IT band insertion'
        }
    ],

    // ===== LEFT LOWER EXTREMITY =====
    'Left Hip Flexor': [
        {
            position: new THREE.Vector3(1.2, 1.3, 0.5),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Hip flexor strain', 'Iliopsoas tendinopathy'],
            notes: 'Iliopsoas muscle - use caution near femoral vessels'
        },
        {
            position: new THREE.Vector3(1.0, 1.0, 0.7),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Hip labral tear', 'FAI', 'Snapping hip syndrome'],
            notes: 'Hip flexor-labral area - deep injection'
        }
    ],

    'Left Glute - Superior': [
        {
            position: new THREE.Vector3(1.2, 1.3, -1.1),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Gluteus medius tear', 'Trochanteric bursitis'],
            notes: 'Gluteus medius - ventrogluteal site'
        },
        {
            position: new THREE.Vector3(1.0, 1.2, -1.0),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Piriformis syndrome', 'Gluteal tendinopathy'],
            notes: 'Deep gluteal region - piriformis area'
        }
    ],

    'Left Glute - Inferior': [
        {
            position: new THREE.Vector3(1.2, 0.8, -1.1),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Gluteus maximus strain', 'Gluteal muscle tear'],
            notes: 'Gluteus maximus - upper outer quadrant'
        },
        {
            position: new THREE.Vector3(1.0, 0.6, -1.0),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Proximal hamstring tendinopathy', 'Ischial tuberosity bursitis'],
            notes: 'Hamstring origin area'
        }
    ],

    'Left Hamstring - Proximal': [
        {
            position: new THREE.Vector3(1.5, 0.5, -1.1),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Hamstring strain', 'Proximal hamstring tear'],
            notes: 'Proximal hamstring belly'
        },
        {
            position: new THREE.Vector3(1.4, 0.8, -1.0),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Ischial tuberosity avulsion', 'High hamstring tear'],
            notes: 'Ischial tuberosity - hamstring origin'
        }
    ],

    'Left Hamstring - Distal': [
        {
            position: new THREE.Vector3(1.5, -1.8, -1.1),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['Hamstring tear', 'Distal hamstring strain'],
            notes: 'Distal hamstring belly'
        },
        {
            position: new THREE.Vector3(1.6, -3.0, -1.0),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Popliteal tendonitis', 'Knee flexor injury'],
            notes: 'Distal hamstring insertion near knee'
        }
    ],

    'Left IT Band': [
        {
            position: new THREE.Vector3(1.8, -0.5, 0.3),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['IT band syndrome', 'Greater trochanteric pain syndrome'],
            notes: 'Proximal IT band - greater trochanter area'
        },
        {
            position: new THREE.Vector3(1.8, -2.5, 0.3),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['IT band friction syndrome', 'Lateral knee pain'],
            notes: 'Distal IT band - lateral knee approach'
        }
    ],

    'Left Knee - Anterior': [
        {
            position: new THREE.Vector3(1.9, -3.9, 0.5),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Patellar tendonitis', 'Jumper knee'],
            notes: 'Patellar tendon - inferior pole of patella'
        },
        {
            position: new THREE.Vector3(1.8, -3.7, 0.6),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['ACL tear', 'Quadriceps tendon tear'],
            notes: 'Anterior knee structures'
        }
    ],

    'Left Knee - Posterior': [
        {
            position: new THREE.Vector3(1.9, -3.9, -0.8),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['PCL tear', 'Bakers cyst'],
            notes: 'Popliteal fossa - use caution near vessels'
        },
        {
            position: new THREE.Vector3(1.8, -3.7, -0.7),
            size: INJECTION_SIZES.SMALL,
            type: 'general',
            targetInjuries: ['Popliteus tendinitis', 'Posterior capsule strain'],
            notes: 'Popliteus area'
        }
    ],

    'Left Knee - Medial': [
        {
            position: new THREE.Vector3(1.5, -3.9, 0.0),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['MCL tear', 'Medial meniscus tear'],
            notes: 'Medial collateral ligament and meniscus'
        },
        {
            position: new THREE.Vector3(1.4, -3.7, 0.2),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Pes anserine bursitis', 'Medial plica syndrome'],
            notes: 'Pes anserine area - medial knee'
        }
    ],

    'Left Knee - Lateral': [
        {
            position: new THREE.Vector3(2.0, -3.9, 0.0),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['LCL tear', 'Lateral meniscus tear'],
            notes: 'Lateral collateral ligament and meniscus'
        },
        {
            position: new THREE.Vector3(2.0, -3.7, 0.2),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['IT band friction', 'Popliteus strain'],
            notes: 'Lateral knee - IT band insertion'
        }
    ],

    // ===== SHIN & CALF REGIONS =====
    'Right Shin - Proximal': [
        {
            position: new THREE.Vector3(-1.7, -5.0, 0.4),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Shin splints', 'Medial tibial stress syndrome', 'Tibial periostitis'],
            notes: 'Proximal medial tibia - shin splint area'
        },
        {
            position: new THREE.Vector3(-1.8, -4.8, 0.5),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Tibial stress fracture', 'Anterior compartment syndrome'],
            notes: 'Anterior tibialis area - compartment'
        }
    ],

    'Right Shin - Distal': [
        {
            position: new THREE.Vector3(-1.8, -7.2, 0.3),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Shin splints', 'Distal tibia stress fracture'],
            notes: 'Distal medial tibia'
        },
        {
            position: new THREE.Vector3(-1.7, -7.0, 0.4),
            size: INJECTION_SIZES.SMALL,
            type: 'general',
            targetInjuries: ['Chronic exertional compartment syndrome', 'Shin pain'],
            notes: 'Lower shin area'
        }
    ],

    'Right Calf - Proximal (Gastrocnemius)': [
        {
            position: new THREE.Vector3(-1.9, -4.2, -0.3),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Medial gastrocnemius strain', 'Calf tear', 'Tennis leg'],
            notes: 'Medial head of gastrocnemius - common strain site'
        },
        {
            position: new THREE.Vector3(-1.7, -4.2, -0.3),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Lateral gastrocnemius strain', 'Calf tear'],
            notes: 'Lateral head of gastrocnemius'
        },
        {
            position: new THREE.Vector3(-1.8, -3.8, -0.2),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['General calf strain', 'Muscle tightness'],
            notes: 'Upper gastrocnemius - broader injection area'
        }
    ],

    'Right Calf - Distal (Soleus)': [
        {
            position: new THREE.Vector3(-1.8, -6.9, -1.2),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Soleus strain', 'Deep calf strain', 'Soleus tear'],
            notes: 'Soleus belly - deep to gastrocnemius'
        },
        {
            position: new THREE.Vector3(-1.7, -6.5, -1.1),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Achilles tendon strain', 'Chronic calf pain'],
            notes: 'Distal soleus - Achilles connection'
        }
    ],

    // ===== ANKLE & FOOT REGIONS =====
    'Right Ankle - Medial': [
        {
            position: new THREE.Vector3(-1.5, -9.0, -0.7),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Medial ankle sprain', 'Deltoid ligament tear'],
            notes: 'Medial malleolus - deltoid ligament'
        },
        {
            position: new THREE.Vector3(-1.6, -8.9, -0.6),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Tibialis posterior tendinitis', 'Tarsal tunnel syndrome'],
            notes: 'Posterior tibial tendon - medial ankle'
        }
    ],

    'Right Ankle - Lateral': [
        {
            position: new THREE.Vector3(-2.0, -9.0, -0.7),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Lateral ankle sprain', 'ATFL tear', 'CFL tear'],
            notes: 'Lateral malleolus - lateral ligaments'
        },
        {
            position: new THREE.Vector3(-2.1, -8.9, -0.6),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Peroneal tendonitis', 'Chronic ankle instability'],
            notes: 'Peroneal tendons - lateral ankle'
        }
    ],

    'Right Heel': [
        {
            position: new THREE.Vector3(-1.6, -9.7, -1.1),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Achilles tendonitis', 'Achilles tendinopathy', 'Achilles rupture'],
            notes: 'Achilles tendon insertion - calcaneus'
        },
        {
            position: new THREE.Vector3(-1.7, -9.5, -0.9),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Plantar fasciitis', 'Heel spur syndrome', 'Retrocalcaneal bursitis'],
            notes: 'Plantar fascia origin - heel spur area'
        }
    ],

    'Right Foot - Midfoot': [
        {
            position: new THREE.Vector3(-1.7, -9.1, -0.1),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Lisfranc injury', 'Navicular stress fracture'],
            notes: 'Midfoot complex - Lisfranc joint'
        },
        {
            position: new THREE.Vector3(-1.8, -9.0, 0.0),
            size: INJECTION_SIZES.SMALL,
            type: 'general',
            targetInjuries: ['Cuboid syndrome', 'Midfoot sprain'],
            notes: 'Lateral midfoot area'
        }
    ],

    'Right Foot - Forefoot': [
        {
            position: new THREE.Vector3(-1.7, -9.5, 0.4),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Metatarsal stress fracture', 'Metatarsalgia'],
            notes: 'Metatarsal heads - forefoot'
        },
        {
            position: new THREE.Vector3(-1.8, -9.6, 0.3),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Turf toe', 'Morton neuroma', 'Sesamoiditis'],
            notes: 'First MTP joint and intermetatarsal spaces'
        }
    ],

    // ===== LEFT SHIN & CALF =====
    'Left Shin - Proximal': [
        {
            position: new THREE.Vector3(1.7, -5.0, 0.4),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Shin splints', 'Medial tibial stress syndrome', 'Tibial periostitis'],
            notes: 'Proximal medial tibia - shin splint area'
        },
        {
            position: new THREE.Vector3(1.8, -4.8, 0.5),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Tibial stress fracture', 'Anterior compartment syndrome'],
            notes: 'Anterior tibialis area - compartment'
        }
    ],

    'Left Shin - Distal': [
        {
            position: new THREE.Vector3(1.8, -7.2, 0.3),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Shin splints', 'Distal tibia stress fracture'],
            notes: 'Distal medial tibia'
        },
        {
            position: new THREE.Vector3(1.7, -7.0, 0.4),
            size: INJECTION_SIZES.SMALL,
            type: 'general',
            targetInjuries: ['Chronic exertional compartment syndrome', 'Shin pain'],
            notes: 'Lower shin area'
        }
    ],

    'Left Calf - Proximal (Gastrocnemius)': [
        {
            position: new THREE.Vector3(1.9, -4.2, -0.3),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Medial gastrocnemius strain', 'Calf tear', 'Tennis leg'],
            notes: 'Medial head of gastrocnemius - common strain site'
        },
        {
            position: new THREE.Vector3(1.7, -4.2, -0.3),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Lateral gastrocnemius strain', 'Calf tear'],
            notes: 'Lateral head of gastrocnemius'
        },
        {
            position: new THREE.Vector3(1.8, -3.8, -0.2),
            size: INJECTION_SIZES.LARGE,
            type: 'general',
            targetInjuries: ['General calf strain', 'Muscle tightness'],
            notes: 'Upper gastrocnemius - broader injection area'
        }
    ],

    'Left Calf - Distal (Soleus)': [
        {
            position: new THREE.Vector3(1.8, -6.9, -1.2),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Soleus strain', 'Deep calf strain', 'Soleus tear'],
            notes: 'Soleus belly - deep to gastrocnemius'
        },
        {
            position: new THREE.Vector3(1.7, -6.5, -1.1),
            size: INJECTION_SIZES.MEDIUM,
            type: 'general',
            targetInjuries: ['Achilles tendon strain', 'Chronic calf pain'],
            notes: 'Distal soleus - Achilles connection'
        }
    ],

    // ===== LEFT ANKLE & FOOT =====
    'Left Ankle - Medial': [
        {
            position: new THREE.Vector3(1.5, -9.0, -0.7),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Medial ankle sprain', 'Deltoid ligament tear'],
            notes: 'Medial malleolus - deltoid ligament'
        },
        {
            position: new THREE.Vector3(1.6, -8.9, -0.6),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Tibialis posterior tendinitis', 'Tarsal tunnel syndrome'],
            notes: 'Posterior tibial tendon - medial ankle'
        }
    ],

    'Left Ankle - Lateral': [
        {
            position: new THREE.Vector3(2.0, -9.0, -0.7),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Lateral ankle sprain', 'ATFL tear', 'CFL tear'],
            notes: 'Lateral malleolus - lateral ligaments'
        },
        {
            position: new THREE.Vector3(2.1, -8.9, -0.6),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Peroneal tendonitis', 'Chronic ankle instability'],
            notes: 'Peroneal tendons - lateral ankle'
        }
    ],

    'Left Heel': [
        {
            position: new THREE.Vector3(1.6, -9.7, -1.1),
            size: INJECTION_SIZES.MEDIUM,
            type: 'injury_specific',
            targetInjuries: ['Achilles tendonitis', 'Achilles tendinopathy', 'Achilles rupture'],
            notes: 'Achilles tendon insertion - calcaneus'
        },
        {
            position: new THREE.Vector3(1.7, -9.5, -0.9),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Plantar fasciitis', 'Heel spur syndrome', 'Retrocalcaneal bursitis'],
            notes: 'Plantar fascia origin - heel spur area'
        }
    ],

    'Left Foot - Midfoot': [
        {
            position: new THREE.Vector3(1.7, -9.1, -0.1),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Lisfranc injury', 'Navicular stress fracture'],
            notes: 'Midfoot complex - Lisfranc joint'
        },
        {
            position: new THREE.Vector3(1.8, -9.0, 0.0),
            size: INJECTION_SIZES.SMALL,
            type: 'general',
            targetInjuries: ['Cuboid syndrome', 'Midfoot sprain'],
            notes: 'Lateral midfoot area'
        }
    ],

    'Left Foot - Forefoot': [
        {
            position: new THREE.Vector3(1.7, -9.5, 0.4),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Metatarsal stress fracture', 'Metatarsalgia'],
            notes: 'Metatarsal heads - forefoot'
        },
        {
            position: new THREE.Vector3(1.8, -9.6, 0.3),
            size: INJECTION_SIZES.SMALL,
            type: 'injury_specific',
            targetInjuries: ['Turf toe', 'Morton neuroma', 'Sesamoiditis'],
            notes: 'First MTP joint and intermetatarsal spaces'
        }
    ]
};

// Debug mode for testing injection point positions
let injectionDebugMode = false;

function toggleInjectionDebugMode() {
    injectionDebugMode = !injectionDebugMode;
    console.log(`🔬 Injection Debug Mode: ${injectionDebugMode ? 'ON' : 'OFF'}`);
    if (injectionDebugMode) {
        console.log('Click on the model to see coordinates for new injection points');
        console.log('Current injection point data:', injectionPoints);
    }
    return injectionDebugMode;
}

// Helper function to generate code for a new injection point
function generateInjectionPointCode(regionName, x, y, z, size = 'MEDIUM', type = 'general', injuries = [], notes = '') {
    const sizeValue = size.toUpperCase();
    const injuriesStr = injuries.length > 0 
        ? `['${injuries.join("', '")}']` 
        : "['Add injuries here']";
    
    const code = `
    {
        position: new THREE.Vector3(${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}),
        size: INJECTION_SIZES.${sizeValue},
        type: '${type}',
        targetInjuries: ${injuriesStr},
        notes: '${notes || 'Add description here'}'
    }`;
    
    console.log(`📋 Copy this code for "${regionName}":`);
    console.log(code);
    return code;
}

// Helper to list all regions with injection points
function listInjectionRegions() {
    const regions = Object.keys(injectionPoints);
    console.log(`\n💉 ${regions.length} Regions with Injection Points Configured:\n`);
    regions.forEach((region, i) => {
        const count = injectionPoints[region].length;
        console.log(`${i + 1}. ${region} (${count} points)`);
    });
    console.log('\n');
    return regions;
}

// Helper to show details of a specific region's injection points
function showInjectionPoints(regionName) {
    const points = injectionPoints[regionName];
    if (!points) {
        console.warn(`⚠️ No injection points found for "${regionName}"`);
        console.log('Available regions:', Object.keys(injectionPoints));
        return;
    }
    
    console.log(`\n💉 Injection Points for "${regionName}":\n`);
    points.forEach((point, i) => {
        console.log(`Point ${i + 1}:`);
        console.log(`  Position: (${point.position.x.toFixed(2)}, ${point.position.y.toFixed(2)}, ${point.position.z.toFixed(2)})`);
        console.log(`  Size: ${point.size} (${point.size === INJECTION_SIZES.SMALL ? 'Small' : point.size === INJECTION_SIZES.MEDIUM ? 'Medium' : 'Large'})`);
        console.log(`  Type: ${point.type === 'injury_specific' ? '🎯 Injury-Specific (Dark Green)' : '✅ General (Medium Green)'}`);
        console.log(`  Targets: ${point.targetInjuries.join(', ')}`);
        console.log(`  Notes: ${point.notes}`);
        console.log('');
    });
    return points;
}

// Helper to compare coverage between regions.js and injection points
function checkInjectionCoverage() {
    if (typeof regions === 'undefined') {
        console.warn('⚠️ regions.js not loaded yet');
        return;
    }
    
    const allRegions = Object.keys(regions);
    const configuredRegions = Object.keys(injectionPoints);
    const missingRegions = allRegions.filter(r => !configuredRegions.includes(r));
    
    console.log('\n📊 Injection Point Coverage Report:\n');
    console.log(`Total Body Regions: ${allRegions.length}`);
    console.log(`Configured with Injection Points: ${configuredRegions.length}`);
    console.log(`Missing Injection Points: ${missingRegions.length}`);
    console.log(`Coverage: ${Math.round((configuredRegions.length / allRegions.length) * 100)}%\n`);
    
    if (missingRegions.length > 0) {
        console.log('🔴 Regions Missing Injection Points:');
        missingRegions.forEach((region, i) => {
            console.log(`  ${i + 1}. ${region}`);
        });
    }
    
    console.log('\n');
    return {
        total: allRegions.length,
        configured: configuredRegions.length,
        missing: missingRegions,
        coverage: Math.round((configuredRegions.length / allRegions.length) * 100)
    };
}

// Make injectionPoints and related variables globally accessible
window.injectionPoints = injectionPoints;
window.INJECTION_COLORS = INJECTION_COLORS;
window.INJECTION_SIZES = INJECTION_SIZES;

// Make all helper functions globally accessible
window.toggleInjectionDebugMode = toggleInjectionDebugMode;
window.generateInjectionPointCode = generateInjectionPointCode;
window.listInjectionRegions = listInjectionRegions;
window.showInjectionPoints = showInjectionPoints;
window.checkInjectionCoverage = checkInjectionCoverage;

// Log available injection regions on load
console.log(`✅ Injection points loaded for ${Object.keys(injectionPoints).length} regions`);
console.log('\n💡 Available Console Commands:');
console.log('  • toggleInjectionDebugMode() - Toggle debug mode for finding coordinates');
console.log('  • listInjectionRegions() - Show all configured regions');
console.log('  • showInjectionPoints("Region Name") - Show details for a region');
console.log('  • checkInjectionCoverage() - See coverage statistics');
console.log('  • generateInjectionPointCode("Region", x, y, z) - Generate code template\n');

})(); // End of initializeInjectionPoints IIFE
