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
const MAX_ITEMS_PER_PAGE = 50;
const SITE_SEARCH_ID = "searchSite";
import { getFullUrlByPage, getCurrentPage, getMonthYear, cleanURL, setLoading, updateInterface } from './utilities';
import { setPagination, getIncludedData, getElementRelationships, itemWithSearchHighlight, debounceMe, searchFilter, searchClear } from './search';
import { formSubmitted } from './form';
const getPage = (page, search, pagingURL) => __awaiter(void 0, void 0, void 0, function* () {
    let data = null;
    setLoading(true);
    if (search) {
    }
    if (page == "contact") {
        if (location.toString().indexOf("submitted") == -1) {
            yield fetch(`${API_BASE}/contact/feedback`)
                .then((resp) => {
                return resp.ok ? resp.text() : Promise.reject(resp.statusText);
            })
                .then((page) => {
                data = page.replace(/\/drupal8/g, API_BASE);
                let form = data.substr(data.indexOf("<form class="), data.indexOf("</form>"));
                form = form.substr(0, form.indexOf("</form>") + 8);
                form = form.replace("Your email address", "Email");
                let script = data.substr(data.indexOf('<script type="application/json" data-drupal-selector="drupal-settings-json">'), data.indexOf("></script>"));
                script = script.substr(0, script.indexOf("</script>") + 9);
                data = `<h1 id="content">Contact</h1>${form} ${script}`;
            })
                .catch((error) => {
                alert(`Sorry an error has occurred: ${error}`);
            });
        }
        renderPage(data, page);
        setLoading(false);
        return false;
    }
    else {
        if (pagingURL) {
            data = yield getData(pagingURL);
        }
        else {
            switch (page) {
                case "about":
                    data = yield getData(`${API_BASE}/jsonapi/node/page?fields[node--page]=id,title,body&
              filter[id][operator]=CONTAINS&
              filter[id][value]=ca23f416-ad70-41c2-9228-52ba6577abfe`);
                    break;
                case "companies":
                    if (search) {
                        data = yield getData(`${API_BASE}/jsonapi/node/company?filter[or-group][group][conjunction]=OR&
                filter[field_company_name][operator]=CONTAINS&
                filter[field_company_name][value]=${search}&
                filter[field_company_name][condition][memberOf]=or-group&
                filter[field_job_title][operator]=CONTAINS&
                filter[field_job_title][value]=${search}&
                filter[field_job_title][condition][memberOf]=or-group&
                filter[body.value][operator]=CONTAINS&
                filter[body.value][value]=${search}&
                filter[body.value][condition][memberOf]=or-group&
                sort=-field_end_date&
                include=field_company_screenshot&
                page[limit]=${MAX_ITEMS_PER_PAGE}`);
                    }
                    else {
                        data = yield getData(`${API_BASE}/jsonapi/node/company?sort=-field_end_date&
                include=field_company_screenshot&
                page[limit]=${MAX_ITEMS_PER_PAGE}`);
                    }
                    break;
                case "courses":
                    if (search) {
                        data = yield getData(`${API_BASE}/jsonapi/node/awards?filter[or-group][group][conjunction]=OR&
                filter[title][operator]=CONTAINS&
                filter[title][value]=${search}&
                filter[title][condition][memberOf]=or-group&
                filter[field_award_date][operator]=CONTAINS&
                filter[field_award_date][value]=${search}&
                filter[field_award_date][condition][memberOf]=or-group&
                sort=-field_award_date&
                include=field_award_pdf,field_track_image,field_award_images&
                page[limit]=${MAX_ITEMS_PER_PAGE}`);
                    }
                    else {
                        data = yield getData(`${API_BASE}/jsonapi/node/awards?sort=-field_award_date&
                include=field_award_pdf,field_track_image,field_award_images&
                page[limit]=${MAX_ITEMS_PER_PAGE}`);
                    }
                    break;
                case "projects":
                    if (search) {
                        data = yield getData(`${API_BASE}/jsonapi/node/project?filter[or-group][group][conjunction]=OR&
              filter[title][operator]=CONTAINS&
              filter[title][value]=${search}&
              filter[title][condition][memberOf]=or-group&
              filter[taxonomy_term--tags][path]=field_project_technology.name&
              filter[taxonomy_term--tags][operator]=CONTAINS&
              filter[taxonomy_term--tags][value]=${search}&
              filter[taxonomy_term--tags][condition][memberOf]=or-group&
              filter[field_company.title][operator]=CONTAINS&
              filter[field_company.title][value]=${search}&
              filter[field_company.title][condition][memberOf]=or-group&
              filter[field_screenshot.meta.alt][operator]=CONTAINS&
              filter[field_screenshot.meta.alt][value]=${search}&
              filter[field_screenshot.meta.alt][condition][memberOf]=or-group&
              filter[field_date][operator]=CONTAINS&filter[field_date][value]=${search}&
              filter[field_date][condition][memberOf]=or-group&
              sort=-field_date&field_company.title&
              include=field_project_technology,field_company,field_screenshot&fields[node--company]=field_company_name,field_video_url&
              fields[node--project]=title,body,field_date,field_screenshot,field_project_technology,field_company,field_video_url&
              page[limit]=${MAX_ITEMS_PER_PAGE}`);
                    }
                    else {
                        data = yield getData(`${API_BASE}/jsonapi/node/project?sort=-field_date&field_company.title&
                include=field_project_technology,field_company,field_screenshot&
                fields[node--company]=field_company_name,field_video_url&
                fields[node--project]=title,body,field_date,field_screenshot,field_project_technology,field_company,field_video_url&
                page[limit]=${MAX_ITEMS_PER_PAGE}`);
                    }
                    break;
            }
        }
    }
    let passedInCount = {
        currentCount: document.getElementById("lastCount")
            ? document.getElementById("lastCount").textContent
            : 1
    };
    data = Object.assign(Object.assign({}, data), { passedInCount });
    if (data.data.length) {
        renderPage(data, page, search, data.links.next, data.links.prev);
    }
    else {
        updateInterface(search);
    }
});
const getData = (dataURL) => __awaiter(void 0, void 0, void 0, function* () {
    let result = {};
    yield fetch(cleanURL(dataURL))
        .then((response) => response.json())
        .then((data) => (result = data));
    return result;
});
const addProfiles = (id) => {
    document.getElementById(id).innerHTML = `
  <div class="icon" id="pdf-resume">
    <a href="https://chriscorchado.com/resume/Chris-Corchado-resume-2020.pdf" target="_blank">
      <img alt="Link to PDF Resume" src="https://chriscorchado.com/images/pdfIcon.jpg" title="Link to PDF Resume" />
      <span>Resume</span>
    </a>
  </div>

  <div class="icon" id="profile-linkedin">
    <a href="https://www.linkedin.com/in/chriscorchado/" target="_blank">
      <img alt="Link to LinkedIn Profile" title="Link to LinkedIn Profile" src="https://chriscorchado.com/images/linkedInIcon.jpg" />
      <span>LinkedIn</span>
    </a>
  </div>

  <div class="icon" id="profile-azure">
    <a href="https://docs.microsoft.com/en-us/users/corchadochrisit-2736/" target="_blank">
      <img alt="Link to Azure Profile" title="Link to Azure Profile" src="https://chriscorchado.com/images/azureIcon.png" />
      <span>Azure</span>
    </a>
  </div>`;
};
const setPageHTML = (values) => {
    let item = "";
    let page = values[0];
    let data = values[1];
    let itemTitle = values[2];
    let itemJobTitle = values[3];
    let itemBody = values[4];
    let imgPieces = values[5];
    let startDate = values[6];
    let endDate = values[7];
    let itemTrackImage = values[8];
    let itemPDF = values[9];
    let itemDate = values[10];
    let itemCompanyName = values[11];
    let itemTechnology = values[12];
    let searchedFor = values[13];
    let includedTechnologyItem = values[14];
    let indexCount = values[15];
    switch (page) {
        case "about":
            document.getElementById("search-container").style.display = "none";
            document.getElementById("logo").getElementsByTagName("img")[0].style.border =
                "1px dashed #7399EA";
            let aboutData = data.attributes.body.value.toString();
            addProfiles("profiles");
            return aboutData;
            break;
        case "contact":
            addProfiles("profiles");
            if (location.toString().indexOf("/contact.html?submitted=true") !== -1) {
                formSubmitted(5);
            }
            else {
                document.getElementsByClassName("container")[0].innerHTML = data.toString();
                document.getElementById("contact-link").className += " nav-item-active";
                const webLocation = document.getElementById("edit-field-site-0-value");
                webLocation.value = location.toString();
                document.getElementById("edit-mail").focus();
            }
            break;
        case "companies":
            return `<div class="company-container col shadow">

          <div class="company-name">${itemTitle}</div>
          <div class="company-job-title">${itemJobTitle}</div>
          <div class="body-container">${itemBody}</div>

          <div class="screenshot-container">
            <img loading="lazy" src=${getFullUrlByPage(imgPieces[0], page)}
            class="company-screenshot"
            alt="${data.attributes.title} Screenshot"
            title="${data.attributes.title} Screenshot" />
          </div>

          <div class="employment-dates">${startDate} - ${endDate}</div>
        </div>`;
            break;
        case "courses":
            item = `<div class="course-box box">
          <h2>${itemTitle}</h2>

          <div>
            <img loading="lazy" src="${getFullUrlByPage(imgPieces[0], page)}"
              alt="${itemTitle.replace(/(<([^>]+)>)/gi, "")}"
              title="${itemTitle.replace(/(<([^>]+)>)/gi, "")}"  />
          </div>

          <div class="course-wrapper">

            <span class="course-date" >${itemDate}</span>

            <span class="course-links">
              <a href="${getFullUrlByPage(itemPDF, page)}" target="_blank" >
                <img loading="lazy" src="https://chriscorchado.com/images/pdfIcon.jpg" height="25"
                title="View the PDF Certificate" alt="View the PDF Certificate"/>
              </a>
            </span>`;
            if (itemTrackImage) {
                item += `<span class="course-links">
            <a href="${getFullUrlByPage(itemTrackImage, page)}" data-featherlight="image" >
              <img loading="lazy" src="https://chriscorchado.com/images/linkedIn-track.png" height="25"
              title="View the Courses in the Track" alt="View the Courses in the Track" />
            </a>
          </span>`;
            }
            return (item += `</div></div>`);
            break;
        case "projects":
            let imgAltCount = 0;
            item = `<div class="project col">
        <div class="project-title">${itemTitle}</div>
        <div class="project-company">${itemCompanyName} <span class="project-date">(${itemDate})</span></div>
        <div class="body-container">${itemBody}</div>`;
            if (imgPieces) {
                let itemGridClass = `project-item-grid project-items${data.relationships.field_screenshot.data.length}`;
                let section = `<section data-featherlight-gallery data-featherlight-filter="a" class="${itemGridClass}">`;
                let screenshotAlt = new Array();
                data.relationships.field_screenshot.data.forEach((screenshot) => {
                    screenshotAlt.push(screenshot.meta.alt);
                });
                imgAltCount = 0;
                imgPieces.forEach((img) => {
                    let pieces = img.split(",");
                    pieces.forEach((item) => {
                        let projectImage = getFullUrlByPage(item, page);
                        section += `<div class="project-item shadow" title='${screenshotAlt[imgAltCount]}'>

              <a href=${projectImage} class="gallery" >
                <div class="project-item-desc">
                  ${itemWithSearchHighlight(screenshotAlt[imgAltCount], searchedFor)}
                </div>

                <img loading="lazy" src='${projectImage}' alt='${screenshotAlt[imgAltCount]}'
                  title='${screenshotAlt[imgAltCount]}' />
              </a>
            </div>`;
                        imgAltCount++;
                    });
                });
                section += `</section>`;
                item += section;
            }
            if (data.attributes.field_video_url) {
                let encodedName = encodeURIComponent(itemTitle);
                data.attributes.field_video_url.forEach((img) => {
                    item += `<span title="Play Video"><a href="https://chriscorchado.com/video.html?url=${data.attributes.field_video_url}&name=${encodedName}" target="_blank" class="play-video" >
            Play Video <img loading="lazy" src="https://chriscorchado.com/images/play_video_new_window_icon.png" alt="Play Video" width="20" />
          </a></span>`;
                });
            }
            item += `<div class="project-technology">${itemTechnology.slice(0, -2)}</div>`;
            item += `</div>`;
            return item;
            break;
    }
};
const renderPage = (data, page, searchedFor, next, prev) => {
    let pageIsSearchable = false;
    if (page == "contact") {
        setPageHTML([page, data]);
        return;
    }
    let includedCompanyName = [""];
    let includedAssetFilename = [""];
    let includedTechnologyName = [""];
    let includedTechnologyIcon = [""];
    if (data.included) {
        let allIncludedData = getIncludedData(data);
        includedCompanyName = allIncludedData[0];
        includedAssetFilename = allIncludedData[1];
        includedTechnologyName = allIncludedData[2];
        includedTechnologyIcon = allIncludedData[3];
    }
    let item = "", itemBody = "", currentNavItem = "", itemTitle = "", itemDate = "", startDate = "", endDate = "", itemJobTitle = "", itemTechnology = "", itemTechnologyIcon = "", itemCompanyName = "", itemWorkType = "", itemPDF = "", itemTrackImage = "";
    let itemCount = 0;
    let imgPieces = [];
    let includedTechnologyItem = [];
    data.data.forEach((element) => {
        itemTitle = element.attributes.title;
        itemBody = element.attributes.body ? element.attributes.body.value : "";
        itemDate = element.attributes.field_date || element.attributes.field_award_date;
        itemJobTitle = element.attributes.field_job_title;
        startDate = element.attributes.field_start_date;
        endDate = element.attributes.field_end_date;
        itemWorkType = element.attributes.field_type == "full" ? "Full-Time" : "Contract";
        itemTechnology = "";
        itemTrackImage = "";
        imgPieces = [];
        includedTechnologyItem = [];
        if (element.relationships) {
            let relationshipData = getElementRelationships(element, includedAssetFilename, includedCompanyName, includedTechnologyName, includedTechnologyIcon);
            if (!imgPieces.includes(relationshipData[0].toString())) {
                imgPieces.push(relationshipData[0].toString());
            }
            itemPDF = relationshipData[1].toString();
            if (relationshipData[2])
                itemTrackImage = relationshipData[2].toString();
            itemCompanyName = relationshipData[3].toString();
            itemTechnology += relationshipData[4].toString();
            itemTechnologyIcon += relationshipData[5].toString();
            includedTechnologyItem.push(relationshipData[6]);
        }
        if (itemDate) {
            if (page == "projects")
                itemDate = itemDate.split("-")[0];
            if (page == "courses")
                itemDate = getMonthYear(itemDate);
        }
        if (startDate)
            startDate = getMonthYear(startDate);
        if (endDate)
            endDate = getMonthYear(endDate);
        itemTitle = itemTitle.replace("&amp;", "&");
        if (searchedFor) {
            itemTitle = itemWithSearchHighlight(itemTitle, searchedFor);
            itemDate = itemWithSearchHighlight(itemDate, searchedFor);
            startDate = itemWithSearchHighlight(startDate, searchedFor);
            endDate = itemWithSearchHighlight(endDate, searchedFor);
            itemBody = itemWithSearchHighlight(itemBody, searchedFor);
            itemJobTitle = itemWithSearchHighlight(itemJobTitle, searchedFor);
            itemTechnology = itemWithSearchHighlight(itemTechnology, searchedFor);
            itemCompanyName = itemWithSearchHighlight(itemCompanyName, searchedFor);
            if (itemWorkType !== "node-company") {
                itemWorkType = itemWithSearchHighlight(itemWorkType, searchedFor);
            }
        }
        itemCount++;
        const allValues = [
            page,
            element,
            itemTitle,
            itemJobTitle,
            itemBody,
            imgPieces,
            startDate,
            endDate,
            itemTrackImage,
            itemPDF,
            itemDate,
            itemCompanyName,
            itemTechnology,
            searchedFor,
            includedTechnologyItem
        ];
        switch (page) {
            case "about":
                item = setPageHTML(allValues);
                break;
            case "companies":
                item += setPageHTML(allValues);
                break;
            case "courses":
                item += setPageHTML(allValues);
                break;
            case "projects":
                item += setPageHTML(allValues);
                break;
        }
    });
    let pageHasGallery = false;
    switch (page) {
        case "about":
            currentNavItem = "about-link";
            item = `<h1 id="content">About Me</h1>${item}`;
            break;
        case "companies":
            currentNavItem = "companies-link";
            pageIsSearchable = true;
            item = `<h1 id="content">History</h1><div class="container company">${item}</div>`;
            break;
        case "courses":
            currentNavItem = "courses-link";
            pageIsSearchable = true;
            pageHasGallery = true;
            item = ` <h1 id="content">Courses</h1><div class="container courses-container row">${item}</div>`;
            break;
        case "projects":
            currentNavItem = "projects-link";
            pageIsSearchable = true;
            pageHasGallery = true;
            item = `<h1 id="content">Projects</h1><div class="container project-container row">${item}</div>`;
            break;
    }
    if (page !== "about") {
        document.getElementById(currentNavItem).className += " nav-item-active";
    }
    document.getElementsByClassName("container")[0].innerHTML = item;
    if (pageIsSearchable) {
        document.getElementById("search-container").style.display = "block";
        let searchTextBox = document.getElementById(SITE_SEARCH_ID);
        searchTextBox.addEventListener("keydown", event => {
            return searchFilter(event);
        });
        let searchSubmit = document.getElementById('searchSubmit');
        searchSubmit.addEventListener("click", event => {
            debounceMe(event);
        });
        let searchClearButton = document.getElementById('searchBtn');
        searchClearButton.addEventListener("click", event => {
            searchClear(SITE_SEARCH_ID);
        });
    }
    if (pageHasGallery) {
        $("a.gallery").featherlightGallery({
            previousIcon: "<img src='https://chriscorchado.com/lightbox/images/left-arrow.png' alt='Prev' />",
            nextIcon: "<img src='https://chriscorchado.com/lightbox/images/right-arrow.png' alt='Next' />",
            galleryFadeIn: 200,
            galleryFadeOut: 300
        });
    }
    if (page !== "about" && page !== "contact") {
        setPagination(itemCount, data.passedInCount.currentCount, prev, next);
        const inputSearchBox = document.getElementById(SITE_SEARCH_ID);
        if (document.getElementById('prev')) {
            let pagerNavPrev = document.getElementById('prev');
            pagerNavPrev.addEventListener("click", event => {
                getPage(getCurrentPage(), inputSearchBox.value, pagerNavPrev.dataset.prev);
            });
        }
        if (document.getElementById('next')) {
            let pagerNavNext = document.getElementById('next');
            pagerNavNext.addEventListener("click", event => {
                getPage(getCurrentPage(), inputSearchBox.value, pagerNavNext.dataset.next);
            });
        }
    }
    setLoading(false);
    if (page == "about") {
        document.getElementById("html5").setAttribute("class", "shadow-version noLink");
        document.getElementById("html5-here").style.display = "block";
    }
};
export { getPage, getData, addProfiles, setPageHTML, renderPage };
