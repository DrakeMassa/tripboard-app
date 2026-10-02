export type GuideSectionId =
  | 'game-day'
  | 'coffee'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'hidden-gems'
  | 'outdoors'
  | 'shopping'
  | 'practical'
  | 'fun-facts';

export type GuideRecommendation = {
  id: string;
  name: string;
  section: GuideSectionId;
  tags: string[];
  localTake: string;
  practicalNote?: string;
  sourceUrl: string;
  rating?: {
    score: number;
    countLabel?: string;
    source: 'Google' | 'Tripadvisor' | 'Public reviews';
    checkedAt: string;
    sourceUrl: string;
  };
  mapArea?: 'campus' | 'downtown' | 'arcade' | 'south' | 'west' | 'nature' | 'river';
};

export type GuideVideo = {
  id: string;
  title: string;
  creator: string;
  label: string;
  url: string;
  provider: 'youtube';
  embedId: string;
};

export type DestinationGuide = {
  id: string;
  destination: string;
  updatedAt: string;
  intro: string;
  recommendations: GuideRecommendation[];
  videos: GuideVideo[];
};

export const guideSections: { id: GuideSectionId; label: string }[] = [
  { id: 'game-day', label: 'Game day' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'hidden-gems', label: 'Hidden gems' },
  { id: 'outdoors', label: 'Outdoors' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'practical', label: 'Practical' },
  { id: 'fun-facts', label: 'Fun facts' },
];

