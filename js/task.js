/*
 * Requires:
 *     utils.js
 */
"use strict";

/********************
 * Welcome      *
 ********************/
var LoadWelcome = function () {
  // this call back function is called once the html is loaded...
  var callback = function () {
    set_onclick_function("next", function () {
      current_view = new LoadEndTutorial();
    });
  };
  // load the html, run the callback function
  loadPage("./static/templates/welcome.html", callback);
};

var LoadWelcome2 = function () {
  // this call back function is called once the html is loaded...
  var callback = function () {
    set_onclick_function("next", function () {
      current_view = new Tutorial();
    });
  };
  // load the html, run the callback function
  loadPage("./static/templates/instructions/instruct-tutorial.html", callback);
};

/********************
 * Tutorial      *
 ********************/
var move_to_next_trial;
var n_responses;
var curBlock;

var Tutorial = function () {
  move_to_next_trial = false;

  var init = function () {
    for (var i = 0; i < demo_trials.length; i++) {
      demo_trials[i].task_display = $("#task_display");
      demo_trials[i].text_display = $("#trial_text");
      demo_trials[i].trial_number = i;
    }

    if (typeof curBlock !== "undefined") {
      setTimeout(curBlock.end(), 10);
    }

    curBlock = demo_trials.shift();

    curBlock.task_display = document.getElementById("task_display");
    curBlock.text_display = $("#trial_text");
    setTimeout(curBlock.start(), 10);

    $(document).bind("keydown.continue", next);
  };

  var next = function (event) {
    if (move_to_next_trial && event.which == 13) {
      if (demo_trials.length === 0) {
        $(document).unbind("keydown.continue");
        $(document).unbind("keydown.gridworld");

        // Go to next
        current_view = new LoadEndTutorial();
      } else {
        $(document).unbind("keydown.continue");
        $.publish("killtimers");

        n_responses = 0;

        if (typeof curBlock !== "undefined") {
          var restart = curBlock.restart;
          console.log(restart);
          setTimeout(curBlock.end(), 10);
        }

        if (restart !== true) {
          curBlock = demo_trials.shift();
          curBlock.task_display = document.getElementById("task_display");
          curBlock.text_display = $("#trial_text");
          setTimeout(curBlock.start(), 10);
        } else {
          curBlock.reset();
        }

        move_to_next_trial = false;

        setTimeout(function () {
          console.log("end demo trial");
          $(document).bind("keydown.continue", next);
        }, 10);
      }
    }
  };

  loadPage("./static/templates/stage.html", init);
};

/************************
 * Instructions  *
 *************************/

var LoadEndTutorial = function () {
  // this call back function is called once the html is loaded...
  var callback = function () {
    set_onclick_function("next", function () {
      current_view = new LoadInstructions1();
    });
  };
  // load the html, run the callback function
  loadPage(
    "./static/templates/instructions/instruct-endtutorial.html",
    callback
  );
};

var LoadInstructions1 = function () {
  // this call back function is called once the html is loaded...
  var callback = function () {
    set_onclick_function("next", function () {
      current_view = new LoadInstructions2();
    });
  };
  // load the html, run the callback function
  loadPage(
    "./static/templates/instructions/instruct-experiment1.html",
    callback
  );
};

var LoadInstructions2 = function () {
  // this call back function is called once the html is loaded...
  var callback = function () {
    set_onclick_function("next", function () {
      current_view = new LoadInstructions3();
    });
    set_onclick_function("previous", function () {
      current_view = new LoadInstructions1();
    });
  };
  // load the html, run the callback function
  console.log('loading_page_2');
  loadPage(
    "./static/templates/instructions/instruct-experiment2.html",
    callback
  );
};

var LoadInstructions3 = function () {
  // this call back function is called once the html is loaded...
  var callback = function () {
    set_onclick_function("next", function () {
      current_view = new InstructionsQuestionnaire();
    });
    set_onclick_function("previous", function () {
      current_view = new LoadInstructions2();
    });
  };
  // load the html, run the callback function
  loadPage(
    "./static/templates/instructions/instruct-experiment3.html",
    callback
  );
};

/*************************
 * Grid World Experiment *
 *************************/
