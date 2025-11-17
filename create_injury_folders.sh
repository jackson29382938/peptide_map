#!/bin/bash

# Create injury subfolders based on injection-points.js

cd images/injection_points

# HEAD & NECK
mkdir -p head/{concussion_recovery,post_concussion_syndrome,chronic_headaches}
mkdir -p neck/{whiplash,cervical_strain,neck_sprain,cervical_muscle_spasm,facet_joint_pain}

# TORSO
mkdir -p upper_chest/{pectoralis_major_strain,intercostal_strain}
mkdir -p lower_chest/{costochondritis,lower_pectoralis_strain}
mkdir -p upper_abs/{rectus_abdominis_strain,abdominal_wall_pain}
mkdir -p lower_abs/{lower_abdominal_strain,hip_flexor_attachment_pain}
mkdir -p upper_back/{trapezius_strain,rhomboid_strain,upper_back_myofascial_pain}
mkdir -p mid_back/{thoracic_strain,intercostal_neuralgia}
mkdir -p lower_back/{lumbar_strain,facet_joint_syndrome,si_joint_dysfunction}

# RIGHT ARM - SHOULDER
mkdir -p right_deltoid_anterior/{anterior_deltoid_strain,biceps_tendinitis}
mkdir -p right_deltoid_lateral/{rotator_cuff_tendinitis,subacromial_bursitis}
mkdir -p right_deltoid_posterior/{posterior_deltoid_strain,infraspinatus_tendinitis}

# RIGHT ARM - BICEP & TRICEP
mkdir -p right_bicep_proximal/{proximal_biceps_tendinitis,slap_tear,biceps_strain}
mkdir -p right_bicep_distal/{distal_biceps_tendinitis,biceps_tear}
mkdir -p right_tricep_lateral_head/{lateral_triceps_strain,triceps_tendinitis}
mkdir -p right_tricep_long_head/{long_head_triceps_strain,triceps_tendon_tear}

# RIGHT ARM - FOREARM & HAND
mkdir -p right_elbow/{lateral_epicondylitis,medial_epicondylitis,tennis_elbow,golfers_elbow}
mkdir -p right_forearm_proximal_anterior/{flexor_mass_strain,pronator_teres_syndrome}
mkdir -p right_forearm_distal_anterior/{flexor_tendinitis,carpal_tunnel_syndrome}
mkdir -p right_forearm_proximal_posterior/{extensor_mass_strain,radial_tunnel_syndrome}
mkdir -p right_forearm_distal_posterior/{extensor_tendinitis,de_quervains_tenosynovitis}
mkdir -p right_wrist/{wrist_sprain,tfcc_tear,intersection_syndrome}
mkdir -p right_hand/{trigger_finger,cmc_arthritis,mcp_sprain}

# LEFT ARM - SHOULDER
mkdir -p left_deltoid_anterior/{anterior_deltoid_strain,biceps_tendinitis}
mkdir -p left_deltoid_lateral/{rotator_cuff_tendinitis,subacromial_bursitis}
mkdir -p left_deltoid_posterior/{posterior_deltoid_strain,infraspinatus_tendinitis}

# LEFT ARM - BICEP & TRICEP
mkdir -p left_bicep_proximal/{proximal_biceps_tendinitis,slap_tear,biceps_strain}
mkdir -p left_bicep_distal/{distal_biceps_tendinitis,biceps_tear}
mkdir -p left_tricep_lateral_head/{lateral_triceps_strain,triceps_tendinitis}
mkdir -p left_tricep_long_head/{long_head_triceps_strain,triceps_tendon_tear}

# LEFT ARM - FOREARM & HAND
mkdir -p left_elbow/{lateral_epicondylitis,medial_epicondylitis,tennis_elbow,golfers_elbow}
mkdir -p left_forearm_proximal_anterior/{flexor_mass_strain,pronator_teres_syndrome}
mkdir -p left_forearm_distal_anterior/{flexor_tendinitis,carpal_tunnel_syndrome}
mkdir -p left_forearm_proximal_posterior/{extensor_mass_strain,radial_tunnel_syndrome}
mkdir -p left_forearm_distal_posterior/{extensor_tendinitis,de_quervains_tenosynovitis}
mkdir -p left_wrist/{wrist_sprain,tfcc_tear,intersection_syndrome}
mkdir -p left_hand/{trigger_finger,cmc_arthritis,mcp_sprain}

# RIGHT LEG - HIP & GLUTE
mkdir -p right_hip_flexor/{hip_flexor_strain,iliopsoas_tendinitis,hip_impingement}
mkdir -p right_glute_superior/{gluteus_medius_strain,trochanteric_bursitis}
mkdir -p right_glute_inferior/{gluteus_maximus_strain,piriformis_syndrome}

# RIGHT LEG - QUAD & HAMSTRING
mkdir -p right_quad_proximal/{rectus_femoris_strain,quad_contusion,hip_pointer}
mkdir -p right_quad_distal/{vastus_medialis_strain,patellar_tendinitis,jumpers_knee}
mkdir -p right_hamstring_proximal/{proximal_hamstring_strain,hamstring_tendinopathy,ischial_bursitis}
mkdir -p right_hamstring_distal/{distal_hamstring_strain,biceps_femoris_tendinitis}

