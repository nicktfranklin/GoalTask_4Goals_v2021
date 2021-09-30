"use strict";

function AssertException(message) {
  this.message = message;
}
AssertException.prototype.toString = function () {
  return "AssertException: " + this.message;
};

function assert(exp, message) {
  if (!exp) {
    throw new AssertException(message);
  }
}

// helper functions
function loadPage(page, callback) {
  $("#container-exp").load(page, function (responseTxt, statusTxt, xhr) {
    if (statusTxt == "success") callback();
    if (statusTxt == "error")
      alert("Error: " + xhr.status + ": " + xhr.statusText);
  });
}

function set_onclick_function(elementID, clickfunction) {  
  document.getElementById(elementID).onclick = clickfunction;
}

var replaceBody = function (error_message) {
  $("body").html(error_message);
};