var total_points = 0;
var trial_number;
var times_seen_context = {};
var reprompt;
var prompt_resubmit;
var resubmit;
var Experiment = function () {
  trial_number = -1;
  move_to_next_trial = false;
  // trial_complete = false;

  //trials variable is declared in trials_experimental.js

  var curBlock;

  var init = function () {
    console.log("experiment init called");

    // psiTurk.showPage('stage.html');
    loadPage("stage.html");

    for (var i = 0; i < trials.length; i++) {
      trials[i].task_display = document.getElementById("task_display");
      trials[i].text_display = $("#trial_text");
    }

    if (typeof curBlock !== "undefined") {
      setTimeout(curBlock.end(), 10);
    }

    curBlock = trials.shift();
    setTimeout(curBlock.start(), 10);
    curBlock.total_points = 0;
    times_seen_context[curBlock.context] = 1;
    curBlock.times_seen_context = 1;

    move_to_next_trial = false;

    setTimeout(function () {
      $(document).bind("keydown.continue", next);
    }, 10);
  };

  var next = function (event) {
    console.log("next event called (training)");

    if (event.which == 13) {
      console.log(event);

      if (trials.length === 0) {
        finish();
      } else {
        if (move_to_next_trial) {
          $(document).unbind("keydown.continue");
          $.publish("killtimers");

          n_responses = 0;

          if (typeof curBlock !== "undefined") {
            setTimeout(curBlock.end(), 10);
          }
          total_points = curBlock.total_points; // get the total points from the end of the trial

          console.log("Trial shift");
          curBlock = trials.shift();

          // Pass the total points collected to the current block for display
          curBlock.total_points = total_points;

          // how many times has this context been seen?
          if (curBlock.context in times_seen_context) {
            times_seen_context[curBlock.context]++;
          } else {
            times_seen_context[curBlock.context] = 1;
          }
          curBlock.times_seen_context = times_seen_context[curBlock.context];

          setTimeout(curBlock.start(), 10);
          //console.log(curBlock.colors);
          console.log("Running trail: " + trial_number);
          console.log("Trials left: " + trials.length);

          // allow_response = true;
          move_to_next_trial = false;
          console.log("check continue");

          setTimeout(function () {
            $(document).bind("keydown.continue", next);
          }, 10);
        }
      }
    }
  };

  var finish = function () {
    //$("body").unbind("keydown.continue"); // Unbind keys
    $("body").unbind(); // Unbind keys
    // psiTurk.recordTrialData(
    //     {
    //         'phase': 'Points Collected',
    //         'Total Points': total_points
    //     });

    // add error handeling...
    // psiTurk.saveData();
    // current_view = new RewardFeedback_experiment();
    var error_message =
      "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you " +
      "lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    prompt_resubmit = function () {
      replaceBody(error_message);
      $("#resubmit").click(resubmit);
    };

    resubmit = function () {
      replaceBody("<h1>Trying to resubmit...</h1>");
      reprompt = setTimeout(prompt_resubmit, 10000);

      // psiTurk.saveData({
      //   success: function () {
      //     clearInterval(reprompt);
      //     current_view = new RewardFeedback_experiment();
      //   },
      //   error: prompt_resubmit,
      // });
    };

    // psiTurk.saveData({
    //   success: function () {
    //     current_view = new RewardFeedback_experiment();
    //   },
    //   error: prompt_resubmit,
    // });
  };

  init();
};

/****************
 * Feedback Screens *
 ****************/
var RewardFeedback_experiment = function () {
  // psiTurk.showPage("feedback/feedback-experiment.html");
  loadPage("feedback/feedback-experiment.html");
  $("#points").html(total_points);

  $("#next").click(function () {
    current_view = new TaskQuestionnaire();
  });
};

/****************
 * Questionnaire *
 ****************/
var record_responses;

var savedata;
var finish;
var InstructionsQuestionnaire = function () {
  var check_responses = function () {
    var answers = {};
    $("select").each(function (i, val) {
      answers[this.id] = this.value;
    });

    var correct_answers = {
      q1: "Both",
      q2: "Letter",
      q3: "Points",
    };

    var all_correct;
    for (var q in answers) {
      if (!answers.hasOwnProperty(q)) continue;
      all_correct = answers[q] === correct_answers[q];

      if (!all_correct) {
        break;
      }
    }

    if (all_correct) {
      $("#backbutton").html("");
      $("#next").html(
        'Begin Game <span class="glyphicon glyphicon-arrow-right"></span>'
      );
      return true;
    }
    return false;
  };

  // Load the questionnaire snippet

  var start_experiment = function () {
    $("#next").click(function () {
      current_view = new Experiment();
    });
  };

  loadPage(
    "static/questionnaires/questionnaire-instructions.html",
    function () {
      $("#next").click(function () {
        var check_val = check_responses();
        if (check_val) {
          start_experiment();
          $("#my_head").html(
            '<span style="font-weight: bold"><span style="color: blue">Great Job!</span></span> ' +
              "<br>Start the experiment when you are ready!"
          );
        } else {
          $("#my_head").html(
            '<span style="font-weight: bold"><span style="color: red">Try again!</span></span> ' +
              "Select the right answers before you continue<br>You can go back and read the " +
              "instructions again if you don't remember."
          );
        }
      });
      $("#back").click(function () {
        current_view = new LoadInstructions1();
      });
    }
  );
};

// var aqQuestionnaire = function () {
//   // Add error message?
//   var error_message =
//     "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you " +
//     "lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

//   record_responses = function () {
//     psiTurk.recordTrialData({ phase: "questionnaire-aq", status: "submit" });

//     $("textarea").each(function (i, val) {
//       psiTurk.recordUnstructuredData(this.id, this.value);
//     });
//     $("select").each(function (i, val) {
//       psiTurk.recordUnstructuredData(this.id, this.value);
//     });
//   };

//   prompt_resubmit = function () {
//     replaceBody(error_message);
//     $("#resubmit").click(resubmit);
//   };

