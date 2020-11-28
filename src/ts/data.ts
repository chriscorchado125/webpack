const API_BASE = "https://chriscorchado.com/drupal8";
const MAX_ITEMS_PER_PAGE = 50;
const SITE_SEARCH_ID = "searchSite";

import { getFullUrlByPage, getCurrentPage, getMonthYear, cleanURL, setLoading, updateInterface } from './utilities'
import { setPagination, getIncludedData, getElementRelationships, itemWithSearchHighlight, debounceMe, searchFilter, searchClear } from './search'
import { formSubmitted } from './form'

/**
 * Load page
 * @param {string} page - page name
 * @param {string=} search - (optional) - search string
 * @param {string=} pagingURL - (optional) - Prev/Next links
 */
const getPage = async (page: string, search?: string, pagingURL?: string) => {
  let data = null;

  setLoading(true);

  if (search) {
    // ga('send', 'pageview', location.pathname + '?search=' + search);
  }

  if (page == "contact") {
    // generate the contact form as long as it has not been submitted
    if (location.toString().indexOf("submitted") == -1) {
      await fetch(`${API_BASE}/contact/feedback`) // get the feedback form as text
        .then((resp) => {
          return resp.ok ? resp.text() : Promise.reject(resp.statusText);
        })
        .then((page) => {
          data = page.replace(/\/drupal8/g, API_BASE); // update the HTML URLs from relative to absolute

          // get the contact form HTML
          let form = data.substr(data.indexOf("<form class="), data.indexOf("</form>"));
          form = form.substr(0, form.indexOf("</form>") + 8);

          form = form.replace("Your email address", "Email");

          // get the contact form JavaScript
          let script = data.substr(
            data.indexOf(
              '<script type="application/json" data-drupal-selector="drupal-settings-json">'
            ),
            data.indexOf("></script>")
          );
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
  } else {
    if (pagingURL) {
      data = await getData(pagingURL);
    } else {
      switch (page) {
        case "about":
        case "webpack":
          data = await getData(
            `${API_BASE}/jsonapi/node/page?fields[node--page]=id,title,body&
              filter[id][operator]=CONTAINS&
              filter[id][value]=ca23f416-ad70-41c2-9228-52ba6577abfe`
          );
          break;
        case "companies":
          if (search) {
            data = await getData(
              `${API_BASE}/jsonapi/node/company?filter[or-group][group][conjunction]=OR&
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
                page[limit]=${MAX_ITEMS_PER_PAGE}`
            );
          } else {
            data = await getData(
              `${API_BASE}/jsonapi/node/company?sort=-field_end_date&
                include=field_company_screenshot&
                page[limit]=${MAX_ITEMS_PER_PAGE}`
            );
          }
          break;
        case "courses":
          if (search) {
            data = await getData(
              `${API_BASE}/jsonapi/node/awards?filter[or-group][group][conjunction]=OR&
                filter[title][operator]=CONTAINS&
                filter[title][value]=${search}&
                filter[title][condition][memberOf]=or-group&
                filter[field_award_date][operator]=CONTAINS&
                filter[field_award_date][value]=${search}&
                filter[field_award_date][condition][memberOf]=or-group&
                sort=-field_award_date&
                include=field_award_pdf,field_track_image,field_award_images&
                page[limit]=${MAX_ITEMS_PER_PAGE}`
            );
          } else {
            data = await getData(
              `${API_BASE}/jsonapi/node/awards?sort=-field_award_date&
                include=field_award_pdf,field_track_image,field_award_images&
                page[limit]=${MAX_ITEMS_PER_PAGE}`
            );
          }
          break;
        case "projects":
          if (search) {
            data = await getData(
              `${API_BASE}/jsonapi/node/project?filter[or-group][group][conjunction]=OR&
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
              page[limit]=${MAX_ITEMS_PER_PAGE}`
            );
          } else {
            data = await getData(
              `${API_BASE}/jsonapi/node/project?sort=-field_date&field_company.title&
                include=field_project_technology,field_company,field_screenshot&
                fields[node--company]=field_company_name,field_video_url&
                fields[node--project]=title,body,field_date,field_screenshot,field_project_technology,field_company,field_video_url&
                page[limit]=${MAX_ITEMS_PER_PAGE}`
            );
          }
          break;
        case "resume":
          data = await getData(
            `${API_BASE}/jsonapi/node/page?fields[node--page]=id,title,body&
              filter[id][operator]=CONTAINS&
              filter[id][value]=815cf534-a677-409c-be7a-b231c24827b5`
          );
          break;
      }
    }
  }

  // create object with the last pagination count or a default of 1
  let passedInCount = {
    currentCount: document.getElementById("lastCount")
      ? document.getElementById("lastCount").textContent
      : 1
  };

  data = { ...data, passedInCount };

  if (data.data && data.data.length) {
    renderPage(data, page, search, data.links.next, data.links.prev);
  } else {
    updateInterface(search);
  }
};

/**
 * Get data
 * @param {string} dataURL - URL to fetch data from
 * @return {Object} - JSON object of data
 */
const getData = async (dataURL: string) => {
  let result: any = {};
  await fetch(cleanURL(dataURL))
    .then((response) => response.json())
    .then((data) => (result = data));
  return result;
};

/**
 * Add profile links
 * @param {string} id - ID of element to insert into
 */
const addProfiles = (id: string) => {
  let subFolder = "";
  if (document.location.toString().indexOf("webpack") !== -1) subFolder = "/webpack";

  document.getElementById(id).innerHTML = `
  <div class="icon" id="html-resume">
    <a href="${subFolder}/resume.html">
      <img alt="Link to HTML Resume with PDF and Word options" src="https://chriscorchado.com/images/htmlIcon.jpg" />
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

/**
 * Add PDF and Word resume links
 * @param {string} id - ID of element to insert into
 */
const addResumes = (id: string) => {
  document.getElementById(id).innerHTML = `
  <div class="icon" id="pdf-resume">
    <a href="https://chriscorchado.com/resume/Chris-Corchado-resume-2020.pdf" target="_blank" rel="noopener" title="Opening a new window">
      <img alt="Link to PDF Resume" src="https://chriscorchado.com/images/pdfIcon.jpg" />
      <span>PDF</span>
    </a>
  </div>

  <div class="icon" id="word-resume">
    <a href="https://chriscorchado.com/resume/Chris-Corchado-resume-2020.docx" title="File will download">
      <img alt="Link to MS Word Resume" src="https://chriscorchado.com/images/wordIcon.jpg" />
      <span>Word</span>
    </a>
  </div>
`;
};

/**
 * Configure the HTML for each page
 * @param {array} values - all item values for the page
 * @return {string} - HTML for the page
 */
const setPageHTML = (values: any) => {
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
    case "about": // homepage
    case "webpack":
      document.getElementById("search-container").style.display = "none"; // hide search box

      // add a border to the site logo
      document.getElementById("logo").getElementsByTagName("img")[0].style.border =
        "1px dashed #7399EA";

      // TODO: change to a content type vs basic page split
      let aboutData = data.attributes.body.value.toString();

      // add resume, linkedin and azure links
      addProfiles("profiles");

      return aboutData;

      break;
    case "contact":
      // add resume, linkedin and azure links
      addProfiles("profiles");

      // form sumitted
      if (location.toString().indexOf("/contact.html?submitted=true") !== -1) {
        formSubmitted(5);
      } else {
        // show the form
        document.getElementsByClassName("container")[0].innerHTML = data.toString();
        document.getElementById("contact-link").className += " nav-item-active";

        // capture the current site URL
        const webLocation = document.getElementById(
          "edit-field-site-0-value"
        )! as HTMLInputElement;

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

      // item += `<div class="employment-type">${itemWorkType}</div>`;
      break;
    case "courses":
      item = `<div class="course-box box">
          <h2>${itemTitle}</h2>

          <div>
            <img loading="lazy" src="${getFullUrlByPage(imgPieces[0], page)}"
              alt="${itemTitle.replace(/(<([^>]+)>)/gi, "")}"
              title="${itemTitle.replace(
                /(<([^>]+)>)/gi,
                ""
              )}"  />
          </div>

          <div class="course-wrapper">

            <span class="course-date" >${itemDate}</span>

            <span class="course-links">
              <a href="${getFullUrlByPage(
                itemPDF,
                page
              )}" target="_blank" >
                <img loading="lazy" src="https://chriscorchado.com/images/pdfIcon.jpg" height="25"
                title="View the PDF Certificate" alt="View the PDF Certificate"/>
              </a>
            </span>`;

      // TODO: Create bigger version and add to content type
      //  item += `<span class="course-links">
      //   <a href="${getFullUrlByPage(imgPieces[0], page)}" data-featherlight="image">
      //     <img loading="lazy" src="https://chriscorchado.com/images/jpg_icon.png" height="25"
      //       title="View the Certificate" alt="View the Certificate"/>
      //   </a></span>`;

      if (itemTrackImage) {
        item += `<span class="course-links">
            <a href="${getFullUrlByPage(
              itemTrackImage,
              page
            )}" data-featherlight="image" >
              <img loading="lazy" src="https://chriscorchado.com/images/linkedIn-track.png" height="25"
              title="View the Courses in the Track" alt="View the Courses in the Track" />
            </a>
          </span>`;
      }

      return (item += `</div></div>`); // course-box box
      break;
    case "projects":
      let imgAltCount = 0;
      item = `<div class="project col">
        <div class="project-title">${itemTitle}</div>
        <div class="project-company">${itemCompanyName} <span class="project-date">(${itemDate})</span></div>
        <div class="body-container">${itemBody}</div>`;

      // screenshots
      if (imgPieces) {
        let itemGridClass = `project-item-grid project-items${data.relationships.field_screenshot.data.length}`;
        let section = `<section data-featherlight-gallery data-featherlight-filter="a" class="${itemGridClass}">`;

        let screenshotAlt = new Array();
        data.relationships.field_screenshot.data.forEach((screenshot: any) => {
          screenshotAlt.push(screenshot.meta.alt);
        });

        imgAltCount = 0; // reset alt attribute counter
        imgPieces.forEach((img: string) => {
          let pieces = img.split(",");

          pieces.forEach((item: string) => {
            let projectImage = getFullUrlByPage(item, page);

            section += `<div class="project-item shadow" title='${
              screenshotAlt[imgAltCount]
            }'>

              <a href=${projectImage} class="gallery" >
                <div class="project-item-desc">
                  ${itemWithSearchHighlight(screenshotAlt[imgAltCount], searchedFor)}
                </div>

                <img loading="lazy" src='${projectImage}' alt='${
              screenshotAlt[imgAltCount]
            }'
                  title='${screenshotAlt[imgAltCount]}' />
              </a>
            </div>`;

            imgAltCount++;
          });
        });

        section += `</section>`;
        item += section;
      }

      // videos
      if (data.attributes.field_video_url) {
        let encodedName = encodeURIComponent(itemTitle);

        data.attributes.field_video_url.forEach((img: string) => {
          item += `<span title="Play Video"><a href="https://chriscorchado.com/video.html?url=${
            data.attributes.field_video_url
          }&name=${encodedName}" target="_blank" class="play-video" >
            Play Video <img loading="lazy" src="https://chriscorchado.com/images/play_video_new_window_icon.png" alt="Play Video" width="20" />
          </a></span>`;
        });
      }

      // Text for HTML, CSS, JavaScript, etc..
      item += `<div class="project-technology">${itemTechnology.slice(
        0,
        -2
      )}</div>`;

      // Icons for HTML, CSS, JavaScript, etc..
      // item += `<div class="project-technology">`;
      // for (const [key, value] of Object.entries(includedTechnologyItem)) {
      //   for (const [key1, value1] of Object.entries(value)) {
      //     item += `<div id="technology-item-wrapper">${value1.name}
      //     <img loading="lazy" src="${value1.image}" class="project-technology-icon" title="${value1.name}" alt="${value1.name}" /></div>`;
      //   }
      // }
      // item += `</div>`;

      item += `</div>`;
      return item;
      break;
    case "resume":

      let resumeData = data.attributes.body.value.toString();

      // add PDF and Word resumes
      addResumes("profiles");

      return resumeData;
      break;
  }
};

