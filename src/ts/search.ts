const API_BASE = "https://chriscorchado.com/drupal8";
const MAX_ITEMS_PER_PAGE = 50;
const SITE_SEARCH_ID = "searchSite";

import { getPage } from './data'
import { updateInterface, getCurrentPage } from './utilities'

 /**
 * Get the current search count
 * @param {number} count - item count
 * @param {string} searchCountID - search count container id
 * @return {string} - item count with either 'Items' or 'Item'
 */
const getSearchCount = (count: number, searchCountID: string) => {
  let searchElement = <HTMLInputElement>document.getElementById(SITE_SEARCH_ID);

  if (searchElement.value) {
    if (count <= MAX_ITEMS_PER_PAGE) {
      document.getElementById(searchCountID).innerHTML =
        count + `  ${count == 1 ? "Item" : "Items"}`;
    } else {
      document.getElementById(searchCountID).innerHTML =
        MAX_ITEMS_PER_PAGE + `  ${+MAX_ITEMS_PER_PAGE == 1 ? "Item" : "Items"}`;
    }

    return `${count} ${count == 1 ? "Item" : "Items"} `;
  }
};

/**
 * Get the search item offset
 * @param {link} any - URL
 * @return {number} - offset number
 */
const getSearchOffset = (link: any) => {
  let nextURL = link.href.replace(/%2C/g, ",").replace(/%5B/g, "[").replace(/%5D/g, "]");
  return nextURL.substring(nextURL.search("offset") + 8, nextURL.search("limit") - 6);
};

/**
 * Setup pagination
 * @param {int} count - number of items
 * @param {int} paginationTotal - last pagination value
 * @param {Object=} prev - (optional) - link to previous results
 * @param {Object=} next - (optional) - link to next results
 */
const setPagination = (
  count: number,
  paginationTotal: number,
  prev?: any,
  next?: any
) => {
  let dataOffset = 0;
  let prevLink = "";
  let nextLink = "";

  if (next) dataOffset = getSearchOffset(next);

  let dataOffsetText = getSearchCount(count, "searchCount");

  // if there is a next or prev link then show the pagination
  if (!next && !prev) {
    document.getElementById("search-container").className = "paginationNo";
    document.getElementById(
      "searchCount"
    ).innerHTML = `<span id="totalItems">${count}</span>
   ${count == 1 ? "Item" : "Items"}`;
  } else {
    document.getElementById("search-container").className = "paginationYes";
    let currentCount = +dataOffset / MAX_ITEMS_PER_PAGE;

    // first page item count
    if (count == dataOffset) {
      dataOffsetText = `Items 1-<span id="lastCount">${MAX_ITEMS_PER_PAGE}</span>`;
    } else {
      // middle pages item counts
      if (currentCount !== 0) {
        dataOffsetText = `Items ${
          currentCount * MAX_ITEMS_PER_PAGE - MAX_ITEMS_PER_PAGE
        }-<span id="lastCount">${currentCount * MAX_ITEMS_PER_PAGE}</span>`;
      } else {
        // last page item count
        dataOffsetText = `Items ${paginationTotal}-<span id="lastCount">${
          +paginationTotal + count
        }</span>`;
      }
    }

    // add item counts to the page
    document.getElementById(
      "searchCount"
    ).innerHTML = `<span id="paging-info">${dataOffsetText}</span>`;

    // configure next and prev links
    prevLink = prev
      ? `<a href="#" class="pager-navigation" id="prev" data-prev="${prev.href}" title="View the previous page" tabindex="10" role="button"
         >Prev</a>`
      : `<span class="pager-navigation disabled" title="There is no previous page available" tabindex="11" role="button">Prev</span>`;
    nextLink = next
      ? `<a href="#" class="pager-navigation" id="next" data-next="${next.href}" title="View the next page" tabindex="12" role="button"
          >Next</a>`
      : `<span class="pager-navigation disabled" title="There is no next page available" tabindex="13" role="button">Next</span>`;
  }

  // hide pagination when the item count is less than the page limit and on the first page
  let paginationCount = document.getElementById("pagination");

  if (count < MAX_ITEMS_PER_PAGE && paginationTotal === 1) {
    paginationCount.style.display = "none";
  } else {
    paginationCount.style.display = "inline-block";
    paginationCount.innerHTML = `${prevLink}  ${nextLink}`;
  }
};

/**
 * Debounce search requests in order to improve performance
 * @param {any} function
 * @param {number} wait - time to wait in milliseconds before invoking search
 * @return {function} - as long as it continues to be invoked the function will not be triggered.
 */
