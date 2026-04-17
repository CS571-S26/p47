import { createContext } from 'react'

const noop = async () => {}

export const ConcertsContext = createContext({
  concerts: [],
  loading: false,
  error: '',
  addConcert: noop,
  updateConcert: noop,
  deleteConcert: noop,
  getConcert: () => undefined,
})
