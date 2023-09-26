export const randomDiceRoll = () => {
  return {
    whiteOne: getRandomNumber(1, 6),
    whiteTwo: getRandomNumber(1, 6),
    green: getRandomNumber(1, 6),
    red: getRandomNumber(1, 6),
    yellow: getRandomNumber(1, 6),
    blue: getRandomNumber(1, 6),
  };
};

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
