/** * Returns a random element of the list
 * @param {Array} list
 * @return {*}
 */
function randomChoice(list) {
  return list[Math.floor(Math.random() * list.length)]
}

/**
 * Returns a string with the first letter capitalized
 * @param {string} word
 * @return {string}
 */
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function hashStringToNumber(string) {
  let hash = 0, i, chr
  if (string.length === 0) return hash
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

let numNumbers = 100

export default function nameFromId(id) {
  let hash = hashStringToNumber(id)
  if (hash < 0) {
    hash = hash * -1
  }
  let index = hash % (adjectives.length * animals.length * numNumbers)
  let adjectiveIndex = Math.floor(index / (animals.length * numNumbers))
  let adjective = adjectives[adjectiveIndex]
  let remainingIndex = index - adjectiveIndex * animals.length * numNumbers
  let animal = animals[Math.floor(remainingIndex / numNumbers)]
  let number = remainingIndex % numNumbers

  return (adjective + capitalize(animal) + number).replace(' ', '').replace('-', '')
}

/**
 * Returns a random name consisting of random adjective + random animal + random number
 * @return {string}
 */
// export default function generateName() {
//   let randNum = Math.floor(Math.random() * numNumbers).toString()
//   return randomChoice(adjectives) + capitalize(randomChoice(animals)) + randNum
// }

const adjectives = [
  'affable',
  'affectionate',
  'agreeable',
  'ambitious',
  'amiable',
  'amicable',
  'amusing',
  'brave',
  'bright',
  'broad-minded',
  'calm',
  'careful',
  'charming',
  'communicative',
  'compassionate',
  'conscientious',
  'considerate',
  'convivial',
  'courageous',
  'courteous',
  'creative',
  'decisive',
  'determined',
  'diligent',
  'diplomatic',
  'dynamic',
  'easygoing',
  'emotional',
  'energetic',
  'enthusiastic',
  'exuberant',
  'fair-minded',
  'faithful',
  'fearless',
  'frank',
  'friendly',
  'funny',
  'generous',
  'gentle',
  'good',
  'gregarious',
  'hard-working',
  'helpful',
  'honest',
  'humorous',
  'imaginative',
  'impartial',
  'independent',
  'intellectual',
  'intelligent',
  'intuitive',
  'inventive',
  'kind',
  'loving',
  'loyal',
  'modest',
  'neat',
  'nice',
  'optimistic',
  'passionate',
  'patient',
  'persistent',
  'pioneering',
  'philosophical',
  'placid',
  'plucky',
  'polite',
  'powerful',
  'practical',
  'pro-active',
  'quick-witted',
  'quiet',
  'rational',
  'reliable',
  'reserved',
  'resourceful',
  'romantic',
  'self-confident',
  'self-disciplined',
  'sensible',
  'sensitive',
  'shy',
  'sincere',
  'sociable',
  'straightforward',
  'sympathetic',
  'thoughtful',
  'tidy',
  'tough',
  'unassuming',
  'understanding',
  'versatile',
  'warmhearted',
  'witty',
]

const animals = [
  'alligator',
  'alpaca',
  'ant',
  'antelope',
  'ape',
  'armadillo',
  'donkey',
  'baboon',
  'badger',
  'bat',
  'bear',
  'beaver',
  'bee',
  'beetle',
  'buffalo',
  'butterfly',
  'camel',
  'carabao',
  'caribou',
  'cat',
  'cattle',
  'cheetah',
  'chimpanzee',
  'chinchilla',
  'cicada',
  'clam',
  'cockroach',
  'cod',
  'coyote',
  'crab',
  'cricket',
  'crow',
  'deer',
  'dinosaur',
  'dog',
  'dolphin',
  'duck',
  'eagle',
  'echidna',
  'eel',
  'elephant',
  'elk',
  'ferret',
  'fish',
  'fly',
  'fox',
  'frog',
  'gerbil',
  'giraffe',
  'gnat',
  'wildebeest',
  'goat',
  'goldfish',
  'goose',
  'gorilla',
  'grasshopper',
  'guinea pig',
  'hamster',
  'hare',
  'hedgehog',
  'herring',
  'hippopotamus',
  'hornet',
  'horse',
  'hound',
  'hyena',
  'impala',
  'insect',
  'jackal',
  'jellyfish',
  'kangaroo',
  'koala',
  'leopard',
  'lion',
  'lizard',
  'llama',
  'locust',
  'louse',
  'macaw',
  'mallard',
  'mammoth',
  'manatee',
  'marten',
  'mink',
  'minnow',
  'mole',
  'monkey',
  'moose',
  'mosquito',
  'mouse',
  'mule',
  'muskrat',
  'otter',
  'ox',
  'oyster',
  'panda',
  'pig',
  'platypus',
  'porcupine',
  'prairie dog',
  'pug',
  'rabbit',
  'raccoon',
  'reindeer',
  'rhinoceros',
  'salmon',
  'sardine',
  'scorpion',
  'seal',
  'serval',
  'shark',
  'sheep',
  'skunk',
  'snail',
  'snake',
  'spider',
  'squirrel',
  'swan',
  'termite',
  'tiger',
  'trout',
  'turtle',
  'walrus',
  'wasp',
  'weasel',
  'whale',
  'wolf',
  'wombat',
  'woodchuck',
  'worm',
  'yak',
  'yellowjacket',
  'zebra',
]
