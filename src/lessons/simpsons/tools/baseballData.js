export const battingPlayers = [
  {
    name: "Jackie",
    className: "jackie",
    color: "#d7656a",
    lightColor: "#efb7ba",
    seasons: [
      { year: 2018, hits: 1, atBats: 20 },
      { year: 2019, hits: 24, atBats: 80 }
    ]
  },
  {
    name: "Arlo",
    className: "arlo",
    color: "#4388c9",
    lightColor: "#a9c9e8",
    seasons: [
      { year: 2018, hits: 12, atBats: 80 },
      { year: 2019, hits: 10, atBats: 20 }
    ]
  }
];

export function battingAverage({ hits, atBats }) {
  return hits / atBats;
}

export function playerTotal(player) {
  return player.seasons.reduce(
    (total, season) => ({
      hits: total.hits + season.hits,
      atBats: total.atBats + season.atBats
    }),
    { hits: 0, atBats: 0 }
  );
}

export function formatAverage(value) {
  return value.toFixed(3);
}
