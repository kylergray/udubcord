/**
 * Name: Kyler Gray
 * Date: 05.18.2021
 * Section: CSE 154 AD
 *
 * This is the index.js page for the uw discord directory which handles all of the interaction
 * between the user and the page. This includes getting information from the API to display, and
 * submitting new servers uploaded to the API. This also includes animations, and popups!
 */
'use strict';

(function() {

  const paramURL = '/searchParameters';
  const searchURL = '/search';
  const submitURL = '/submit';
  const POPUP_TIME = 3000;

  window.addEventListener('load', init);

  /**
   * Sets up functionality for the website loading in the search options and enabling buttons to
   * be clickable
   */
  function init() {
    loadSearch();
    id('popup-form').addEventListener('submit', function(form) {
      form.preventDefault();
      submitServer();
    });
    id('add-button').addEventListener('click', showPopup);
    id('close-button').addEventListener('click', hidePopup);
  }

  /**
   * Displays the popup window for the user to submit new servers
   */
  function showPopup() {
    let popup = id('popup');
    if (popup.classList.contains('hidden')) {
      popup.classList.remove('hidden');
    }
  }

  /**
   * Hides the popup window for the user to submit new servers
   */
  function hidePopup() {
    let popup = id('popup');
    if (!popup.classList.contains('hidden')) {
      popup.classList.add('hidden');
    }
  }

  /**
   * Handles errors by displaying a helpful error popup to the user for three seconds
   * so that they are informed on how to correct the error
   * @param {Error} err the error to get the message for the user from
   */
  function handleError(err) {
    let error = id('error');
    if (error.classList.contains('hidden')) {
      qs('#error > p span').textContent = err.message;
      error.classList.remove('hidden');
      setTimeout(() => {
        error.classList.add('hidden');
      }, POPUP_TIME);
    }
  }

  /**
   * Sends messages by displaying a helpful popup to the user for three seconds
   * so that they are informed of their success
   * @param {String} msg the message for the user
   */
  function sendMessage(msg) {
    let message = id('message');
    if (message.classList.contains('hidden')) {
      qs('#message > p span').textContent = msg;
      message.classList.remove('hidden');
      setTimeout(() => {
        message.classList.add('hidden');
      }, POPUP_TIME);
    }
  }

  /**
   * Submits a server to the API to be added, waits for the response, and either sends
   * a message letting the user know it was successful or informs them on how to fix
   * their submission
   */
  function submitServer() {
    let params = new FormData(id('popup-form'));
    fetch(submitURL, {method: 'POST', body: params})
      .then(statusCheck)
      .then(resp => resp.text())
      .then(sendMessage)
      .catch(handleError);
  }

  /**
   * Loads the search options for the user to explore. These are the prefixes and
   * course types the user can choose from. If successulf, the fetched results are
   * then sent to be displayed.
   */
  function loadSearch() {
    fetch(paramURL)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(updateSearch)
      .catch(handleError);
  }

  /**
   * Displayes the given search parameter for the user to interact with and select
   * what options they would like the results to be filtered by
   * @param {JSON} searchParams the search options the user can choose from
   */
  function updateSearch(searchParams) {
    let aside = qs('aside section');
    for (let param of searchParams.parameters) {
      let list = gen('ul');
      list.id = param;
      list.textContent = param.replace(/[A-Z]/g, segment => {
        return ' ' + segment;
      }).toUpperCase();
      for (let option of searchParams[param]) {
        let listItem = gen('li');
        listItem.textContent = option;
        listItem.addEventListener('click', searchRequest);
        list.appendChild(listItem);
      }
      aside.appendChild(list);
    }
  }

  /**
   * Makes a request to the API to get the server results for the selected options
   * from the user. If this request is successful, the results will be displayed,
   * otherwise an error will appear for the user.
   */
  function searchRequest() {
    select(this);
    let params = new FormData();
    let type = getSelected(id('serverTypes'));
    let prefix = getSelected(id('coursePrefixes'));
    params.append('serverTypes', type);
    params.append('coursePrefixes', prefix);
    type = type === '' ? '' : ' #' + type.toLowerCase();
    prefix = prefix === '' ? '' : ' #' + prefix.toLowerCase();
    qs('#server-results > section > h2').textContent = 'Discovering' + type + prefix + ' servers';
    fetch(searchURL, {method: 'POST', body: params})
      .then(statusCheck)
      .then(resp => resp.json())
      .then(postResults)
      .catch(handleError);
  }

  /**
   * Displays the available servers for the user to join based upon the given results.
   * @param {JSON} results the results of potential servers
   */
  function postResults(results) {
    let displayResults = id('display-results');
    displayResults.innerHTML = '';
    for (let result of results) {
      let card = genCard();
      let info = gen('div');
      info.classList.add('info');
      let title = gen('h3');
      title.textContent = result.name;
      let description = gen('p');
      let prefix = gen('span');
      prefix.classList.add('green');
      prefix.textContent = result.prefix;
      let type = gen('span');
      type.textContent = result.type;
      description.appendChild(prefix);
      description.appendChild(type);
      info.appendChild(title);
      info.appendChild(description);
      card.appendChild(info);
      let link = gen('a');
      link.href = result.link;
      link.textContent = 'Join';
      card.appendChild(link);
      displayResults.appendChild(card);
    }
  }

  /**
   * Creates a standard card element which can be used to build on for displaying
   * servers to the user
   * @returns {Element} the card to build from
   */
  function genCard() {
    let card = gen('div');
    card.classList.add('serverCard');
    let invite = gen('h2');
    invite.textContent = 'You\'ve Been Invited to Join a Server';
    card.appendChild(invite);
    return card;
  }

  /**
   * Checks the children of the given list to see if any of them are selected and
   * returns the selected elements content, if none are selected a blank string is
   * returned
   * @param {Element} list the parent element of the list elements to check
   * @returns {String} the contents of the selected element
   */
  function getSelected(list) {
    for (let child of list.children) {
      if (child.classList.contains('selected')) {
        return child.textContent;
      }
    }
    return '';
  }

  /**
   * Handles selecting a button, updating its state to appear selected, as well
   * as deselecting any sibling buttons which are currently selected
   * @param {Element} button the button to select
   */
  function select(button) {
    let parent = button.parentElement;
    for (let child of parent.children) {
      if (child !== button) {
        child.classList.remove('selected');
      } else {
        child.classList.add('selected');
      }
    }
  }

  /**
   * Checks the status of the given response from an API and whether the
   * response is okay to be used later or not
   * @param {Text} response the raw response from the API to check
   * @returns {Text} response from the API to use if it is okay
   * @throws error if the response is not okay to be used
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }

  /**
   * Creates an element of the given type and returns the created element
   * @param {String} element name of the element to generate
   * @returns {Element} the element that can be used in the DOM
   */
  function gen(element) {
    return document.createElement(element);
  }

  /**
   * Gets the first element from the DOM that matches the given CSS selector
   * @param {String} selector the CSS selector to choose an element with
   * @returns {Element} the Element in the DOM that matches the CSS selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Gets the element from the DOM that matches the given id
   * @param {String} name the id to choose an element with
   * @returns {Element} the Element in the DOM that matches the given id
   */
  function id(name) {
    return document.getElementById(name);
  }

})();