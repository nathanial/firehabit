import createBrowserHistory from 'history/createBrowserHistory'
import {DB} from "./db/DB";

export const history = createBrowserHistory();
export const db = new DB();
