import { COLORS, TOKENS_PER_PLAYER, BASE, DONE } from '../engine/ludoConstants';
import { rollDice, moveable, nextPos, findCapture, won } from '../engine/ludoEngine';

export const A = { START:'START', ROLL:'ROLL', SELECT:'SELECT', NEXT:'NEXT' };

const mkPlayers = n => Object.fromEntries(
  COLORS.map((c,i) => [c, { tokens: Array(TOKENS_PER_PLAYER).fill(BASE), active: i < n }])
);

export const init = (n=4) => ({
  phase:'idle', n, players: mkPlayers(n),
  order: COLORS.slice(0,n), turn:0,
  dice:null, rolled:false, canMove:[], winner:null,
  sixStreak:0, _auto:false, _next:0,
});

export function reducer(s, a) {
  switch(a.type) {
    case A.START: return {...init(a.n), phase:'playing'};

    case A.ROLL: {
      if (s.phase!=='playing'||s.rolled) return s;
      const col = s.order[s.turn];
      const d = rollDice();
      // 3 sixes forfeit
      if (d===6 && s.sixStreak>=2)
        return {...s,dice:d,rolled:true,canMove:[],sixStreak:0,
          _auto:true,_next:(s.turn+1)%s.n};
      const mv = moveable(s.players[col].tokens, d);
      if (!mv.length)
        return {...s,dice:d,rolled:true,canMove:[],_auto:true,_next:(s.turn+1)%s.n};
      return {...s, dice:d, rolled:true, canMove:mv};
    }

    case A.SELECT: {
      if (!s.rolled||s.phase!=='playing') return s;
      const {idx} = a;
      if (!s.canMove.includes(idx)) return s;
      const col = s.order[s.turn];
      const oldPos = s.players[col].tokens[idx];
      const newPos = nextPos(oldPos, s.dice);
      const cap = newPos < 52 ? findCapture(s.players, col, newPos) : null;
      const toks = [...s.players[col].tokens]; toks[idx]=newPos;
      let pl = {...s.players,[col]:{...s.players[col],tokens:toks}};
      if (cap) {
        const ct=[...pl[cap.color].tokens]; ct[cap.idx]=BASE;
        pl={...pl,[cap.color]:{...pl[cap.color],tokens:ct}};
      }
      if (won(toks)) return {...s,players:pl,phase:'over',winner:col,rolled:false,dice:null,canMove:[]};
      const extra = s.dice===6||!!cap;
      return {
        ...s, players:pl, rolled:false, dice:null, canMove:[],
        turn: extra?s.turn:(s.turn+1)%s.n,
        sixStreak: s.dice===6?s.sixStreak+1:0,
      };
    }

    case A.NEXT:
      return {...s,turn:a.t??(s.turn+1)%s.n,rolled:false,dice:null,canMove:[],_auto:false};

    default: return s;
  }
}
