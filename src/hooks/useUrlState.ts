import { useQueryStates } from 'nuqs'

import { urlStateParsers } from '../lib/urlState'

export function useUrlState() {
  const [state, setUrlState] = useQueryStates(urlStateParsers, {
    history: 'replace',
    scroll: false,
  })

  return {
    ...state,
    setUrlState,
  }
}