const debounce = (func: any, wait: number) => {
  let timeout: any;

  return function executedFunction(...args: any) {
    // callback to be executed
    const later = () => {
      timeout = null; // indicate the debounce ended
      func(...args); // execute the callback
    };

    clearTimeout(timeout); // on every function execution
    timeout = setTimeout(later, wait); // restart the waiting period timeout
  };
};

/**
 * Triggered on the keyup event within search input box
 */
const debounceMe = debounce((event: any) => {
  const inputSearchBox = document.getElementById(SITE_SEARCH_ID)! as HTMLInputElement;

  if (event.key !== "Tab") {
    getPage(getCurrentPage(), inputSearchBox.value);
    updateInterface();
  }
}, 500);

/**
 * Filter what a user is allowed to enter in the search field
 * Only allow searching with a-Z, 0-9 and spaces
 * @param {KeyboardEvent} event - key event
 * @return {string} - allowed characters
 */
const searchFilter = (event: KeyboardEvent) => {
  let charCode = event.keyCode || event.which;

  return (
    (charCode >= 65 && charCode <= 122) || // a-z
    (charCode >= 96 && charCode <= 105) || // 0-9 numeric keypad
    (charCode >= 48 && charCode <= 57) || // 0-9 top of keyboard
    charCode == 16 || // shift key - A-Z
    charCode == 32 // space
  );
};

/**
 * Clear current search
 * @param {string} searchTextBoxID - id of search textbox
 */
const searchClear = (searchTextBoxID: string) => {
  const inputSearchBox = document.getElementById(searchTextBoxID)! as HTMLInputElement;
  inputSearchBox.value = "";
  //getPage(getCurrentPage());
  location.reload();
  //updateInterface();
};

/**
 * Handle no records
 * @param {string} noRecordID - id of div to create
 * @param {string} search - searched for text
 * @param {string} appendToID - id of element to append to
 * @param {string} msg - message
 */
const noRecordsFound = (
  noRecordID: string,
  search: string,
  appendToID: string,
  msg: string
) => {
  if (document.getElementById(noRecordID)) {
    document.getElementById(noRecordID).remove();
  }

  if (!document.getElementById(noRecordID) && search) {
    document.getElementById("pagination").style.display = "none";
    document.getElementsByClassName("container")[0].removeAttribute("style");

    let notFound = document.createElement("div");
    notFound.id = noRecordID;
    notFound.innerHTML = `${msg} '${search}'`;
    document.getElementById(appendToID).appendChild(notFound);

    document.getElementById("preloadAnimation").remove();

    document.getElementById("searchCount").innerHTML =
      '<b style="color:red">No match</b>';
  } else {
    document.getElementById("pagination").style.display = "inline-block";
    document.getElementById("searchBtn").style.visibility = "visible";
  }
};

/**
 * Parse out included data and return arrays
 * @param {Object} data - array of included data
 * @return {Array} - array of included data arrays
 */
const getIncludedData = (data: any) => {
  let includedAssetFilename = [""];
  let includedCompanyName = [""];
  let includedTechnologyName = [""];
  let includedTechnologyIcon = [""];

  data.included.forEach((included_element: any) => {
    if (included_element.attributes.description) {
      // extract image URL within quotes
      let iconFileNamePath = /"(.*?)"/.exec(
        included_element.attributes.description.value
      );
      includedTechnologyIcon[included_element.id] = iconFileNamePath[1];
    }

    if (included_element.attributes.filename) {
      includedAssetFilename[included_element.id] = included_element.attributes.filename;
    }

    if (included_element.attributes.field_company_name) {
      includedCompanyName[included_element.id] =
        included_element.attributes.field_company_name;
    }

    if (included_element.attributes.name) {
      includedTechnologyName[included_element.id] = included_element.attributes.name;
    }
  });

  return [
    includedCompanyName,
    includedAssetFilename,
    includedTechnologyName,
    includedTechnologyIcon
  ];
};

/**
 * Parse out element relationship data
 * @param {Object} element -  relationship data
 * @param {Array} includedAssetFilename
 * @param {Array} includedCompanyName
 * @param {Array} includedTechnologyName
 * @param {Array} includedTechnologyIcon
 * @return {Array} array of element relationship arrays
 */
