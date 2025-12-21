
import { useStore, MilestoneTemplate } from '../store/useStore';

const ECDC_FULL_DATA: MilestoneTemplate[] = [
  {
    id: 'm-1-3',
    label: '1 to 3 Months',
    sections: [
      { title: 'Movement', items: [
        'Raises head and cheek when lying on stomach (3 mos.)', 
        'Supports upper body with arms when lying on stomach (3 mos.)', 
        'Stretches legs out when lying on stomach or back (2-3 mos.)', 
        'Opens and shuts hands (2-3 mos.)', 
        'Pushes down on his legs when his feet are placed on firm surface (3 mos.)'
      ] },
      { title: 'Visual', items: [
        'Watches face intently (2-3 mos.)', 
        'Follows moving objects (2 mos.)', 
        'Recognizes familiar objects and people at a distance (3 mos.)', 
        'Starts using hands and eyes in coordination (3 mos.)'
      ] },
      { title: 'Hearing and Speech', items: [
        'Smiles at the sound of voice (2-3 mos.)', 
        'Cooing noises; vocal play (begins at 3 mos.)', 
        'Attends to sound (1-3 mos.)', 
        'Startles to loud noise (1-3 mos.)'
      ] },
      { title: 'Social/Emotional', items: [
        'Begins to develop a social smile (1-3 mos.)', 
        'Enjoys playing with other people and may cry when playing stops (2-3 mos.)', 
        'Becomes more communicative and expressive with face and body (2-3 mos.)', 
        'Imitates some movements and facial expressions'
      ] }
    ],
    redFlags: [
      'Doesn’t seem to respond to loud noises', 
      'Doesn’t follow moving objects with eyes by 2 to 3 months', 
      'Doesn’t smile at the sound of your voice by 2 months', 
      'Doesn’t grasp and hold objects by 3 months', 
      'Doesn’t smile at people by 3 months', 
      'Cannot support head well at 3 months',
      'Doesn’t reach for and grasp toys by 3 to 4 months',
      'Doesn’t bring objects to mouth by 4 months',
      'Doesn’t push down with legs when feet are placed on a firm surface by 4 months',
      'Has trouble moving one or both eyes in all directions',
      'Crosses eyes most of the time'
    ]
  },
  {
    id: 'm-4-7',
    label: '4 to 7 Months',
    sections: [
      { title: 'Movement', items: [
        'Pushes up on extended arms (5 mos.)', 
        'Pulls to sitting with no head lag (5 mos.)', 
        'Sits with support of his hands (5-6 mos.)', 
        'Sits unsupported for short periods (6-8 mos.)', 
        'Supports whole weight on legs (6-7 mos.)', 
        'Grasps feet (6 mos.)',
        'Transfers objects from hand to hand (6-7 mos.)',
        'Uses raking grasp (not pincer) (6 mos.)'
      ] },
      { title: 'Visual', items: [
        'Looks for toy beyond tracking range (5-6 mos.)', 
        'Tracks moving objects with ease (4-7 mos.)', 
        'Grasps objects dangling in front of him (5-6 mos.)', 
        'Looks for fallen toys (5-7 mos.)'
      ] },
      { title: 'Language', items: [
        'Distinguishes emotions by tone of voice (4-7 mos.)', 
        'Responds to sound by making sounds (4-6 mos.)', 
        'Uses voice to express joy and displeasure (4-6 mos.)', 
        'Syllable repetition begins (5-7 mos.)'
      ] },
      { title: 'Cognitive', items: [
        'Finds partially hidden objects (6-7 mos.)', 
        'Explores with hands and mouth (4-7 mos.)', 
        'Struggles to get objects that are out of reach (5-7 mos.)'
      ] },
      { title: 'Social Emotional', items: [
        'Enjoys social play (4-7 mos.)', 
        'Interested in mirror images (5-7 mos.)', 
        'Responds to other people’s expression of emotion (4-7 mos.)'
      ] }
    ],
    redFlags: [
      'Seems very stiff, tight muscles', 
      'Seems very floppy, like a rag doll', 
      'Head still flops back when body is pulled to sitting position', 
      'Shows no affection for the person who cares for them', 
      'Doesn’t seem to enjoy being around people',
      'One or both eyes consistently turn in or out',
      'Persistent tearing, eye drainage, or sensitivity to light',
      'Does not respond to sounds around them',
      'Has difficulty getting objects to mouth',
      'Does not turn head to locate sounds by 4 months',
      'Doesn’t roll over (stomach to back) by 6 months',
      'Cannot sit with help by 6 months',
      'Does not laugh or make squealing sounds by 5 months',
      'Does not actively reach for objects by 6 months',
      'Does not follow objects with both eyes',
      'Does not bear some weight on legs by 5 months'
    ]
  },
  {
    id: 'm-8-12',
    label: '8 to 12 Months',
    sections: [
      { title: 'Movement', items: [
        'Gets to sitting position without assistance (8-10 mos.)', 
        'Crawls forward on belly', 
        'Assumes hand and knee position', 
        'Creeps on hands and knees', 
        'Gets from sitting to crawling or prone position (10-12 mos.)', 
        'Pulls self up to standing position', 
        'Walks holding on to furniture', 
        'Stands momentarily without support', 
        'May walk two or three steps without support'
      ] },
      { title: 'Hand and Finger Skills', items: [
        'Uses pincer grasp (thumb and index) (7-10 mos.)', 
        'Bangs two one-inch cubes together', 
        'Puts objects into container (10-12 mos.)', 
        'Takes objects out of container (10-12 mos.)', 
        'Pokes with index finger', 
        'Tries to imitate scribbling'
      ] },
      { title: 'Cognitive', items: [
        'Explores objects by shaking, banging, throwing (8-10 mos.)', 
        'Finds hidden objects easily (10-12 mos.)', 
        'Looks at correct picture when image is named', 
        'Imitates gestures (9-12 mos.)'
      ] },
      { title: 'Language', items: [
        'Responds to simple verbal requests', 
        'Responds to “no”', 
        'Makes simple gestures such as shaking head for no', 
        'Babbles with inflection (8-10 mos.)', 
        'Babbles “dada” and “mama” (8-10 mos.)', 
        'Says “dada” and “mama” for specific person (11-12 mos.)', 
        'Uses exclamations such as “oh-oh”'
      ] },
      { title: 'Social/Emotional', items: [
        'Shy or anxious with strangers (8-12 mos.)', 
        'Cries when mother or father leaves (8-12 mos.)', 
        'Enjoys imitating people in his play (10-12 mos.)', 
        'Shows specific preferences for certain people and toys (8-12 mos.)', 
        'Prefers mother and/or regular care provider over all others (8-12 mos.)', 
        'Repeats sounds or gestures for attention (10-12 mos.)', 
        'Finger-feeds himself (8-12 mos.)', 
        'Extends arm or leg to help when being dressed'
      ] }
    ],
    redFlags: [
      'Does not crawl', 
      'Drags one side of body while crawling (over one month)', 
      'Cannot stand when supported', 
      'Does not search for objects that are hidden (10-12 mos.)', 
      'Says no single words (“mama” or “dada”)', 
      'Does not learn to use gestures such as waving or shaking head', 
      'Does not sit steadily by 10 months', 
      'Does not show interest in “peek-a-boo" or "patty cake” by 8 mos.', 
      'Does not babble by 8 mos.'
    ]
  },
  {
    id: 'm-12-24',
    label: '12 to 24 Months',
    sections: [
      { title: 'Movement', items: [
        'Walks alone (12-16 mos.)', 
        'Pulls toys behind him while walking (13-16 mos.)', 
        'Carries large toy or several toys while walking (12-15 mos.)', 
        'Begins to run stiffly (16-18 mos.)', 
        'Walks into ball (18-24 mos.)', 
        'Climbs onto/down from furniture unsupported (16-24 mos.)', 
        'Walks up/down stairs holding support (18-24 mos.)'
      ] },
      { title: 'Hand and Finger Skills', items: [
        'Scribbles spontaneously (14-16 mos.)', 
        'Turns over container to pour out contents (12-18 mos.)', 
        'Builds tower of four blocks or more (20-24 mos.)'
      ] },
      { title: 'Language', items: [
        'Points to object or picture when named (18-24 mos.)', 
        'Recognizes names of people, objects, body parts (18-24 mos.)', 
        'Says several single words (15-18 mos.)', 
        'Uses two-word sentences (18-24 mos.)', 
        'Follows simple, one-step instructions (14-18 mos.)', 
        'Repeats words overheard in conversations (16-18 mos.)'
      ] },
      { title: 'Cognitive', items: [
        'Finds objects hidden under 2 or 3 covers', 
        'Begins to sort shapes and colors (20-24 mos.)', 
        'Begins make-believe play (20-24 mos.)'
      ] },
      { title: 'Social', items: [
        'Imitates behavior of others (18-24 mos.)', 
        'Enthusiastic about company or other children (20-24 mos.)', 
        'Demonstrates increasing independence (18-24 mos.)', 
        'Begins to show defiant behavior (18-24 mos.)', 
        'Separation anxiety episodes increase mid-year'
      ] }
    ],
    redFlags: [
      'Cannot walk by 18 months', 
      'Fails to develop a mature heel-toe walking pattern', 
      'Does not speak at least 15 words by 18 months', 
      'Does not use two-word sentences by age 2', 
      'Doesn\'t know function of common household objects by 15 mos.', 
      'Does not imitate actions or words by 24 mos.', 
      'Does not follow simple one-step instructions by 24 mos.'
    ]
  },
  {
    id: 'm-24-36',
    label: '24 to 36 Months',
    sections: [
      { title: 'Movement', items: [
        'Climbs well (24-30 mos.)', 
        'Walks down stairs alone, placing both feet on each step (26-28 mos.)', 
        'Walks up stairs alternating feet with support (24-30 mos.)', 
        'Swings leg to kick ball (24-30 mos.)', 
        'Runs easily (24-26 mos.)', 
        'Pedals tricycle (30-36 mos.)', 
        'Bends over easily without falling (24-30 mos.)'
      ] },
      { title: 'Hand and Finger Skills', items: [
        'Makes vertical, horizontal, circular strokes (30-36 mos.)', 
        'Turns book pages one at a time (24-30 mos.)', 
        'Builds a tower of more than 6 blocks (24-30 mos.)', 
        'Holds a pencil in writing position (30-36 mos.)', 
        'Screws and unscrews jar lids, nuts, and bolts (24-30 mos.)', 
        'Turns rotating handles (24-30 mos.)'
      ] },
      { title: 'Language', items: [
        'Recognizes and identifies almost all common objects (26-32 mos.)', 
        'Understands most sentences (24-40 mos.)', 
        'Understands physical relationships (on, in, under) (30-36 mos.)', 
        'Can say name, age, and sex (30-36 mos.)', 
        'Uses pronouns (I, you, me, we, they) (24-30 mos.)', 
        'Strangers can understand most words (30-36 mos.)'
      ] },
      { title: 'Cognitive', items: [
        'Makes mechanical toys work (30-36 mos.)', 
        'Matches object in hand/room to picture in book (24-30 mos.)', 
        'Plays make-believe with dolls and people (24-36 mos.)', 
        'Sorts objects by color (30-36 mos.)', 
        'Completes puzzles with 3 or 4 pieces (24-36 mos.)', 
        'Understands concept of “two” (26-32 mos.)'
      ] },
      { title: 'Social/Emotional', items: [
        'Separates easily from parents (by 36 mo.)', 
        'Expresses a wide range of emotions (24-36 mos.)', 
        'Objects to major changes in routine (24-36 mos.)'
      ] }
    ],
    redFlags: [
      'Frequent falling and difficulty with stairs', 
      'Persistent drooling or very unclear speech', 
      'Inability to build a tower of more than 4 blocks', 
      'Difficulty manipulating small objects', 
      'Inability to copy a circle by 3 years old', 
      'Inability to communicate in short phrases', 
      'No involvement in pretend play', 
      'Failure to understand simple instructions', 
      'Little interest in other children', 
      'Extreme difficulty separating from primary caregiver'
    ]
  },
  {
    id: 'm-3-4y',
    label: '3 to 4 Years',
    sections: [
      { title: 'Movement', items: [
        'Hops and stands on one foot up to 5 seconds', 
        'Goes upstairs and downstairs without support', 
        'Kicks ball forward', 
        'Throws ball overhand', 
        'Catches bounced ball most of the time', 
        'Moves forward and backward', 
        'Uses riding toys'
      ] },
      { title: 'Hand and Finger Skills', items: [
        'Copies square shapes', 
        'Draws a person with 2-4 body parts', 
        'Uses scissors', 
        'Draws circles and squares', 
        'Begins to copy some capital letters', 
        'Can feed self with spoon'
      ] },
      { title: 'Language', items: [
        'Understands concepts of "same" and "different"', 
        'Has mastered some basic rules of grammar', 
        'Speaks in sentences of 5-6 words', 
        'Asks questions', 
        'Speaks clearly enough for strangers to understand', 
        'Tells stories'
      ] },
      { title: 'Cognitive', items: [
        'Correctly names some colors', 
        'Understands counting and a few numbers', 
        'Begins to have a clearer sense of time', 
        'Follows three-part commands', 
        'Recalls parts of a story', 
        'Engages in fantasy play', 
        'Understands causality'
      ] },
      { title: 'Social', items: [
        'Interested in new experiences', 
        'Cooperates and plays with other children', 
        'Plays "mom" or "dad"', 
        'More inventive in fantasy play', 
        'Dresses and undresses', 
        'More independent'
      ] },
      { title: 'Emotional', items: [
        'Often cannot distinguish between fantasy and reality', 
        'May have imaginary friends or see monsters'
      ] }
    ],
    redFlags: [
      'Cannot jump in place', 
      'Cannot ride a trike', 
      'Cannot grasp a crayon between thumb and fingers', 
      'Has difficulty scribbling', 
      'Cannot copy a circle', 
      'Cannot stack 4 blocks', 
      'Still clings or cries when parents leave him', 
      'Shows no interest in interactive games', 
      'Ignores other children', 
      'Doesn\'t respond to people outside family', 
      'Doesn\'t engage in fantasy play', 
      'Resists dressing, sleeping, using the toilet', 
      'Lashes out without self-control', 
      'Doesn\'t use sentences of more than 3 words', 
      'Doesn\'t use "me" or "you" appropriately'
    ]
  },
  {
    id: 'm-4-5y',
    label: '4 to 5 Years',
    sections: [
      { title: 'Movement', items: [
        'Stands on one foot for 10 seconds or longer', 
        'Hops, somersaults', 
        'Swings, climbs', 
        'May be able to skip'
      ] },
      { title: 'Hand and Finger Skills', items: [
        'Copies triangle and geometric patterns', 
        'Draws person with body', 
        'Prints some letters', 
        'Dresses and undresses without assistance', 
        'Uses fork, spoon', 
        'Usually cares for own toilet needs'
      ] },
      { title: 'Language', items: [
        'Recalls parts of a story', 
        'Speaks sentences of more than 5 words', 
        'Uses future tense', 
        'Tells longer stories', 
        'Says name and address'
      ] },
      { title: 'Cognitive', items: [
        'Can count 10 or more objects', 
        'Correctly names at least 4 colors', 
        'Better understands the concept of time', 
        'Knows about items used every day in the home'
      ] },
      { title: 'Social', items: [
        'Wants to please and be with friends', 
        'More likely to agree to rules', 
        'Likes to sing, dance, and act', 
        'Shows more independence'
      ] }
    ],
    redFlags: [
      'Exhibits extremely aggressive or timid behavior', 
      'Is unable to separate from parents', 
      'Is easily distracted (> 5 mins)', 
      'Shows little interest in playing with other children', 
      'Refuses to respond to people in general', 
      'Rarely uses fantasy or imitation in play', 
      'Seems unhappy or sad much of the time', 
      'Avoids or seems aloof with others', 
      'Doesn\'t express wide range of emotions', 
      'Has trouble eating, sleeping, or using the toilet', 
      'Can\'t differentiate between fantasy and reality', 
      'Seems unusually passive', 
      'Can\'t understand two-part commands', 
      'Can\'t give first and last name', 
      'Doesn\'t use plurals or past tense', 
      'Cannot build a tower of 6 to 8 blocks', 
      'Seems uncomfortable holding a crayon', 
      'Has trouble taking off clothing', 
      'Can\'t brush teeth or wash hands'
    ]
  }
];

let seederActive = false;

export const autoSeed = async () => {
  if (seederActive) return;
  seederActive = true;
  
  const state = useStore.getState();
  
  // Only seed if templates are empty to avoid overwriting user data
  if (state.milestoneTemplates.length === 0) {
    console.log("Seeding ECDC Milestone Templates...");
    try {
      for (const template of ECDC_FULL_DATA) {
        await state.saveMilestoneTemplate(template);
      }
      console.log("ECDC Seeding Complete.");
    } catch (err) {
      console.error("Seeding failed:", err);
    }
  }
  
  seederActive = false;
};