# RIGHT LEG - KNEE
mkdir -p right_it_band/{it_band_syndrome,lateral_knee_friction}
mkdir -p right_knee_anterior/{patellar_tendinitis,quadriceps_tendinitis,hoffa_syndrome}
mkdir -p right_knee_posterior/{bakers_cyst,popliteus_strain,pcl_strain}
mkdir -p right_knee_medial/{mcl_sprain,medial_meniscus_tear,pes_anserine_bursitis}
mkdir -p right_knee_lateral/{lcl_tear,lateral_meniscus_tear,it_band_friction,popliteus_strain}

# RIGHT LEG - SHIN & CALF
mkdir -p right_shin_proximal/{shin_splints,medial_tibial_stress_syndrome,tibial_periostitis,tibial_stress_fracture,anterior_compartment_syndrome}
mkdir -p right_shin_distal/{shin_splints,distal_tibia_stress_fracture,chronic_exertional_compartment_syndrome,shin_pain}
mkdir -p right_calf_proximal_gastrocnemius/{medial_gastrocnemius_strain,calf_tear,tennis_leg,lateral_gastrocnemius_strain,general_calf_strain,muscle_tightness}
mkdir -p right_calf_distal_soleus/{soleus_strain,deep_calf_strain,soleus_tear,achilles_tendon_strain,chronic_calf_pain}

# RIGHT LEG - ANKLE & FOOT
mkdir -p right_ankle_medial/{medial_ankle_sprain,deltoid_ligament_tear,tibialis_posterior_tendinitis,tarsal_tunnel_syndrome}
mkdir -p right_ankle_lateral/{lateral_ankle_sprain,atfl_tear,cfl_tear,peroneal_tendonitis,chronic_ankle_instability}
mkdir -p right_heel/{achilles_tendonitis,achilles_tendinopathy,achilles_rupture,plantar_fasciitis,heel_spur_syndrome,retrocalcaneal_bursitis}
mkdir -p right_foot_midfoot/{lisfranc_injury,navicular_stress_fracture,cuboid_syndrome,midfoot_sprain}
mkdir -p right_foot_forefoot/{metatarsal_stress_fracture,metatarsalgia,turf_toe,morton_neuroma,sesamoiditis}

# LEFT LEG - HIP & GLUTE
mkdir -p left_hip_flexor/{hip_flexor_strain,iliopsoas_tendinitis,hip_impingement}
mkdir -p left_glute_superior/{gluteus_medius_strain,trochanteric_bursitis}
mkdir -p left_glute_inferior/{gluteus_maximus_strain,piriformis_syndrome}

# LEFT LEG - QUAD & HAMSTRING
mkdir -p left_quad_proximal/{rectus_femoris_strain,quad_contusion,hip_pointer}
mkdir -p left_quad_distal/{vastus_medialis_strain,patellar_tendinitis,jumpers_knee}
mkdir -p left_hamstring_proximal/{proximal_hamstring_strain,hamstring_tendinopathy,ischial_bursitis}
mkdir -p left_hamstring_distal/{distal_hamstring_strain,biceps_femoris_tendinitis}

# LEFT LEG - KNEE
mkdir -p left_it_band/{it_band_syndrome,lateral_knee_friction}
mkdir -p left_knee_anterior/{patellar_tendinitis,quadriceps_tendinitis,hoffa_syndrome}
mkdir -p left_knee_posterior/{bakers_cyst,popliteus_strain,pcl_strain}
mkdir -p left_knee_medial/{mcl_sprain,medial_meniscus_tear,pes_anserine_bursitis}
mkdir -p left_knee_lateral/{lcl_tear,lateral_meniscus_tear,it_band_friction,popliteus_strain}

# LEFT LEG - SHIN & CALF
mkdir -p left_shin_proximal/{shin_splints,medial_tibial_stress_syndrome,tibial_periostitis,tibial_stress_fracture,anterior_compartment_syndrome}
mkdir -p left_shin_distal/{shin_splints,distal_tibia_stress_fracture,chronic_exertional_compartment_syndrome,shin_pain}
mkdir -p left_calf_proximal_gastrocnemius/{medial_gastrocnemius_strain,calf_tear,tennis_leg,lateral_gastrocnemius_strain,general_calf_strain,muscle_tightness}
mkdir -p left_calf_distal_soleus/{soleus_strain,deep_calf_strain,soleus_tear,achilles_tendon_strain,chronic_calf_pain}

# LEFT LEG - ANKLE & FOOT
mkdir -p left_ankle_medial/{medial_ankle_sprain,deltoid_ligament_tear,tibialis_posterior_tendinitis,tarsal_tunnel_syndrome}
mkdir -p left_ankle_lateral/{lateral_ankle_sprain,atfl_tear,cfl_tear,peroneal_tendonitis,chronic_ankle_instability}
mkdir -p left_heel/{achilles_tendonitis,achilles_tendinopathy,achilles_rupture,plantar_fasciitis,heel_spur_syndrome,retrocalcaneal_bursitis}
mkdir -p left_foot_midfoot/{lisfranc_injury,navicular_stress_fracture,cuboid_syndrome,midfoot_sprain}
mkdir -p left_foot_forefoot/{metatarsal_stress_fracture,metatarsalgia,turf_toe,morton_neuroma,sesamoiditis}

echo "✅ All injury subfolders created!"
