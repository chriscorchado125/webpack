const API_BASE = "https://chriscorchado.com/drupal8";
const MAX_ITEMS_PER_PAGE = 50;
const SITE_SEARCH_ID = "searchSite";
import { getPage } from './data';
import { updateInterface, getCurrentPage } from './utilities';
const getSearchCount = (count, searchCountID) => {
    let searchElement = document.getElementById(SITE_SEARCH_ID);
    if (searchElement.value) {
        if (count <= MAX_ITEMS_PER_PAGE) {
            document.getElementById(searchCountID).innerHTML =
                count + `  ${count == 1 ? "Item" : "Items"}`;
        }
        else {
            document.getElementById(searchCountID).innerHTML =
                MAX_ITEMS_PER_PAGE + `  ${+MAX_ITEMS_PER_PAGE == 1 ? "Item" : "Items"}`;
        }
        return `${count} ${count == 1 ? "Item" : "Items"} `;
    }
};
const getSearchOffset = (link) => {
    let nextURL = link.href.replace(/%2C/g, ",").replace(/%5B/g, "[").replace(/%5D/g, "]");
    return nextURL.substring(nextURL.search("offset") + 8, nextURL.search("limit") - 6);
};
const setPagination = (count, paginationTotal, prev, next) => {
    let dataOffset = 0;
    let prevLink = "";
    let nextLink = "";
    if (next)
        dataOffset = getSearchOffset(next);
    let dataOffsetText = getSearchCount(count, "searchCount");
    if (!next && !prev) {
        document.getElementById("search-container").className = "paginationNo";
        document.getElementById("searchCount").innerHTML = `<span id="totalItems">${count}</span>
   ${count == 1 ? "Item" : "Items"}`;
    }
    else {
        document.getElementById("search-container").className = "paginationYes";
        let currentCount = +dataOffset / MAX_ITEMS_PER_PAGE;
        if (count == dataOffset) {
            dataOffsetText = `Items 1-<span id="lastCount">${MAX_ITEMS_PER_PAGE}</span>`;
        }
        else {
            if (currentCount !== 0) {
                dataOffsetText = `Items ${currentCount * MAX_ITEMS_PER_PAGE - MAX_ITEMS_PER_PAGE}-<span id="lastCount">${currentCount * MAX_ITEMS_PER_PAGE}</span>`;
            }
            else {
                dataOffsetText = `Items ${paginationTotal}-<span id="lastCount">${+paginationTotal + count}</span>`;
            }
        }
        document.getElementById("searchCount").innerHTML = `<span id="paging-info">${dataOffsetText}</span>`;
        prevLink = prev
            ? `<a href="#" class="pager-navigation" id="prev" data-prev="${prev.href}" title="View the previous page" role="button"
         >Prev</a>`
            : `<span class="pager-navigation disabled" title="There is no previous page available" role="button">Prev</span>`;
        nextLink = next
            ? `<a href="#" class="pager-navigation" id="next" data-next="${next.href}" title="View the next page" role="button"
          >Next</a>`
            : `<span class="pager-navigation disabled" title="There is no next page available" role="button">Next</span>`;
    }
    let paginationCount = document.getElementById("pagination");
    if (count < MAX_ITEMS_PER_PAGE && paginationTotal === 1) {
        paginationCount.style.display = "none";
    }
    else {
        paginationCount.style.display = "inline-block";
        paginationCount.innerHTML = `${prevLink}  ${nextLink}`;
    }
};
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
const debounceMe = debounce((event) => {
    const inputSearchBox = document.getElementById(SITE_SEARCH_ID);
    if (event.key !== "Tab") {
        getPage(getCurrentPage(), inputSearchBox.value);
        updateInterface();
    }
}, 500);
const searchFilter = (event) => {
    const allowOnlyLettersAndSpace = new RegExp("^(?! )[A-Za-z\s]*$");
    return allowOnlyLettersAndSpace.test(event.key);
};
const searchClear = (searchTextBoxID) => {
    const inputSearchBox = document.getElementById(searchTextBoxID);
    inputSearchBox.value = "";
    location.reload();
};
const noRecordsFound = (noRecordID, search, appendToID, msg) => {
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
    }
    else {
        document.getElementById("pagination").style.display = "inline-block";
        document.getElementById("searchBtn").style.visibility = "visible";
    }
};
const getIncludedData = (data) => {
    let includedAssetFilename = [""];
    let includedCompanyName = [""];
    let includedTechnologyName = [""];
    let includedTechnologyIcon = [""];
    data.included.forEach((included_element) => {
        if (included_element.attributes.description) {
            let iconFileNamePath = /"(.*?)"/.exec(included_element.attributes.description.value);
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
const getElementRelationships = (element, includedAssetFilename, includedCompanyName, includedTechnologyName, includedTechnologyIcon) => {
    let imgPieces = [];
    let itemPDF = "";
    let itemTrackImage = "";
    let itemCompanyName = "";
    let itemTechnology = "";
    let itemTechnologyIcon = "";
    let includedTechnologyItem = [];
    if (element.relationships.field_award_images &&
        element.relationships.field_award_images.data) {
        imgPieces.push(includedAssetFilename[element.relationships.field_award_images.data[0].id]);
    }
    if (element.relationships.field_award_pdf &&
        element.relationships.field_award_pdf.data) {
        itemPDF = includedAssetFilename[element.relationships.field_award_pdf.data.id];
    }
    if (element.relationships.field_track_image &&
        element.relationships.field_track_image.data) {
        itemTrackImage =
            includedAssetFilename[element.relationships.field_track_image.data.id];
    }
    if (element.relationships.field_company && element.relationships.field_company.data) {
        itemCompanyName = includedCompanyName[element.relationships.field_company.data.id];
    }
    if (element.relationships.field_company_screenshot &&
        element.relationships.field_company_screenshot.data) {
        imgPieces.push(includedAssetFilename[element.relationships.field_company_screenshot.data[0].id]);
    }
    if (element.relationships.field_screenshot &&
        element.relationships.field_screenshot.data) {
        for (let i = 0; i < element.relationships.field_screenshot.data.length; i++) {
            imgPieces.push(includedAssetFilename[element.relationships.field_screenshot.data[i].id]);
        }
    }
    if (element.relationships.field_project_technology &&
        element.relationships.field_project_technology.data) {
        for (let i = 0; i < element.relationships.field_project_technology.data.length; i++) {
            itemTechnology +=
                includedTechnologyName[element.relationships.field_project_technology.data[i].id] + ", ";
            itemTechnologyIcon +=
                includedTechnologyIcon[element.relationships.field_project_technology.data[i].id] + ", ";
            let technologyItem = {
                name: includedTechnologyName[element.relationships.field_project_technology.data[i].id],
                image: includedTechnologyIcon[element.relationships.field_project_technology.data[i].id]
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
const itemWithSearchHighlight = (itemToHighlight, searchedFor) => {
    let dataToReturn = "";
    if (searchedFor) {
        let searchTerm = new RegExp(searchedFor, "gi");
        let results = "";
        let searchString = "";
        let searchStringArray = [];
        if (itemToHighlight && +itemToHighlight !== -1) {
            searchString = itemToHighlight.replace("&amp;", "&").replace("&#039;", "'");
        }
        if (searchString.indexOf("<ul>") !== -1) {
            let listItem = "";
            let searchWithHTML = searchString.replace("<ul>", "").replace("</ul>", "");
            searchStringArray = searchWithHTML.split("<li>");
            searchStringArray.forEach((element) => {
                if (element.length > 3) {
                    searchString = element.slice(0, element.lastIndexOf("<"));
                    if (searchString.match(searchTerm)) {
                        results = searchString.replace(searchTerm, (match) => `<span class="highlightSearchText">${match}</span>`);
                        listItem += `<li>${results}</li>`;
                    }
                    else {
                        listItem += `<li>${searchString}</li>`;
                    }
                }
            });
            dataToReturn = `<ul>${listItem}</ul>`;
        }
        else {
            if (searchString.match(searchTerm)) {
                results = searchString.replace(searchTerm, (match) => `<span class="highlightSearchText">${match}</span>`);
                dataToReturn += results;
            }
            else {
                dataToReturn += searchString;
            }
        }
    }
    return dataToReturn || itemToHighlight;
};
export { getSearchCount, getSearchOffset, setPagination, debounce, debounceMe, searchFilter, searchClear, noRecordsFound, getIncludedData, getElementRelationships, itemWithSearchHighlight };
