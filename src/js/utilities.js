var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const API_BASE = "https://chriscorchado.com/drupal8";
import { noRecordsFound } from './search';
const fadeOut = (el) => {
    el.style.opacity = 1;
    (function fade() {
        if ((el.style.opacity -= 0.2) < 0) {
            el.style.display = "none";
        }
        else {
            requestAnimationFrame(fade);
        }
    })();
};
const fadeIn = (el) => {
    el.style.opacity = 0;
    (function fade() {
        var val = parseFloat(el.style.opacity);
        if (!((val += 0.2) > 1)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
        }
    })();
};
const updateMenuPages = (currentPage, targetContainer) => __awaiter(void 0, void 0, void 0, function* () {
    yield fetch(`${API_BASE}/api/menu_items/main?_format=json`)
        .then((resp) => {
        return resp.ok ? resp.json() : Promise.reject(resp.statusText);
    })
        .then((pageData) => {
        let pageName = "";
        let pageLink = "";
        let homepageStyle = "";
        if (currentPage == "about") {
            homepageStyle = "border: 1px dashed rgb(115, 153, 234);";
        }
        let generatedPageLinks = `<a href="index.html" class="navbar-brand" id="logo" style="${homepageStyle}">
        <img src="./images/chriscorchado-initials-logo.png" title="Home" alt="Home">
      </a>`;
        for (let page in pageData) {
            pageName = pageData[page].title;
            if (pageName == "Home" || pageName == "About" || !pageData[page].enabled) {
                continue;
            }
            let activeNavItem = "";
            if (currentPage == pageName.toLowerCase()) {
                activeNavItem = "nav-item-active";
            }
            pageLink = pageName;
            if (pageName == "Companies")
                pageName = "History";
            generatedPageLinks += `<a href="${pageLink.toLowerCase()}.html"
        class="nav-item nav-link ${activeNavItem}"
        title="${pageName}"
        id="${pageName.toLowerCase()}-link">${pageName}</a>`;
        }
        document.getElementById(targetContainer).innerHTML = generatedPageLinks;
    })
        .catch((error) => {
        alert(`Sorry an error has occurred: ${error}`);
    });
});
const getCurrentPage = () => {
    let thisPage = window.location.pathname
        .split("/")
        .filter(function (pathnamePieces) {
        return pathnamePieces.length;
    })
        .pop();
    let pageName = "";
    if (thisPage)
        pageName = thisPage.split(".")[0];
    if (pageName == "index" || !pageName)
        pageName = "about";
    return pageName;
};
const getFullUrlByPage = (linkToFix, page) => {
    let pathToResource = "No Path Found";
    switch (page) {
        case "companies":
            pathToResource = "company-screenshot";
            break;
        case "courses":
            if (linkToFix.indexOf(".pdf") !== -1) {
                pathToResource = "award-pdf";
            }
            else {
                pathToResource = "award-images";
            }
            break;
        case "projects":
            pathToResource = "project-screenshot";
            break;
    }
    return `${API_BASE}/sites/default/files/${pathToResource}/${linkToFix}`;
};
const getMonthYear = (dateString) => {
    let newDate = new Date(dateString);
    return (newDate.toLocaleString("default", { month: "long" }) +
        " " +
        newDate.getFullYear().toString());
};
const cleanURL = (urlToClean) => {
    let fixedURL = "";
    let strings = urlToClean.split(" ");
    strings.forEach((element) => {
        if (element)
            fixedURL += element.replace(/$\n^\s*/gm, "");
    });
    return fixedURL;
};
const setLoading = (loadingStatus) => {
    if (loadingStatus) {
        let preloader = document.createElement("div");
        preloader.innerHTML = `
      <div class="preloadAnimation" id="preloadAnimation">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
        <br />Loading
      </div>`;
        document.body.append(preloader);
    }
    else {
        document.getElementById("preloadAnimation").remove();
        if (document.getElementsByClassName("container")[0]) {
            let mainContainer = document.getElementsByClassName("container")[0];
            fadeIn(mainContainer);
        }
        if (document.getElementsByClassName("container")[1]) {
            let dataContainer = document.getElementsByClassName("container")[1];
            fadeIn(dataContainer);
        }
    }
};
const updateInterface = (search) => {
    noRecordsFound("noRecords", search, "navigation", "No matches found for");
};
export { fadeOut, fadeIn, updateMenuPages, getCurrentPage, getFullUrlByPage, getMonthYear, cleanURL, setLoading, updateInterface };
