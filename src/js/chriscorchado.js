"use strict";
import { getCurrentPage } from './utilities';
import { getPage } from './data';
window.onload = () => {
    getPage(getCurrentPage());
};
