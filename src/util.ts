import createBrowserHistory from 'history/createBrowserHistory'
import {DB} from "./db/DB";
import * as $ from 'jquery';

export const history = createBrowserHistory();
export const db = new DB();

export class MousePosition {
    static x: number;
    static y: number;
}

$(() => {
    document.addEventListener('mousemove', (event) => {
        MousePosition.x = event.clientX;
        MousePosition.y = event.clientY;
    });
});