//   resubmit = function () {
//     replaceBody("<h1>Trying to resubmit...</h1>");
//     reprompt = setTimeout(prompt_resubmit, 10000);

//     psiTurk.saveData({
//       success: function () {
//         clearInterval(reprompt);
//         current_view = new Tutorial();
//       },
//       error: prompt_resubmit,
//     });
//   };

//   // Load the questionnaire snippet
//   psiTurk.showPage("questionnaires/questionnaire-aq.html");
//   psiTurk.recordTrialData({ phase: "questionnaire-aq", status: "begin" });

//   $("#next").click(function () {
//     record_responses();
//     psiTurk.saveData({
//       success: function () {
//         psiTurk.doInstructions(
//           instructionsTutorial,
//           function () {
//             current_view = new Tutorial();
//           } // what you want to do when you are done with the questionnaire
//         );
//       },
//       error: prompt_resubmit,
//     });
//   });
// };

// var DemographicsQuestionnaire = function () {
//   var error_message =
//     "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you " +
//     "lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

//   record_responses = function () {
//     psiTurk.recordTrialData({
//       phase: "questionnaire-demographics",
//       status: "submit",
//     });

//     $("textarea").each(function (i, val) {
//       psiTurk.recordUnstructuredData(this.id, this.value);
//     });
//     $("select").each(function (i, val) {
//       psiTurk.recordUnstructuredData(this.id, this.value);
//     });

//     psiTurk.recordUnstructuredData("Browser", navigator.userAgent);
//     var elapsedTime = new Date().getTime() - start_time;
//     psiTurk.recordUnstructuredData("Completion Time", elapsedTime);
//   };

//   prompt_resubmit = function () {
//     replaceBody(error_message);
//     $("#resubmit").click(resubmit);
//   };

//   resubmit = function () {
//     replaceBody("<h1>Trying to resubmit...</h1>");
//     reprompt = setTimeout(prompt_resubmit, 10000);

//     psiTurk.saveData({
//       success: function () {
//         clearInterval(reprompt);
//         current_view = aqQuestionnaire();
//       },
//       error: prompt_resubmit,
//     });
//   };

//   // Load the questionnaire snippet
//   psiTurk.showPage("questionnaires/questionnaire-demographics.html");
//   psiTurk.recordTrialData({
//     phase: "questionnaire-demographics",
//     status: "begin",
//   });

//   $("#next").click(function () {
//     record_responses();
//     psiTurk.saveData({
//       success: function () {
//         current_view = aqQuestionnaire();
//       },
//       error: prompt_resubmit,
//     });
//   });
// };

// /****************
//  * Task Questionnaire *
//  ****************/
// var TaskQuestionnaire = function () {
//   var error_message =
//     "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you " +
//     "lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

//   record_responses = function () {
//     psiTurk.recordTrialData({ phase: "questionnaire-task", status: "submit" });

//     $("textarea").each(function (i, val) {
//       psiTurk.recordUnstructuredData(this.id, this.value);
//     });
//     $("select").each(function (i, val) {
//       psiTurk.recordUnstructuredData(this.id, this.value);
//     });
//   };

//   prompt_resubmit = function () {
//     replaceBody(error_message);
//     $("#resubmit").click(resubmit);
//   };

//   resubmit = function () {
//     replaceBody("<h1>Trying to resubmit...</h1>");
//     reprompt = setTimeout(prompt_resubmit, 10000);

//     psiTurk.saveData({
//       success: function () {
//         clearInterval(reprompt);
//         psiTurk.computeBonus("compute_bonus", function () {
//           finish();
//         });
//       },
//       error: prompt_resubmit,
//     });
//   };

//   // Load the questionnaire snippet
//   psiTurk.showPage("questionnaires/questionnaire-task.html");
//   psiTurk.recordTrialData({ phase: "questionnaire-task", status: "begin" });

//   $("#next").click(function () {
//     record_responses();
//     psiTurk.saveData({
//       success: function () {
//         psiTurk.computeBonus("compute_bonus", function () {
//           finish();
//         });
//       },
//       error: prompt_resubmit,
//     });
//   });

//   finish = function () {
//     psiTurk.completeHIT();
//   };

//   savedata = function () {
//     psiturk.saveData({
//       success: function () {
//         current_view = psiturk.completeHIT();
//       },
//       error: prompt_resubmit,
//     });
//   };
// };

// Task object to keep track of the current phase
var current_view;
var start_time = new Date().getTime();

// /*******************
//  * Run Task
//  ******************/
$(window).load(function () {
  current_view = new LoadWelcome();
});
// $(window).load(function () {
//   psiTurk.doInstructions(
//     instructionsWelcome,
//     function () {
//       current_view = new DemographicsQuestionnaire();
//     } // what you want to do when you are done with instructions
//     // instructionsGeneralization,
//     // function() {current_view = new Generalization()}
//     // function () { current_view = new InstructionsQuestionnaire() };
//     // function() { current_view = new Experiment(); }
//   );
// });
