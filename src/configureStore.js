import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { appReducer } from "./reducers/appReducer";

import { combineEpics, createEpicMiddleware } from "redux-observable";
import { fetchBeersEpic, randomFetchEpic } from "./epics/fetchBeers";
import { beersReducers } from "./reducers/beerReducer";
import { configReducer } from "./reducers/configReducer";
import { persistEpic, hydrateEpic } from "./epics/persist";
import { ajax } from "rxjs/ajax";
export function configureStore(dependencies = {}) {
  const rootEpic = combineEpics(
    randomFetchEpic,
    fetchBeersEpic,
    persistEpic,
    hydrateEpic
  );
  const epicMiddleware = createEpicMiddleware({
    dependencies: {
      getJSON: ajax.getJSON,
      document: document,
      ...dependencies
    }
  });

  const rootReducer = combineReducers({
    app: appReducer,
    beers: beersReducers,
    config: configReducer
  });

  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(epicMiddleware))
  );

  epicMiddleware.run(rootEpic);
  return store;
}