/**
 * Generate the webpage
 * @param {Object[]} data - page items
 * @param {string} page - page name
 * @param {string=} searchedFor - (optional) - search string
 * @param {Object=} next - (optional) - link to next page of results
 * @param {Object=} prev - (optional) - link to previous page of the results
 */
const renderPage = (
  data: any,
  page: string,
  searchedFor?: string,
  next?: Object,
  prev?: Object
) => {
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

  let item = "",
    itemBody = "",
    currentNavItem = "",
    itemTitle = "",
    itemDate = "",
    startDate = "",
    endDate = "",
    itemJobTitle = "",
    itemTechnology = "",
    itemTechnologyIcon = "",
    itemCompanyName = "",
    itemWorkType = "",
    itemPDF = "",
    itemTrackImage = "";

  let itemCount = 0;
  let imgPieces: any = [];
  let includedTechnologyItem = [];

  data.data.forEach((element: any) => {
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
      let relationshipData = getElementRelationships(
        element,
        includedAssetFilename,
        includedCompanyName,
        includedTechnologyName,
        includedTechnologyIcon
      );

      // course, company and project screenshot filenames
      if (!imgPieces.includes(relationshipData[0].toString())) {
        imgPieces.push(relationshipData[0].toString());
      }

      // course PDF filename and track image
      itemPDF = relationshipData[1].toString();
      if (relationshipData[2]) itemTrackImage = relationshipData[2].toString();

      itemCompanyName = relationshipData[3].toString();
      itemTechnology += relationshipData[4].toString();
      itemTechnologyIcon += relationshipData[5].toString();
      includedTechnologyItem.push(relationshipData[6]);
    }

    // get project and course dates
    if (itemDate) {
      if (page == "projects") itemDate = itemDate.split("-")[0]; // only the year
      if (page == "courses") itemDate = getMonthYear(itemDate);
    }

    // get work history dates - month and year
    if (startDate) startDate = getMonthYear(startDate);
    if (endDate) endDate = getMonthYear(endDate);

    itemTitle = itemTitle.replace("&amp;", "&");

    if (searchedFor) {
      // TODO pass in array[itemTitle, itemDate, etc..] and searchedFor then destructure
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
      case "webpack":
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
      case "resume":
      item = setPageHTML(allValues);
      break;
    }
  }); // data.data forEach

  let pageHasGallery = false;
  switch (page) {
    case "about":
    case "webpack":
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
      case "resume":
      item = `<h1 id="content">Resume</h1><div class="container">${item}</div>`;
      break;
  }

  if (page !== "about" && page !== "resume" && page !== "webpack") {
    document.getElementById(currentNavItem).className += " nav-item-active";
  }

  document.getElementsByClassName("container")[0].innerHTML = item;

  if (pageIsSearchable) {
    document.getElementById("search-container").style.display = "block";

    let searchTextBox = document.getElementById(SITE_SEARCH_ID);
    searchTextBox.addEventListener("keydown", event => {
      return searchFilter(event)
    });


    let searchSubmit = document.getElementById('searchSubmit');
    searchSubmit.addEventListener("click", event => {
      debounceMe(event);
    });


    let searchClearButton = document.getElementById('searchBtn');
    searchClearButton.addEventListener("click", event => {
      searchClear(SITE_SEARCH_ID)
    });
  }

  if (pageHasGallery) {
    // @ts-ignore
    $("a.gallery").featherlightGallery({
      previousIcon: "<img src='https://chriscorchado.com/lightbox/images/left-arrow.png' alt='Prev' />" /* &#dsfsd; Code that was used as previous icon */,
      nextIcon: "<img src='https://chriscorchado.com/lightbox/images/right-arrow.png' alt='Next' />" /* &#9654; Code that was used as next icon */,
      galleryFadeIn: 200 /* fadeIn speed when slide is loaded */,
      galleryFadeOut: 300 /* fadeOut speed before slide is loaded */
    });
  }

  if (page !== "about" && page !== "contact"  && page !== "webpack") {

    setPagination(itemCount, data.passedInCount.currentCount, prev, next)

    const inputSearchBox = document.getElementById(SITE_SEARCH_ID)! as HTMLInputElement;

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

  if (page == "about" || page == "webpack") {
    // set current site version
      document.getElementById("webpack").setAttribute("class", "shadow-version noLink");
      document.getElementById("webpack-here").style.display = "block";
  }
};

export { getPage, getData, addProfiles, setPageHTML, renderPage };