const columbiaGuide: DestinationGuide = {
  id: 'columbia-missouri',
  destination: 'Columbia, Missouri',
  updatedAt: 'October 2, 2026',
  intro:
    'A game-weekend shortlist that mixes Mizzou energy with the places locals actually return to. Start with the essentials, then leave room for one unplanned stop.',
  recommendations: [
    {
      id: 'faurot-field',
      name: 'Faurot Field at Memorial Stadium',
      section: 'game-day',
      tags: ['must do', 'sports', 'new for 2026'],
      localTake:
        'Build the day around the stadium, not just kickoff. The newly completed north end zone makes this centennial season a genuinely different visit from prior years.',
      practicalNote: 'Confirm kickoff, gate, bag, and mobile-ticket rules shortly before game day.',
      sourceUrl: 'https://mutigers.com/memorial-stadium-centennial-project',
      mapArea: 'campus',
    },
    {
      id: 'mizzou-parking',
      name: 'Plan parking before breakfast',
      section: 'game-day',
      tags: ['practical', 'save time'],
      localTake:
        'Lots close to Faurot are restricted on home-game weekends. Treat the parking pass or shuttle plan like a ticket and save its link in Trip Essentials.',
      practicalNote: 'Mizzou notes that Columbia Transit typically operates a football shuttle.',
      sourceUrl: 'https://mutigers.com/driving-directions-parking',
    },
    {
      id: 'shortwave',
      name: 'Shortwave Coffee',
      section: 'coffee',
      tags: ['local roaster', 'coffee-first'],
      localTake:
        'The pick when the coffee matters more than a giant breakfast menu: seasonal beans, careful roasting, and a distinctly Columbia feel.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/shortwave-coffee/',
      rating: {
        score: 4.8,
        source: 'Google',
        checkedAt: 'September 29, 2026',
        sourceUrl: 'https://mycoffeeexplorer.com/guides/columbia-mo',
      },
      mapArea: 'downtown',
    },
    {
      id: 'lakota',
      name: 'Lakota Coffee · Downtown',
      section: 'coffee',
      tags: ['classic', 'walkable', 'since 1992'],
      localTake:
        'A long-running Ninth Street stop that fits naturally before a campus walk through the Columns and Francis Quadrangle.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/lakota-coffee/',
      rating: {
        score: 4.7,
        source: 'Google',
        checkedAt: 'September 29, 2026',
        sourceUrl: 'https://mycoffeeexplorer.com/guides/columbia-mo',
      },
      mapArea: 'downtown',
    },
    {
      id: 'fretboard',
      name: 'Fretboard Coffee · Artist Alley',
      section: 'coffee',
      tags: ['fair-trade', 'micro-roaster', 'quiet start'],
      localTake:
        'A smaller-batch alternative to the better-known downtown stops, with fair-trade beans and an Artist Alley setting that rewards a slower morning.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/fretboard-coffee/',
      rating: {
        score: 4.7,
        source: 'Google',
        checkedAt: 'September 29, 2026',
        sourceUrl: 'https://mycoffeeexplorer.com/guides/columbia-mo',
      },
      mapArea: 'arcade',
    },
    {
      id: 'cafe-berlin',
      name: 'Cafe Berlin',
      section: 'breakfast',
      tags: ['local favorite', 'farm-sourced'],
      localTake:
        'The creative breakfast choice: handmade plates and ingredients sourced from nearby farms rather than a generic game-weekend brunch.',
      practicalNote: 'Popular weekends can be busy; go early.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/cafe-berlin/',
      rating: {
        score: 4.0,
        countLabel: '146 reviews',
        source: 'Tripadvisor',
        checkedAt: 'October 2, 2026',
        sourceUrl: 'https://www.tripadvisor.com/Restaurant_Review-g44257-d3193661-Reviews-Cafe_Berlin-Columbia_Missouri.html',
      },
      mapArea: 'downtown',
    },
    {
      id: 'ozark-biscuit',
      name: 'Ozark Mountain Biscuit & Bar',
      section: 'breakfast',
      tags: ['brunch', 'southern', 'great patio'],
      localTake:
        'A relaxed, distinctly Mid-Missouri brunch with Southern roots. Pair it with Logboat across the way later in the day.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/ozark-mountain-biscuit-co/',
      mapArea: 'arcade',
    },
    {
      id: 'goldies-bagels',
      name: 'Goldie’s Bagels',
      section: 'breakfast',
      tags: ['quick', 'downtown', 'grab-and-go'],
      localTake:
        'The efficient game-weekend breakfast: a locally recommended downtown stop when you want something good without turning breakfast into a two-hour event.',
      sourceUrl: 'https://www.visitcolumbiamo.com/things-to-do-in-columbia/columbia-mo-activity-guides/',
      mapArea: 'downtown',
    },
    {
      id: 'booches',
      name: 'Booches Billiard Hall',
      section: 'lunch',
      tags: ['iconic', 'casual', 'best value'],
      localTake:
        'Small burgers, old-school pool-hall atmosphere, and zero pretense—the classic local lunch before wandering The District.',
      practicalNote: 'The official city activity guide specifically warns visitors to bring cash.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/booches-billiard-hall/',
      mapArea: 'downtown',
    },
    {
      id: 'shakespeares',
      name: 'Shakespeare’s Pizza · Downtown',
      section: 'lunch',
      tags: ['casual', 'group-friendly', 'Mizzou institution'],
      localTake:
        'Easy, energetic, and unmistakably college-town Columbia—the safe group choice when everyone wants something unfussy.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/shakespeares-downtown/',
      mapArea: 'downtown',
    },
    {
      id: 'pizza-tree',
      name: 'Pizza Tree',
      section: 'lunch',
      tags: ['quick', 'creative slices', 'downtown'],
      localTake:
        'A fast lunch that still feels specific to Columbia. It is especially useful when the group wants different slices before a campus or downtown walk.',
      sourceUrl: 'https://www.visitcolumbiamo.com/things-to-do-in-columbia/columbia-mo-activity-guides/',
      mapArea: 'downtown',
    },
    {
      id: 'barred-owl',
      name: 'Barred Owl Butcher & Table',
      section: 'dinner',
      tags: ['nice', 'ingredient-driven', 'cocktails'],
      localTake:
        'The polished dinner pick without feeling corporate: whole-animal butchery, local sourcing, thoughtful cocktails, and enough energy for a celebratory night.',
      practicalNote: 'Dinner is listed Tuesday–Saturday; reserve ahead for a football weekend.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/barred-owl-butcher-table/',
      rating: {
        score: 4.5,
        countLabel: '410 reviews',
        source: 'Public reviews',
        checkedAt: 'October 2, 2026',
        sourceUrl: 'https://overlookmaps.com/places/barred-owl-butcher-and-table-columbia-4845823569030159',
      },
      mapArea: 'downtown',
    },
    {
      id: 'cherry-street',
      name: 'Cherry Street Cellar',
      section: 'dinner',
      tags: ['fancy', 'date night', 'wine'],
      localTake:
        'Choose this for the quieter, more refined dinner: seasonal land-and-sea cooking, a boutique wine list, and a cozy downtown room.',
      practicalNote: 'The restaurant encourages reservations.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/wine-cellar-bistro/',
      mapArea: 'downtown',
    },
    {
      id: 'murrys',
      name: 'Murry’s Restaurant',
      section: 'dinner',
      tags: ['best value', 'live jazz', 'local favorite'],
      localTake:
        'The insider dinner: a warm jazz-club mood, reliable food, and live music five nights a week without the special-occasion price posture.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/murrys/',
      mapArea: 'south',
    },
    {
      id: 'flyover',
      name: 'Flyover',
      section: 'dinner',
      tags: ['wood-fired', 'Midwestern', 'cocktails'],
      localTake:
        'A smart non-downtown dinner when you want wood-fired regional cooking and a proper cocktail program without defaulting to a steakhouse.',
      practicalNote: 'The official listing shows dinner Tuesday–Saturday; confirm hours and reserve for game weekend.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/flyover/',
      mapArea: 'south',
    },
    {
      id: 'ragtag',
      name: 'Ragtag Cinema',
      section: 'hidden-gems',
      tags: ['independent', 'rainy-day', 'culture'],
      localTake:
        'A genuinely local reset between bigger plans—an independent cinema that says more about Columbia than another national entertainment venue.',
      sourceUrl: 'https://www.visitcolumbiamo.com/things-to-do-in-columbia/columbia-mo-activity-guides/',
      mapArea: 'downtown',
    },
    {
      id: 'arcade-district',
      name: 'Arcade District wander',
      section: 'hidden-gems',
      tags: ['records', 'arcade', 'food'],
      localTake:
        'Browse B-Side Records, peek into Distant Planet Comics, then choose between a neon arcade stop or a drink nearby. It works best without a rigid itinerary.',
      sourceUrl: 'https://www.visitcolumbiamo.com/things-to-do-in-columbia/columbia-mo-activity-guides/',
      mapArea: 'arcade',
    },
    {
      id: 'blind-boone-home',
      name: 'Blind Boone Home',
      section: 'hidden-gems',
      tags: ['history', 'music', 'small stop'],
      localTake:
        'A compact, meaningful detour tied to pianist and composer John William “Blind” Boone—better local texture than filling every open hour with food and shopping.',
      sourceUrl: 'https://www.visitcolumbiamo.com/things-to-do-in-columbia/columbia-mo-activity-guides/',
      mapArea: 'downtown',
    },
    {
      id: 'rock-bridge',
      name: 'Rock Bridge Memorial State Park',
      section: 'outdoors',
      tags: ['hike', 'scenic', 'close to town'],
      localTake:
        'The best contrast to a stadium weekend: forest trails, the natural rock bridge, and Devil’s Ice Box only a short drive from Columbia.',
      practicalNote: 'Check current trail and cave conditions before leaving town.',
      sourceUrl: 'https://mostateparks.com/park/rock-bridge-memorial-state-park',
      mapArea: 'nature',
    },
    {
      id: 'coopers-landing',
      name: 'Cooper’s Landing at sunset',
      section: 'outdoors',
      tags: ['sunset', 'Missouri River', 'laid-back'],
      localTake:
        'A slower final-evening move: river views and sunset rather than another crowded downtown stop.',
      sourceUrl: 'https://www.visitcolumbiamo.com/things-to-do-in-columbia/columbia-mo-activity-guides/',
      mapArea: 'river',
    },
    {
      id: 'shelter-gardens',
      name: 'Shelter Gardens',
      section: 'outdoors',
      tags: ['free', 'easy', 'photogenic'],
      localTake:
        'A low-effort outdoor reset: five landscaped acres, a waterfall, reflecting pool, and enough visual variety for a good walk without committing to a hike.',
      practicalNote: 'The official listing says the gardens are open daily from 8 a.m. to dusk.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/shelter-gardens/',
      mapArea: 'west',
    },
    {
      id: 'mkt-trail',
      name: 'MKT Trail',
      section: 'outdoors',
      tags: ['walk', 'bike', 'close to town'],
      localTake:
        'The flexible outdoors option—walk a short stretch or ride farther toward the Katy Trail, with far less logistics than a full state-park outing.',
      sourceUrl: 'https://www.visitcolumbiamo.com/things-to-do-in-columbia/columbia-mo-activity-guides/',
      mapArea: 'west',
    },
    {
      id: 'the-district',
      name: 'The District + Yellow Dog Bookshop',
      section: 'shopping',
      tags: ['walkable', 'independent', 'downtown'],
      localTake:
        'Use Ninth and Broadway as the spine, then duck into locally owned shops. Yellow Dog is the character stop—not just a place to buy something.',
      sourceUrl: 'https://www.visitcolumbiamo.com/directory/yellow-dog-bookshop/',
      mapArea: 'downtown',
    },
    {
      id: 'columbia-farmers-market',
      name: 'Columbia Farmers Market',
      section: 'shopping',
      tags: ['producer-only', 'Saturday', 'local food'],
      localTake:
        'One of the strongest “shop local” choices because everything is grown, raised, or made by the participating producers—not a generic souvenir market.',
      practicalNote: 'The official schedule lists Saturday mornings; verify the October date before building the morning around it.',
      sourceUrl: 'https://www.visitcolumbiamo.com/event/columbia-farmers-market-12/',
      mapArea: 'west',
    },
    {
      id: 'i70-construction',
      name: 'Allow extra I-70 time',
      section: 'practical',
      tags: ['traffic', 'arrival day'],
      localTake:
        'Columbia’s visitor bureau currently warns that the I-70 improvement project is materially affecting travel through and around the city.',
      practicalNote: 'Recheck closures on arrival day rather than trusting an old route screenshot.',
      sourceUrl: 'https://www.visitcolumbiamo.com/',
    },
    {
      id: 'stadium-centennial',
      name: 'A 100-year stadium in a new era',
      section: 'fun-facts',
      tags: ['Mizzou', 'architecture', '2026'],
      localTake:
        'Memorial Stadium opened in 1926. Its $250 million north-end-zone project debuted for the 2026 centennial season, finally enclosing the bowl.',
      sourceUrl:
        'https://mutigers.com/news/2026/09/10/mizzou-to-host-sept-15-north-end-zone-open-house-at-memorial-stadium',
    },
    {
      id: 'como-rhythm',
      name: 'Columbia works in neighborhoods',
      section: 'fun-facts',
      tags: ['local rhythm', 'planning tip'],
      localTake:
        'The useful mental map is campus + The District + Arcade/Stockyards + nearby nature. Cluster stops instead of crisscrossing town for individual ratings.',
      sourceUrl: 'https://www.visitcolumbiamo.com/things-to-do-in-columbia/columbia-mo-activity-guides/',
    },
  ],
  videos: [
    {
      id: 'faurot-field-mini-movie',
      title: 'Faurot Field mini movie',
      creator: 'Mizzou Athletics · official YouTube',
      label: 'STADIUM STORY',
      url: 'https://www.youtube.com/watch?v=YcWXvJbkAK0',
      provider: 'youtube',
      embedId: 'YcWXvJbkAK0',
    },
    {
      id: 'mizzou-game-day',
      title: 'A game day in Columbia',
      creator: 'Mizzou Athletics · official YouTube',
      label: 'GAME WEEKEND',
      url: 'https://www.youtube.com/watch?v=vDQlqdtG8ms',
      provider: 'youtube',
      embedId: 'vDQlqdtG8ms',
    },
    {
      id: 'mizzou-brightside',
      title: 'Mr. Brightside at Faurot Field',
      creator: 'Mizzou Athletics · official YouTube',
      label: 'CROWD ENERGY',
      url: 'https://www.youtube.com/watch?v=MQ5tCdfyEcM',
      provider: 'youtube',
      embedId: 'MQ5tCdfyEcM',
    },
  ],
};

export function getDestinationGuide(location: string | null | undefined): DestinationGuide | null {
  const normalized = location?.trim().toLowerCase() ?? '';
  if (/\bcolumbia\b/.test(normalized) && /\b(missouri|mo)\b/.test(normalized)) return columbiaGuide;
  return null;
}
