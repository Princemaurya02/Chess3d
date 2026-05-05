import { useReducer, useEffect, useRef, useCallback } from 'react';
import { reducer, init, A } from '../state/ludoReducer';

export function useLudo(n=4) {
  const [s, d] = useReducer(reducer, init(n));
  const t = useRef();

  useEffect(() => {
    if (s._auto) {
      t.current = setTimeout(() => d({type:A.NEXT, t:s._next}), 1100);
      return () => clearTimeout(t.current);
    }
  }, [s._auto, s._next]);

  return {
    state: s,
    current: s.order[s.turn] ?? null,
    start:  useCallback((n)=>d({type:A.START,n}), []),
    roll:   useCallback(()=>d({type:A.ROLL}), []),
    select: useCallback((idx)=>d({type:A.SELECT,idx}), []),
  };
}
