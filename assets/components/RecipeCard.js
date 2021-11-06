// RecipeCard.js

class RecipeCard extends HTMLElement {
  constructor() {
    super(); // Inheret everything from HTMLElement

    // Attach the shadow DOM and append this markup / stlying inside
    // The shadow root will help us keep everything separated
    this.attachShadow({ mode: 'open' });
  }

  set data(data) {
    if (!data) return;

    // Used to access the actual data object
    this.json = data;

    const style = document.createElement('style');
    const card = document.createElement('article');
    style.innerHTML = `
      * {
        font-family: sans-serif;
        margin: 0;
        padding: 0;
      }
      
      a {
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      
      article {
        align-items: center;
        border: 1px solid rgb(223, 225, 229);
        border-radius: 8px;
        display: grid;
        grid-template-rows: 118px 56px 14px 18px 15px 36px;
        height: auto;
        row-gap: 5px;
        padding: 0 16px 16px 16px;
        width: 178px;

        background-color: white;
        transition: all 0.2s ease;
        user-select: none;
      }

      article:hover {
        border-radius: 8px;
        cursor: pointer;
        filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.2));
        transition: all 0.2s ease;
        transform: scale(1.02);
      }

      div.rating {
        align-items: center;
        column-gap: 5px;
        display: flex;
      }
      
      div.rating > img {
        height: auto;
        display: inline-block;
        object-fit: scale-down;
        width: 78px;
      }
      article > img {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        height: 118px;
        object-fit: cover;
        margin-left: -16px;
        width: calc(100% + 32px);
      }
      p.ingredients {
        height: 32px;
        line-height: 16px;
        padding-top: 4px;
        overflow: hidden;
      }
      
      p.organization {
        color: black !important;
      }
      p.title {
        display: -webkit-box;
        font-size: 16px;
        height: 36px;
        line-height: 18px;
        overflow: hidden;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      p:not(.title), span, time {
        color: #70757A;
        font-size: 12px;
      }
    `;

    // Grab the title
    const titleText = getTitle(data);
    const title = document.createElement('p');
    title.classList.add('title');

    // Grab the recipe link
    const href = getUrl(data);
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.innerText = titleText;
    title.appendChild(link); // Make the title a link

    // Grab the thumbnail
    const imageUrl = getImage(data);
    const image = document.createElement('img');
    image.setAttribute('src', imageUrl);
    image.setAttribute('alt', titleText);

    // Grab the organization name
    const organizationText = getOrganization(data);
    const organization = document.createElement('p');
    organization.classList.add('organization');
    organization.innerText = organizationText;

    // Grab the reviews
    const ratingVal = searchForKey(data, 'ratingValue');
    const ratingTotal = searchForKey(data, 'ratingCount');
    const rating = document.createElement('div');
    rating.classList.add('rating');
    const numStars = Math.round(ratingVal);
    if (ratingVal) {
      rating.innerHTML = `
        <span>${ratingVal}</span>
        <img src="assets/images/icons/${numStars}-star.svg" alt="${numStars} stars">
      `;
      if (ratingTotal) {
        rating.innerHTML += `<span>(${ratingTotal})</span>`;
      }
    } else {
      rating.innerHTML = `
        <span>No Reviews</span>
      `;
    }

    // Grab the total time
    const totalTime = searchForKey(data, 'totalTime');
    const time = document.createElement('time');
    time.innerText = convertTime(totalTime);

    // Grabt the ingredients
    const ingredientsArr = searchForKey(data, 'recipeIngredient');
    const ingredientsList = createIngredientList(ingredientsArr);
    const ingredients = document.createElement('p');
    ingredients.classList.add('ingredients');
    ingredients.innerText = ingredientsList;

    // Add all of the elements to the card
    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(organization);
    card.appendChild(rating);
    card.appendChild(time);
    card.appendChild(ingredients);

    this.shadowRoot.append(style, card);
  }

  get data() {
    // Stored in .json to avoid calling set data() recursively in a loop.
    // .json is also exposed so you can technically use that as well
    return this.json;
  }
}

/**
 * Recursively search for a key nested somewhere inside an object
 * @param {Object} object the object with which you'd like to search
 * @param {String} key the key that you are looking for in the object
 * @returns {*} the value of the found key
 */
function searchForKey(object, key) {
  var value;
  Object.keys(object).some(function (k) {
    if (k === key) {
      value = object[k];
      return true;
    }
    if (object[k] && typeof object[k] === 'object') {
      value = searchForKey(object[k], key);
      return value !== undefined;
    }
  });
  return value;
}

