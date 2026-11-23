import { createContext, useContext } from 'react';
export const ActivityContext = createContext(null);
export function useActivity() { return useContext(ActivityContext); }