const getElementRelationships = (
  element: any,
  includedAssetFilename: any,
  includedCompanyName: any,
  includedTechnologyName: any,
  includedTechnologyIcon: any
) => {
  let imgPieces = [];
  let itemPDF = "";
  let itemTrackImage = "";
  let itemCompanyName = "";
  let itemTechnology = "";
  let itemTechnologyIcon = "";
  let includedTechnologyItem = [];

  // get course screenshot filename
  if (
    element.relationships.field_award_images &&
    element.relationships.field_award_images.data
  ) {
    imgPieces.push(
      includedAssetFilename[element.relationships.field_award_images.data[0].id]
    );
  }

  // get course PDF filename
  if (
    element.relationships.field_award_pdf &&
    element.relationships.field_award_pdf.data
  ) {
    itemPDF = includedAssetFilename[element.relationships.field_award_pdf.data.id];
  }

  // get course track image filename
  if (
    element.relationships.field_track_image &&
    element.relationships.field_track_image.data
  ) {
    itemTrackImage =
      includedAssetFilename[element.relationships.field_track_image.data.id];
  }

  // get company name
  if (element.relationships.field_company && element.relationships.field_company.data) {
    itemCompanyName = includedCompanyName[element.relationships.field_company.data.id];
  }

  // get company screenshot filename
  if (
    element.relationships.field_company_screenshot &&
    element.relationships.field_company_screenshot.data
  ) {
    imgPieces.push(
      includedAssetFilename[element.relationships.field_company_screenshot.data[0].id]
    );
  }

  // get project screenshot filename
  if (
    element.relationships.field_screenshot &&
    element.relationships.field_screenshot.data
  ) {
    for (let i = 0; i < element.relationships.field_screenshot.data.length; i++) {
      imgPieces.push(
        includedAssetFilename[element.relationships.field_screenshot.data[i].id]
      );
    }
  }

  // get project technology name
  if (
    element.relationships.field_project_technology &&
    element.relationships.field_project_technology.data
  ) {
    for (let i = 0; i < element.relationships.field_project_technology.data.length; i++) {
      itemTechnology +=
        includedTechnologyName[
          element.relationships.field_project_technology.data[i].id
        ] + ", ";

      itemTechnologyIcon +=
        includedTechnologyIcon[
          element.relationships.field_project_technology.data[i].id
        ] + ", ";

      let technologyItem = {
        name:
          includedTechnologyName[
            element.relationships.field_project_technology.data[i].id
          ],
        image:
          includedTechnologyIcon[
            element.relationships.field_project_technology.data[i].id
          ]
      };

      includedTechnologyItem.push(technologyItem);
    }
  }

  return [
    imgPieces,
    itemPDF,
    itemTrackImage,
    itemCompanyName,
    itemTechnology,
    itemTechnologyIcon,
    includedTechnologyItem
  ];
};

/**
 * Highlight search term within a string
 * @param {string} itemToHighlight - string to search
 * @param {string} searchedFor - string to search for
 * @return {string} - search result with/without highlight
 */
const itemWithSearchHighlight = (itemToHighlight: string, searchedFor: string) => {
  let dataToReturn = "";

  if (searchedFor) {
    let searchTerm = new RegExp(searchedFor, "gi");
    let results = "";

    let searchString = "";
    let searchStringArray = [];

    if (itemToHighlight && +itemToHighlight !== -1) {
      searchString = itemToHighlight.replace("&amp;", "&").replace("&#039;", "'");
    }

    /* check for HTML
     * TODO: use entities within Drupal to avoid adding body content with HTML
     */
    if (searchString.indexOf("<ul>") !== -1) {
      let listItem = "";

      let searchWithHTML = searchString.replace("<ul>", "").replace("</ul>", ""); // remove ul tags
      searchStringArray = searchWithHTML.split("<li>"); // break the li items into an array

      searchStringArray.forEach((element) => {
        if (element.length > 3) {
          searchString = element.slice(0, element.lastIndexOf("<")); // remove closing li tag

          if (searchString.match(searchTerm)) {
            results = searchString.replace(
              searchTerm,
              (match) => `<span class="highlightSearchText">${match}</span>`
            );

            listItem += `<li>${results}</li>`;
          } else {
            listItem += `<li>${searchString}</li>`;
          }
        }
      });

      dataToReturn = `<ul>${listItem}</ul>`;
    } else {
      if (searchString.match(searchTerm)) {
        results = searchString.replace(
          searchTerm,
          (match) => `<span class="highlightSearchText">${match}</span>`
        );

        dataToReturn += results;
      } else {
        dataToReturn += searchString;
      }
    }
  }

  return dataToReturn || itemToHighlight;
};

export { getSearchCount, getSearchOffset, setPagination, debounce, debounceMe, searchFilter, searchClear, noRecordsFound, getIncludedData, getElementRelationships, itemWithSearchHighlight }
