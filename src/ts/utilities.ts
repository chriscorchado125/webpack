const API_BASE = 'https://chriscorchado.com/drupal8';

import { noRecordsFound } from './search'

// https://gist.github.com/alirezas/c4f9f43e9fe1abba9a4824dd6fc60a55
/**
 * Pure JS fade in using opacity
 * @param {any} HTML element
 */
const fadeOut = (el: any) => {
  el.style.opacity = 1;

  (function fade() {
    if ((el.style.opacity -= 0.2) < 0) {
      el.style.display = 'none';
    } else {
      requestAnimationFrame(fade);
    }
  })();
};

/**
 * Pure JS fade out using opacity
 * @param {any} HTML element
 */
const fadeIn = (el: any) => {
  el.style.opacity = 0;

  (function fade() {
    var val = parseFloat(el.style.opacity);

    if (!((val += 0.2) > 1)) {
      el.style.opacity = val;
      requestAnimationFrame(fade);
    }
  })();
};

/**
 * Replace static navigation with data from the menu API
 * @param {string} currentPage - page name
 * @param {string} targetContainer - id of html container for the menu items
 */
const updateMenuPages = async (currentPage: string, targetContainer: string) => {
  await fetch(`${API_BASE}/api/menu_items/main?_format=json`)
    .then((resp) => {
      return resp.ok ? resp.json() : Promise.reject(resp.statusText);
    })
    .then((pageData) => {
      let pageName = '';
      let pageLink = '';

      let homepageStyle = '';
      if (currentPage == 'about') {
        homepageStyle = 'border: 1px dashed rgb(115, 153, 234);';
      }

      let generatedPageLinks = `<a href='index.html' class='navbar-brand' id='logo' style='${homepageStyle}'>
        <img src='./images/chriscorchado-initials-logo.png' title='Home' alt='Home'>
      </a>`;

      for (let page in pageData) {
        pageName = pageData[page].title;
        if (pageName == 'Home' || pageName == 'About' || !pageData[page].enabled) {
          continue;
        }

        let activeNavItem = '';
        if (currentPage == pageName.toLowerCase()) {
          activeNavItem = 'nav-item-active';
        }

        pageLink = pageName; // capture correct link name before pageName is updated
        if (pageName == 'Companies') pageName = 'History';

        generatedPageLinks += `<a href='${pageLink.toLowerCase()}.html'
        class='nav-item nav-link ${activeNavItem}'
        title='${pageName}'
        id='${pageName.toLowerCase()}-link'>${pageName}</a>`;
      }

      document.getElementById(targetContainer).innerHTML = generatedPageLinks;
    })
    .catch((error) => {
      alert(`Sorry an error has occurred: ${error}`);
    });
};

/**
 * Get the current page name
 * @return {string} - page name
 */
const getCurrentPage = () => {
  let thisPage = window.location.pathname
    .split('/')
    .filter(function (pathnamePieces) {
      return pathnamePieces.length;
    })
    .pop();

  let pageName = '';
  if (thisPage) pageName = thisPage.split('.')[0];

  if (pageName == 'index' || !pageName) pageName = 'about';

  return pageName;
};

/**
 * Create absolute link
 * @param {string} linkToFix - relative url
 * @param {string} page - page name
 * @return {string} - absolute url
 */
const getFullUrlByPage = (linkToFix: string, page: string) => {
  let pathToResource = 'No Path Found';

  switch (page) {
    case 'companies':
      pathToResource = 'company-screenshot';
      break;
    case 'courses':
      if (linkToFix.indexOf('.pdf') !== -1) {
        pathToResource = 'award-pdf';
      } else {
        pathToResource = 'award-images';
      }
      break;
    case 'projects':
      pathToResource = 'project-screenshot';
      break;
  }

  return `${API_BASE}/sites/default/files/${pathToResource}/${linkToFix}`;
};

/**
 * Change date to name of the month plus the 4 digit year
 * @param {string} dateString - date value
 * @return {string} - month and year - example: January 2020
 */
const getMonthYear = (dateString: string) => {
  let newDate = new Date(dateString);

  return (
    newDate.toLocaleString('default', { month: 'long' }) +
    ' ' +
    newDate.getFullYear().toString()
  );
};

/**
 * Remove newline characters and spaces from URLs created using multi-line template literals
 * @param {string} urlToClean - URL to fix
 * @return {string} - fixed URL
 */
const cleanURL = (urlToClean: string) => {
  let fixedURL = '';
  let strings = urlToClean.split(' ');
  strings.forEach((element: string) => {
    if (element) fixedURL += element.replace(/$\n^\s*/gm, '');
  });
  return fixedURL;
};

/**
 * Toggle content and preloader
 * @param {boolean} loadingStatus
 */
const setLoading = (loadingStatus: boolean) => {
  if (loadingStatus) {
    let preloader = document.createElement('div');

    preloader.innerHTML = `
      <div class='preloadAnimation' id='preloadAnimation'>
        <div class='bounce1'></div>
        <div class='bounce2'></div>
        <div class='bounce3'></div>
        <br />Loading
      </div>`;

    document.body.append(preloader);
  } else {
    document.getElementById('preloadAnimation').remove();

    if (document.getElementsByClassName('container')[0]) {
      let mainContainer = document.getElementsByClassName('container')[0] as HTMLElement;
      fadeIn(mainContainer);
    }
    if (document.getElementsByClassName('container')[1]) {
      let dataContainer = document.getElementsByClassName('container')[1] as HTMLElement;
      fadeIn(dataContainer);
    }
  }
};

/**
 * Toggle the preloader, searchCount, paging-info, pagination and message elements
 * @param {string=} search - (optional) searched for text
 */
const updateInterface = (search?: string) => {
  noRecordsFound('noRecords', search, 'navigation', 'No matches found for');
};

export { fadeOut, fadeIn, updateMenuPages, getCurrentPage, getFullUrlByPage, getMonthYear, cleanURL, setLoading, updateInterface }
