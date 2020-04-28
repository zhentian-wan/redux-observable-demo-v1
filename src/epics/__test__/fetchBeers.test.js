import { TestScheduler } from 'rxjs/testing'
import { of } from 'rxjs'

import {
  search,
  setStatus,
  fetchFulfilled,
  fetchFailed,
  cancel,
  reset,
} from '../../actions/beerActions'
import { initialState } from '../../reducers/configReducer'
import { fetchBeersEpic } from '../fetchBeers'

it('produces correct actions (success)', function() {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
  })

  testScheduler.run(({ hot, cold, expectObservable }) => {
    const action$ = hot('a', {
      a: search('ship'),
    })
    const state$ = of({
      config: initialState,
    })
    const dependencies = {
      getJSON: (url) => {
        return cold('---a', {
          a: [{ name: 'Beer 1' }],
        })
      },
    }
    const output$ = fetchBeersEpic(action$, state$, dependencies)
    // a: 500ms
    // -: 501ms,
    // b: 502ms
    expectObservable(output$).toBe('500ms a--b', {
      a: setStatus('pending'),
      b: fetchFulfilled([{ name: 'Beer 1' }]),
    })
  })
})

it('produces correct actions (error)', function() {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
  })

  testScheduler.run(({ hot, cold, expectObservable }) => {
    const action$ = hot('a', {
      a: search('ship'),
    })
    const state$ = of({
      config: initialState,
    })
    const dependencies = {
      getJSON: (url) => {
        return cold('---#', null, {
          response: {
            message: 'oops!',
          },
        })
      },
    }
    const output$ = fetchBeersEpic(action$, state$, dependencies)

    expectObservable(output$).toBe('500ms a--b', {
      a: setStatus('pending'),
      b: fetchFailed('oops!'),
    })
  })
})

it('produces correct actions (reset)', function() {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
  })

  testScheduler.run(({ hot, cold, expectObservable }) => {
    const action$ = hot('a 500ms -b', {
      a: search('ship'),
      b: cancel(),
    })
    const state$ = of({
      config: initialState,
    })
    const dependencies = {
      getJSON: (url) => {
        return cold('---a', [{ name: 'Beer 1' }])
      },
    }
    const output$ = fetchBeersEpic(action$, state$, dependencies)
    expectObservable(output$).toBe('500ms a-b', {
      a: setStatus('pending'),
      b: reset(),
    })
  })
})
