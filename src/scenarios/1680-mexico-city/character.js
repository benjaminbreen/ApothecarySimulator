// Character configuration for Maria de Lima (1680 Mexico City scenario)

// Import portrait images
import marianormal from '../../assets/marianormal.jpg';
import mariahappy from '../../assets/mariahappy.jpg';
import mariasad from '../../assets/mariasad.jpg';
import mariaworried from '../../assets/mariaworried.jpg';
import mariadetermined from '../../assets/mariadetermined.jpg';
import mariacurious from '../../assets/mariacurious.jpg';

export default {
  name: 'Maria de Lima',
  age: 45,
  title: 'Independent Apothecary',
  level: 4,
  startingXP: 25, // Half of the 50 XP needed to reach level 5
  background: `Maria de Lima is a 45-year-old converso apothecary from Coimbra, Portugal. She fled to Mexico City 10 years ago after being arrested by the Portuguese Inquisition for secretly practicing Judaism. She now practices medicine illegally, without a physician's license, operating out of her small botica on the Calle de la Amargura. She lives in constant fear of being discovered by the Mexican Inquisition, which has recently intensified its persecution of conversos.`,

  // Portrait images by emotional state
  portraits: {
    normal: marianormal,
    happy: mariahappy,
    sad: mariasad,
    worried: mariaworried,
    determined: mariadetermined,
    curious: mariacurious
  },

  // Starting unlocked mixing methods
  startingMethods: ['Distill', 'Decoct', 'Calcinate', 'Confection'],

  // Starting stats
  stats: {
    health: 85,
    energy: 62
  }
};
