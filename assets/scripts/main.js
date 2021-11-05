// main.js

import { Router } from './Router.js';

const recipes = [
  'https://introweb.tech/assets/json/ghostCookies.json',
  'https://introweb.tech/assets/json/birthdayCake.json',
  'https://introweb.tech/assets/json/chocolateChip.json',
  'https://introweb.tech/assets/json/stuffing.json',
  'https://introweb.tech/assets/json/turkey.json',
  'https://introweb.tech/assets/json/pumpkinPie.json'
];
const recipeData = {} // You can access all of the Recipe Data from the JSON files in this variable

const router = new Router(function () {
  /** 
   * TODO - Part 1 - Step 1
   * Select the 'section.section--recipe-cards' element and add the "shown" class
   * Select the 'section.section--recipe-expand' element and remove the "shown" class
   * 
   * You should be using DOM selectors such as document.querySelector() and
   * class modifications with the classList API (e.g. element.classList.add(),
   * element.classList.remove())
   * 
   * This will only be two single lines
   * If you did this right, you should see just 1 recipe card rendered to the screen
   */
   document.querySelector('.section--recipe-cards').classList.add('shown');
   document.querySelector('.section--recipe-cards').classList.remove('shown');
});

window.addEventListener('DOMContentLoaded', init);

// Initialize function, begins all of the JS code in this file
async function init() {
  initializeServiceWorker();

  try {
    await fetchRecipes();
  } catch (err) {
    console.log(`Error fetching recipes: ${err}`);
    return;
  }

  createRecipeCards();
  bindShowMore();
  bindEscKey();
  bindPopstate();
}

/**
 * Detects if there's a service worker, then loads it and begins the process
 * of installing it and getting it running
 */
function initializeServiceWorker() {
  /**
   *  TODO - Part 2 Step 1
   *  Initialize the service worker set up in sw.js
   */
}

/**
 * Loading JSON into a JS file is oddly not super straightforward (for now), so
 * I built a function to load in the JSON files for you. It places all of the recipe data
 * inside the object recipeData like so: recipeData{ 'ghostcookies': ..., 'birthdayCake': ..., etc }
 */
async function fetchRecipes() {
  return new Promise((resolve, reject) => {
    recipes.forEach(recipe => {
      fetch(recipe)
        .then(response => response.json())
        .then(data => {
          // This grabs the page name from the URL in the array above
          data['page-name'] = recipe.split('/').pop().split('.')[0];
          recipeData[recipe] = data;
          if (Object.keys(recipeData).length == recipes.length) {
            resolve();
          }
        })
        .catch(err => {
          console.log(`Error loading the ${recipe} recipe`);
          reject(err);
        });
    });
  });
}

/**
 * Generates the <recipe-card> elements from the fetched recipes and
 * appends them to the page
 */
function createRecipeCards() {
  // Makes a new recipe card
  // Inputs the data for the card. This is just the first recipe in the recipes array,
  // being used as the key for the recipeData object

  // This gets the page name of each of the arrays - which is basically
  // just the filename minus the .json. Since this is the first element
  // in our recipes array, the ghostCookies URL, we will receive the .json
  // for that ghostCookies URL since it's a key in the recipeData object, and
  // then we'll grab the 'page-name' from it - in this case it will be 'ghostCookies'

  /**
   * TODO - Part 1 - Step 3
   * Above I made an example card and added a route for the recipe at index 0 in
   * the recipes array. First, please read through the code in this function to
   * understand what it is doing. Then, turn this into a for loop to iterate over 
   * all the recipes. (bonus - add the class 'hidden' to every recipe card with 
   * an index greater  than 2 in your for loop to make show more button functional)
   * After this step you should see multiple cards rendered like the end of the last
   * lab
   */
   for (let i = 0; i < recipes.length; i++) {
    const recipeCard = document.createElement('recipe-card');
    recipeCard.data = recipeData[recipes[i]];
    const page = recipeData[recipes[i]]['page-name'];
    router.addPage(page, function() {
      document.querySelector('.section--recipe-cards').classList.remove('shown');
      document.querySelector('.section--recipe-expand').classList.add('shown');
      document.querySelector('recipe-expand').data = recipeData[recipes[i]];
    });
    // Double check
    if (i > 2) {
      recipeCard.classList.add('hidden');
    }
    bindRecipeCard(recipeCard, page);
    document.querySelector('.recipe-cards--wrapper').appendChild(recipeCard);
  }


}

/**
 * Binds the click event listeners to the "Show more" button so that when it is
 * clicked more recipes will be shown
 */
function bindShowMore() {
  const showMore = document.querySelector('.button--wrapper > button');
  const arrow = document.querySelector('.button--wrapper > img');
  const cardsWrapper = document.querySelector('.recipe-cards--wrapper');

  showMore.addEventListener('click', () => {
    const cards = Array.from(cardsWrapper.children);
    // The .flipped class rotates the little arrow on the button
    arrow.classList.toggle('flipped');
    // Check if it's extended or not
    if (showMore.innerText == 'Show more') {
      for (let i = 0; i < cards.length; i++) {
        cards[i].classList.remove('hidden');
      }
      showMore.innerText = 'Show less';
    } else {
      for (let i = 3; i < cards.length; i++) {
        cards[i].classList.add('hidden');
      }
      showMore.innerText = 'Show more';
    }
  });
}

/**
 * Binds the click event listener to the <recipe-card> elements added to the page
 * so that when they are clicked, their card expands into the full recipe view mode
 * @param {Element} recipeCard the <recipe-card> element you wish to bind the event
 *                             listeners to
 * @param {String} pageName the name of the page to navigate to on click
 */
function bindRecipeCard(recipeCard, pageName) {
  recipeCard.addEventListener('click', e => {
    if (e.path[0].nodeName == 'A') return;
    router.navigate(pageName);
  });
}

/**
 * Binds the 'keydown' event listener to the Escape key (esc) such that when
 * it is clicked, the home page is returned to
 */
function bindEscKey() {
  /**
   * TODO - Part 1 Step 5
   * For this step, add an event listener to document for the 'keydown' event,
   * if the escape key is pressed, use your router to navigate() to the 'home'
   * page. This will let us go back to the home page from the detailed page.
   */
}

/**
 * Binds the 'popstate' event on the window (which fires when the back &
 * forward buttons are pressed) so the navigation will continue to work 
 * as expected. (Hint - you should be passing in which page you are on
 * in your Router when you push your state so you can access that page
 * info in your popstate function)
 */
function bindPopstate() {
  /**
   * TODO - Part 1 Step 6
   * Finally, add an event listener to the window object for the 'popstate'
   * event - this fires when the forward or back buttons are pressed in a browser.
   * If your event has a state object that you passed in, navigate to that page,
   * otherwise navigate to 'home'.
   * 
   * IMPORTANT: Pass in the boolean true as the second argument in navigate() here
   * so your navigate() function does not add your going back action to the history,
   * creating an infinite loop
   */
}
