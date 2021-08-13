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
function load_page(page, callback) {
  $("#container-exp").load(page, function (responseTxt, statusTxt, xhr) {
    if (statusTxt == "success") callback();
    if (statusTxt == "error")
      alert("Error: " + xhr.status + ": " + xhr.statusText);
  });
}

function set_next_onclick(clickfunction) {
  document.getElementById("next").onclick = clickfunction;
}

var replaceBody = function (error_message) {
  $("body").html(error_message);
};
