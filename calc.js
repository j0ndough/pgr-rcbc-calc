/**
 * Client-side JS to implement form and result functionality for
 * the RC-to-BC calculator.
 */

"use strict";
(function() {
  const RC_PER_USD = 6;
  const BC_PER_PULL = 250;
  const SERUM_PER_BC = 2;
  const VALUE_RANGE = [25, 28, 35];

  let pull_BC, reso_BC, serum_BC;

  window.addEventListener("load", init);

  /**
   * Make checkboxes and buttons interactable
   */
  function init() {
    clearValues();
    // hide/show checkbox content
    let boxes = qsa("#item-select input[type=checkbox]");
    for (let i = 0; i < boxes.length; i++) {
      boxes[i].addEventListener("change", toggleCheckBoxDisplay);
    }

    id("option-select").addEventListener("submit", function(event) {
      event.preventDefault();
      calculate();
    });
    id("reset-btn").addEventListener("click", reset);
  }

  /**
   * Toggles the visiblity of the input element for each checkbox
   * @param {Object} evt - check box event object
   */
  function toggleCheckBoxDisplay(evt) {
    let contents = evt.currentTarget.parentNode.nextElementSibling;
    contents.classList.toggle("hidden");
  }

  /**
   * Calculates equivalent BC values based on inputs from checkboxes
   */
  function calculate() {
    clearResults();
    let tickets = qsa(".ticket .amt-form");
    for (let i = 0; i < tickets.length; i++) {
      if (tickets[i].value !== "") {
        pull_BC += parseInt(tickets[i].value);
      }
    }
    if (id("wep-usb-value").value !== "") {
      reso_BC += (parseFloat(id("wep-usb-value").value) * BC_PER_PULL);
    }
    if (id("enable-serum").checked) {
      if (id("serum-value").value !== "") {
        serum_BC += (parseInt(id("serum-value").value) / SERUM_PER_BC);
      }
    }
    displayValue();
  }

  /**
   * Displays the current RC-to-BC value on the page, as well as other information if checked.
   * If no item/item quantity is selected, an error is displayed instead.
   */
  function displayValue() {
    let total_BC = pull_BC + reso_BC + serum_BC;
    let result = gen("p");
    if (total_BC === 0) {
      result.id = "error";
      result.classList.add("red");
      result.textContent = "Please select at least one item and its amount before calculating.";
      id("options-container").insertBefore(result, qs("#options-container").children[1]);
    } else {
      let header = gen("h2");
      header.textContent = "Result:";
      id("results-container").appendChild(header);
      let rc_val = parseInt(id("rc-cost").value);
      displayRCValue(total_BC, rc_val);
      if (id("enable-rc").checked) {
        displayRCCost(rc_val);
      }
      if (id("enable-num-pulls").checked) {
        displayNumPulls(rc_val);
      }
      if (id("enable-pull-cost").checked) {
        displayPullCost(rc_val);
      }
    }
  }

  /**
   * Displays the RC-to-BC value on the page, with a color indicator on the value.
   * @param {Number} total_BC - int containg total equivalent BC value of items selected by user
   * @param {Number} rc_val - int containing current rc cost specified by user
   */
  function displayRCValue(total_BC, rc_val) {
    let rc_bc_val = total_BC / rc_val;
    let result = gen("p");
    result.textContent = "Your RC-to-BC value is: ";
    let rc_bc_element = gen("span");
    if (rc_bc_val < VALUE_RANGE[0]) { // poor
      rc_bc_element.classList.add("red");
    } else if (rc_bc_val > VALUE_RANGE[0] && rc_bc_val < VALUE_RANGE[1]) { // mediocre
      rc_bc_element.classList.add("yellow");
    } else if (rc_bc_val > VALUE_RANGE[1] && rc_bc_val < VALUE_RANGE[2]) { // good
      rc_bc_element.classList.add("light-green");
    } else { // excellent
      rc_bc_element.classList.add("green");
    }
    rc_bc_element.textContent = rc_bc_val.toFixed(2).toString() + ".";
    result.appendChild(rc_bc_element);
    console.log(result);
    id("results-container").appendChild(result);
  }

  /**
   * Displays the USD cost of the current RC value on the page.
   * @param {Number} rc_val - int containing current rc cost specified by user
   */
  function displayRCCost(rc_val) {
    let rc_cost = gen("p");
    rc_cost.textContent = "The approximate cost of " + rc_val + " RC is: " +
      (rc_val / RC_PER_USD).toFixed(2) + " USD.";
    id("results-container").appendChild(rc_cost);
  }

  /**
   * Displays the number of pulls the current amount of items gets you on the page.
   */
  function displayNumPulls() {
    let pulls = gen("p");
    let num_pulls = pull_BC / BC_PER_PULL;
    pulls.textContent = "You get " + num_pulls.toFixed(2) + " pulls with this pack.";
    id("results-container").appendChild(pulls);
  }

  /**
   * Displays the USD cost for a single pull on the page.
   * @param {Number} rc_val - int containing current rc cost specified by user
   */
  function displayPullCost(rc_val) {
    let pull_cost = gen("p");
    let num_pulls = pull_BC / BC_PER_PULL;
    let rc_to_usd = rc_val / RC_PER_USD;
    pull_cost.textContent = "Each pull costs " + (rc_to_usd / num_pulls).toFixed(2) + " USD.";
    id("results-container").appendChild(pull_cost);
  }

  /**
   * Clears the page of current results and inputs, and unchecks all checkboxes
   */
  function reset() {
    let checked = qsa("input[type=checkbox]:checked");
    for (let i = 0; i < checked.length; i++) {
      checked[i].checked = false;
    }
    let forms = qsa(".item > :nth-child(2)");
    for (let i = 0; i < forms.length; i++) {
      forms[i].classList.add("hidden");
    }
    let fields = qsa("input[type=number]");
    for (let i = 0; i < fields.length; i++) {
      fields[i].value = "";
    }
    clearResults();
  }

  /**
   * Clears the page of previous results or error messages.
   */
  function clearResults() {
    clearValues();
    id("results-container").innerHTML = "";
    if (id("error") !== null) {
      id("error").remove();
    }
  }

  /**
   * Clears the previous RC-to-BC value stored
   */
  function clearValues() {
    pull_BC = 0;
    reso_BC = 0;
    serum_BC = 0;
  }

  /**
   * Returns a newly created HTML element
   * @param {string} tagName - element to create
   * @returns {object} Returns a new element denoted by the tagName
   */
   function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Returns the element that has the specified ID name
   * @param {string} name - element ID name
   * @returns {object} - DOM object associated with the ID
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Returns the first matching element of the given query
   * @param {string} selector - the CSS query selector
   * @returns {object} - DOM object associated with the query selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns an array of elements that match the given query
   * @param {string} query - the CSS query selectors
   * @returns {object[]} an array of DOM objects that match the query
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }

})();