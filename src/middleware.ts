import { Middleware } from "redux";
import { RootState } from "Store";

export const loggerMiddleware: Middleware<{}, RootState> = store => next => action => {
    console.group(action.type);
    console.info('執行動作前 dispatching', action);
    let result = next(action);
    console.log('執行動作後 next state', store.getState());
    console.groupEnd();
    return result;
}
