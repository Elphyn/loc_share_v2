function generateName() {
  const adj = [
    "Fierce",

    "Creamy",

    "Tiny",

    "Mighty",

    "Fluffy",

    "Spicy",

    "Silent",

    "Jolly",

    "Sneaky",

    "Bright",

    "Golden",

    "Rapid",

    "Cozy",

    "Witty",

    "Happy",
  ];

  const nouns = [
    "Blueberry",

    "Strawberry",

    "Tiger",

    "Panda",

    "Rocket",

    "Cinnamon",

    "Maple",

    "Fox",

    "Dolphin",

    "Marshmallow",

    "Comet",

    "Pineapple",

    "Banana",

    "Cloud",

    "Sparrow",
  ];

  const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
  };

  return "".concat(
    adj[getRandomInt(adj.length)],
    " ",
    nouns[getRandomInt(nouns.length)],
  );
}

const name = generateName();

console.log("[DEBUG] Name: ", name);
