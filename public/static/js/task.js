/*
 * Requires:
 *     utils.js
 */
"use strict";

var questionnaire_responses = [];


/********************
 * Welcome      *
 ********************/
var LoadWelcome = function () {
  // this call back function is called once the html is loaded...
  var callback = function () {
    set_onclick_function("next", function () {
      current_view = new LoadConsent();
    });
  };
  // load the html, run the callback function
  loadPage("./static/templates/welcome.html", callback);
};

var LoadConsent = function () {
  var callback = function () {
    set_onclick_function("next", function () {
      // once the subject agrees to the consent, mark the time and start recording data
      db.collection("tasks").doc('new_task').collection('subjects').doc(uid).set({
        subjectID: subjID,  // this refers to the subject's ID from prolific
        date: new Date().toLocaleDateString(),
        start_time: new Date().toLocaleTimeString(),
        trial_data: trial_data,
        questionnaire_responses: questionnaire_responses,
     })
      current_view = new DemographicsQuestionnaire();
    });
  };
  loadPage("./static/consent.html", callback);
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
    document.getElementById("next").onclick = function () {
      current_view = new LoadInstructions2();
    };
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
    document.getElementById("next").onclick = function () {
      current_view = new LoadInstructions3();
    };

    document.getElementById("previous").onclick = function () {
      current_view = new LoadInstructions1();
    };
  };
  // load the html, run the callback function
  loadPage(
    "./static/templates/instructions/instruct-experiment2.html",
    callback
  );
};

var LoadInstructions3 = function () {
  // this call back function is called once the html is loaded...
  var callback = function () {
    document.getElementById("next").onclick = function () {
      current_view = new InstructionsQuestionnaire();
    };

    document.getElementById("previous").onclick = function () {
      current_view = new LoadInstructions2();
    };
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

  //trials variable is declared in trials_experimental.js

  var curBlock;

  var init = function () {
    console.log("experiment init called");

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
    if (event.which == 13) {
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

    trial_data.append({
      phase: "Points Collected",
      "Total Points": total_points,
    });

    // add error handeling...
    // psiTurk.saveData();
    var error_message =
      "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you " +
      "lose your internet connection." +
      "Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

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
    current_view = new RewardFeedback_experiment();
  };

  loadPage("static/templates/stage.html", init);
};

/****************
 * Feedback Screens *
 ****************/
var RewardFeedback_experiment = function () {
  var callback = function () {
    $("#points").html(total_points);

    set_onclick_function("next", function () {
      // current_view = new LoadConsent();
      current_view = new TaskQuestionnaire();
    });
  };

  loadPage("./static/templates/feedback-experiment.html", callback);
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

var aqQuestionnaire = function () {
  // Add error message?
  var error_message =
    "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you " +
    "lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

  record_responses = function () {
    var aq_responses = {
      q1: document.getElementById("q1").value,
      q2: document.getElementById("q2").value,
      q3: document.getElementById("q3").value,
      q4: document.getElementById("q4").value,
      q5: document.getElementById("q5").value,
      q6: document.getElementById("q6").value,
      q7: document.getElementById("q7").value,
      q8: document.getElementById("q8").value,
      q9: document.getElementById("q9").value,
      q10: document.getElementById("q10").value,
    };
    questionnaire_responses.append({ "aq-questionaire": aq_responses });
    // Update firebase
    db.collection("tasks").doc('new_task').collection('subjects').doc(uid).update({
      questionnaire_responses: questionnaire_responses,
    })
  };

  prompt_resubmit = function () {
    replaceBody(error_message);
    $("#resubmit").click(resubmit);
  };

  resubmit = function () {
    replaceBody("<h1>Trying to resubmit...</h1>");
    reprompt = setTimeout(prompt_resubmit, 10000);
  };

  // Load the questionnaire snippet
  loadPage("static/questionnaires/questionnaire-aq.html", function () {
    $("#next").click(function () {
      record_responses();
      current_view = new LoadWelcome2();
    });
  });
};

var DemographicsQuestionnaire = function () {
  var error_message =
    "<h1>Oops!</h1><p>Something went wrong submitting your HIT. " +
    "This might happen if you " +
    "lose your internet connection. Press the button to" +
    " resubmit.</p><button id='resubmit'>Resubmit</button>";

  record_responses = function () {
    var demographics = {
      gender: document.getElementById("gender").value,
      age: document.getElementById("age").value,
      handedness: document.getElementById("handedness").value,
      education: document.getElementById("education").value,
      ethnicity: document.getElementById("ethnicity").value,
      hispanic: document.getElementById("hispanic").value,
    };

    questionnaire_responses.append({
      "demographics-questionaire": demographics,
    });
    // Update firebase
    db.collection("tasks").doc('new_task').collection('subjects').doc(uid).update({
      questionnaire_responses: questionnaire_responses,
    })
  };

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
    //     current_view = aqQuestionnaire();
    //   },
    //   error: prompt_resubmit,
    // });
  };

  // Load the questionnaire snippet
  loadPage(
    "static/questionnaires/questionnaire-demographics.html",
    function () {
      $("#next").click(function () {
        record_responses();
        current_view = aqQuestionnaire();
      });
    }
  );
};

/****************
 * Task Questionnaire *
 ****************/
var TaskQuestionnaire = function () {
  var error_message =
    "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you " +
    "lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

  record_responses = function () {
    var task_responses = {
      engagement: document.getElementById("engagement").value,
      difficulty: document.getElementById("difficulty").value,
      LeftDifficulty: document.getElementById("LeftDifficulty").value,
      RightDifficulty: document.getElementById("RightDifficulty").value,
      strategy: document.getElementById("strategy").value,
      freeform: document.getElementById("freeform").value,
    };
    questionnaire_responses.append({ "task-questionaire": task_responses });
    // Update firebase
    db.collection("tasks").doc('new_task').collection('subjects').doc(uid).update({
      questionnaire_responses: questionnaire_responses,
    })
  };

  prompt_resubmit = function () {
    replaceBody(error_message);
    $("#resubmit").click(resubmit);
  };

  resubmit = function () {
    replaceBody("<h1>Trying to resubmit...</h1>");
    reprompt = setTimeout(prompt_resubmit, 10000);
  };

  finish = function () {
    loadPage("static/templates/end.html", function () { });
    // Update firebase
    db.collection("tasks").doc('new_task').collection('subjects').doc(uid).update({
      end_time: new Date().toLocaleTimeString(),
    })
  };

  // Load the questionnaire snippet
  loadPage("static/questionnaires/questionnaire-task.html", function () {
    $("#next").click(function () {
      record_responses();
      finish();
    });
  });
};

// Task object to keep track of the current phase
var current_view;
var start_time = new Date().getTime();

// /*******************
//  * Run Task
//  ******************/
$(window).load(function () {
  current_view = new LoadWelcome();
});
