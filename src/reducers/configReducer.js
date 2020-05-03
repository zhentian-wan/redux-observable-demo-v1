import { SET_CONFIG } from '../actions/configActions'

export const initialState = {
  apiBase: 'https://api.punkapi.com/v2/beers',
  perPage: 10,
}

export function configReducer(state = initialState, action) {
  switch (action.type) {
    case SET_CONFIG: {
      return {
        ...state,
        ...action.payload,
      }
    }
    default:
      return state
  }
}

export const apiBaseSelector = (state) => state.config.apiBase
export const perPageSelector = (state) => state.config.perPage
