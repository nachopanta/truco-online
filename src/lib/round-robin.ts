export interface ScheduledMatch {
  round: number;
  homeTeamId: string;
  awayTeamId: string;
}

// Método del círculo: un equipo queda fijo y el resto rota en cada fecha.
export function generateRoundRobin(teamIds: string[], doubleRound: boolean): ScheduledMatch[] {
  const teams: (string | null)[] = [...teamIds];
  if (teams.length % 2 !== 0) teams.push(null); // equipo libre

  const n = teams.length;
  const rounds = n - 1;
  const half = n / 2;
  const matches: ScheduledMatch[] = [];

  let arrangement = [...teams];
  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const a = arrangement[i];
      const b = arrangement[n - 1 - i];
      if (a === null || b === null) continue;

      const [home, away] = round % 2 === 0 ? [a, b] : [b, a];
      matches.push({ round: round + 1, homeTeamId: home, awayTeamId: away });
    }

    const fixed = arrangement[0];
    const rest = arrangement.slice(1);
    rest.unshift(rest.pop()!);
    arrangement = [fixed, ...rest];
  }

  if (doubleRound) {
    const secondLeg = matches.map((m) => ({
      round: m.round + rounds,
      homeTeamId: m.awayTeamId,
      awayTeamId: m.homeTeamId,
    }));
    matches.push(...secondLeg);
  }

  return matches;
}