/**
 * Extract the title of the recipe from the given recipe schema JSON obejct
 * @param {Object} data Raw recipe JSON to find the image of
 * @returns {String} If found, returns the recipe title
 */
function getTitle(data) {
  if (data.name) return data.name;
  if (data['@graph']) {
    for (let i = 0; i < data['@graph'].length; i++) {
      if (data['@graph'][i]['@type'] == 'Recipe') {
        if (data['@graph'][i]['name']) return data['@graph'][i]['name'];
      };
    }
  }
  return null;
}

/**
 * Extract a usable image from the given recipe schema JSON object
 * @param {Object} data Raw recipe JSON to find the image of
 * @returns {String} If found, returns the URL of the image as a string, otherwise null
 */
function getImage(data) {
  if (data.image?.url) return data.image.url;
  if (data.image?.contentUrl) return data.image.contentUrl;
  if (data.image?.thumbnail) return data.image.thumbnail;
  if (data['@graph']) {
    for (let i = 0; i < data['@graph'].length; i++) {
      if (data['@graph'][i]['@type'] == 'ImageObject') {
        if (data['@graph'][i]['url']) return data['@graph'][i]['url'];
        if (data['@graph'][i]['contentUrl']) return data['@graph'][i]['contentUrl'];
        if (data['@graph'][i]['thumbnailUrl']) return data['@graph'][i]['thumbnailUrl'];
      };
    }
  }
  return null;
}

/**
 * Extract the URL from the given recipe schema JSON object
 * @param {Object} data Raw recipe JSON to find the URL of
 * @returns {String} If found, it returns the URL as a string, otherwise null
 */
function getUrl(data) {
  if (data.url) return data.url;
  if (data['@graph']) {
    for (let i = 0; i < data['@graph'].length; i++) {
      if (data['@graph'][i]['@type'] == 'Recipe') return data['@graph'][i]['@id'];
    }
  };
  return null;
}

/**
 * Similar to getUrl(), this function extracts the organizations name from the
 * schema JSON object. It's not in a standard location so this function helps.
 * @param {Object} data Raw recipe JSON to find the org string of
 * @returns {String} If found, it retuns the name of the org as a string, otherwise null
 */
function getOrganization(data) {
  if (data.publisher?.name) return data.publisher?.name;
  if (data['@graph']) {
    for (let i = 0; i < data['@graph'].length; i++) {
      if (data['@graph'][i]['@type'] == 'WebSite') {
        return data['@graph'][i].name;
      }
    }
  };
  return null;
}

/**
 * Converts ISO 8061 time strings to regular english time strings.
 * Not perfect but it works for this lab
 * @param {String} time time string to format
 * @return {String} formatted time string
 */
function convertTime(time) {
  let timeStr = '';

  // Remove the 'PT'
  time = time.slice(2);

  let timeArr = time.split('');
  if (time.includes('H')) {
    for (let i = 0; i < timeArr.length; i++) {
      if (timeArr[i] == 'H') return `${timeStr} hr`;
      timeStr += timeArr[i];
    }
  } else {
    for (let i = 0; i < timeArr.length; i++) {
      if (timeArr[i] == 'M') return `${timeStr} min`;
      timeStr += timeArr[i];
    }
  }

  return '';
}

/**
 * Takes in a list of ingredients raw from imported data and returns a neatly
 * formatted comma separated list.
 * @param {Array} ingredientArr The raw unprocessed array of ingredients from the
 *                              imported data
 * @return {String} the string comma separate list of ingredients from the array
 */
function createIngredientList(ingredientArr) {
  let finalIngredientList = '';

  /**
   * Removes the quantity and measurement from an ingredient string.
   * This isn't perfect, it makes the assumption that there will always be a quantity
   * (sometimes there isn't, so this would fail on something like '2 apples' or 'Some olive oil').
   * For the purposes of this lab you don't have to worry about those cases.
   * @param {String} ingredient the raw ingredient string you'd like to process
   * @return {String} the ingredient without the measurement & quantity 
   * (e.g. '1 cup flour' returns 'flour')
   */
  function _removeQtyAndMeasurement(ingredient) {
    return ingredient.split(' ').splice(2).join(' ');
  }

  ingredientArr.forEach(ingredient => {
    ingredient = _removeQtyAndMeasurement(ingredient);
    finalIngredientList += `${ingredient}, `;
  });

  // The .slice(0,-2) here gets ride of the extra ', ' added to the last ingredient
  return finalIngredientList.slice(0, -2);
}

// Define the Class so you can use it as a custom element
customElements.define('recipe-card', RecipeCard);