// Pre-loaded video backgrounds available for selection
export const VIDEO_LIBRARY = [
  {
    id: 'circuit-wheel-1',
    label: '60-Circuit Wheel A',
    category: 'Intelligence',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/dd8e065d9_hailuo-03_The_60-Circuit_Intelligence_Wheel_AI_Agent_Network_Engine_Visual_Concept_Environ-0.mp4',
  },
  {
    id: 'circuit-wheel-2',
    label: '60-Circuit Wheel B',
    category: 'Intelligence',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/0454367d0_hailuo-2_3_The_60-Circuit_Intelligence_Wheel_AI_Agent_Network_Engine_Visual_Concept_Environ-0.mp4',
  },
  {
    id: 'treasury-nexus-1',
    label: 'Gaia Treasury A',
    category: 'Treasury',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/294a8e5c9_hailuo-2_3_The_Gaia_Treasury_Nexus_Economic_Jubilee_Asset_Layer_Visual_Concept_Environment_-0.mp4',
  },
  {
    id: 'treasury-nexus-2',
    label: 'Gaia Treasury B',
    category: 'Treasury',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/34e99dc62_seedance-25_The_Gaia_Treasury_Nexus_Economic_Jubilee_Asset_Layer_Visual_Concept_Environment_-0.mp4',
  },
  {
    id: 'treasury-nexus-3',
    label: 'Gaia Treasury C',
    category: 'Treasury',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/561382aa7_flux-3-video_The_Gaia_Treasury_Nexus_Economic_Jubilee_Asset_Layer_Visual_Concept_Environment_-0.mp4',
  },
  {
    id: 'genesis-convergence',
    label: 'Genesis Convergence',
    category: 'Hero',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/8dea56418_hailuo-2_3_The_Genesis_Convergence_Landing_Hero_Scene_Visual_Concept_Environment_A_deep-spa-01.mp4',
  },
  {
    id: 'civ-os-1',
    label: 'Civilization OS A',
    category: 'Infrastructure',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/60ef8fd32_gemini-omni-flash_The_Civilization_Operating_System_Global_Infrastructure_Sandbox_Visual_Concept_E-0.mp4',
  },
  {
    id: 'civ-os-2',
    label: 'Civilization OS B',
    category: 'Infrastructure',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/eb8d34508_flux-3-video_The_Civilization_Operating_System_Global_Infrastructure_Sandbox_Visual_Concept_E-0.mp4',
  },
  {
    id: 'civ-os-3',
    label: 'Civilization OS C',
    category: 'Infrastructure',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/b5e4bf4a2_seedance-25_The_Civilization_Operating_System_Global_Infrastructure_Sandbox_Visual_Concept_E-0.mp4',
  },
  {
    id: 'goddesses-fire',
    label: 'Goddesses & Fire',
    category: 'Mystical',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/9a4736f69_hailuo-03_goddesses_dancing_around_the_fire_in_forest-0.mp4',
  },
  {
    id: 'alchemy-lab-1',
    label: 'Alchemy Lab A',
    category: 'Mystical',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/9c76d4e66_hailuo-03_A_alchemy_lab_coming_up_to_a_table_opening_an_ancient_book_pointing_to_sacred_sy-0.mp4',
  },
  {
    id: 'alchemy-lab-2',
    label: 'Alchemy Lab B',
    category: 'Mystical',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/5308f2cf9_seedance-25_A_alchemy_lab_coming_up_to_a_table_opening_an_ancient_book_pointing_to_sacred_sy-0.mp4',
  },
  {
    id: 'temple-interface-1',
    label: 'Temple Interface A',
    category: 'Temple',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/396aa7f3c_hailuo-03_Temple_becomes_interface_Slow_forward_camera_movement_through_a_dark_ancient_tem-0.mp4',
  },
  {
    id: 'temple-interface-2',
    label: 'Temple Interface B',
    category: 'Temple',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/a928f63a4_gemini-omni-flash_Temple_becomes_interface_Slow_forward_camera_movement_through_a_dark_ancient_tem-0.mp4',
  },
  {
    id: 'temple-interface-3',
    label: 'Temple Interface C',
    category: 'Temple',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/9e3035c1b_hailuo-2_3_Temple_becomes_interface_Slow_forward_camera_movement_through_a_dark_ancient_tem-01.mp4',
  },
  {
    id: 'kings-chamber',
    label: "King's Chamber",
    category: 'Pyramid',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/862642e48_hailuo-2_3_Kings_chamber_reveal_Cinematic_slow_push_into_a_silent_inner_pyramid_chamber_-0.mp4',
  },
  {
    id: 'pyramid-approach',
    label: 'Pyramid Approach',
    category: 'Pyramid',
    url: 'https://media.base44.com/videos/public/694f3e0401b05e6e8a042002/edd194cb5_hailuo-2_3_Pyramid_approach_First-person_cinematic_approach_across_a_quiet_desert_plateau_t-0.mp4',
  },
];

export const VIDEO_CATEGORIES = [...new Set(VIDEO_LIBRARY.map(v => v.category))];