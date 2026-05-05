import { useReducer, useCallback, useEffect, useRef } from 'react';
import { ludoReducer, getInitialState, ACTIONS } from '../state/ludoReducer';

export function useLudo(numPlayers = 4) {
  const [state, dispatch] = useReducer(ludoReducer, getInitialState(numPlayers));
  const autoNextRef = useRef(null);

  const startGame = useCallback((n = numPlayers) => {
    dispatch({ type: ACTIONS.START_GAME, payload: { numPlayers: n } });
  }, [numPlayers]);

  const rollDice = useCallback(() => {
    if (state.diceRolled || state.phase !== 'playing') return;
    dispatch({ type: ACTIONS.ROLL_DICE });
  }, [state.diceRolled, state.phase]);

  const selectToken = useCallback((tokenIdx) => {
    if (!state.diceRolled || state.phase !== 'playing') return;
    dispatch({ type: ACTIONS.SELECT_TOKEN, payload: { tokenIdx } });
  }, [state.diceRolled, state.phase]);

  // Auto-advance turn when no moves available
  useEffect(() => {
    if (state._autoNext) {
      if (autoNextRef.current) clearTimeout(autoNextRef.current);
      autoNextRef.current = setTimeout(() => {
        dispatch({ type: ACTIONS.NEXT_TURN, payload: { nextTurn: state.nextTurn } });
      }, 1200);
    }
    return () => clearTimeout(autoNextRef.current);
  }, [state._autoNext, state.nextTurn]);

  const currentColor = state.turnOrder?.[state.currentTurn] ?? null;

  return {
    state,
    currentColor,
    startGame,
    rollDice,
    selectToken,
  };
}
