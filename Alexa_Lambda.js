var https = require('https');
var options = {
  host:'enigmatic-mountain-98119.herokuapp.com',
  port: 443,
  path: '/api/traineeships.json',
  method: 'GET'
}
exports.handler = function (event, context) {
    try {
        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }
        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};
/** Called when the session starts */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
}
/** Called when the user invokes the skill without specifying what they want. */
function onLaunch(launchRequest, session, callback) {
    var speechOutput = "Welcome to Codaisseur Bootcamp! I can tell you about the Codaisseur Bootcamp. Which topics are you interested in?"
    var reprompt = "Which topics are you interested in? You can find out about the bootcamp, courses, teachers, costs, students, languages."
    var header = "Codaisseur Bootcamp topics!"
    var shouldEndSession = false
    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    }
    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
}
/** Called when the user specifies an intent for this skill. */
function onIntent(intentRequest, session, callback) {
    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;
    // dispatch custom intents to handlers here
    if (intentName == "GetCodaisseurFactIntent") {
        handleGetCodaisseurFactRequest(intent, session, callback)
    } else if (intentName == "GetCodaisseurEventIntent") {
        handleGetCodaisseurEventRequest(intent, session, callback)
    } else if (intentName == "AMAZON.HelpIntent") {
        handleHelpRequest(intent, session, callback)
    } else if (intentName == "AMAZON.StopIntent" || intentName == "AMAZON.CancelIntent") {
        handleFinishSessionRequest(intent, session, callback)
    } else {
        throw "Invalid intent"
    }
}
/** Called when the user ends the session - is not called when the skill returns shouldEndSession=true. */
function onSessionEnded(sessionEndedRequest, session) {
}
// ------- Helper functions to build responses for Alexa -------
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}
function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}
function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
var codaisseurTopics = {
  "bootcamp" : {
        "fact" : "The bootcamp is an awesome way to become a developer!"
    },
    "courses" : {
      "fact" : "There are several courses for companies to get up to date with the latest technolgies"
    },
    "teachers" : {
      "fact" : "The teachers are Wouter, Arno and Miriam. And they are the best!"
    },
    "costs" : {
      "fact" : "It might as well be free"
    },
    "students" : {
      "fact" : "That's more a question for you, no?"
    },
    "languages" : {
      "fact" : "We start out with Ruby on Rails and then dive into Javascript with React and Redux"
    }
}
var codaisseurEvents = {
  "next" : {
        "fact" : "It's tomorrow!"
    }
}
function handleGetCodaisseurFactRequest(intent, session, callback) {
    var topic = intent.slots.CodaisseurTopics.value.toLowerCase()
    topic = matchTopic(topic)
    if (!codaisseurTopics[topic]) {
        var speechOutput = "That's not a topic. Try asking about another topic."
        var repromptText = "Try asking about another topic."
        var header = "Does Not Exist"
    } else {
        var fact = codaisseurTopics[topic].fact
        var speechOutput = fact
        var repromptText = "Do you want to hear about more topics?"
        var header = capitalizeFirst(topic)
    }
    var shouldEndSession = false
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}
function handleGetCodaisseurEventRequest(intent, session, callback) {
    var event = intent.slots.CodaisseurEvents.value.toLowerCase()
    event = matchEvent(event)
    if (!codaisseurEvents[event]) {
        var speechOutput = "That's not an event. Try asking about another event."
        var repromptText = "Try asking about another event."
        var header = "Does Not Exist"
        var shouldEndSession = false
        callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
    } else {
        return https.get('https://enigmatic-mountain-98119.herokuapp.com/api/traineeships.json', function (res) {
            res.setEncoding('utf8');
              var rawData = '';
              res.on('data', (chunk) => { rawData += chunk; });
              res.on('end', () => {
                try {
                  const parsedData = JSON.parse(rawData);
                  console.log(parsedData)
                    var fact = parsedData[0].start_date
                      var speechOutput = fact
                      var repromptText = "Do you want to hear about more events?"
                      var header = capitalizeFirst(event)
                      var shouldEndSession = false
                      callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
                } catch (e) {
                  console.error(e.message);
                }
              });

        })
    }
}
function matchTopic(topic) {
  switch(topic) {
    case "course":
        return "courses"
    case "teacher":
        return "teachers"
    case "cost":
        return "costs"
    case "student":
        return "students"
    case "language":
        return "languages"
    default:
        return topic
   }
}
function matchEvent(event) {
  switch(event) {
    case "nexts":
        return "next"
    default:
        return event
   }
}
function capitalizeFirst(t) {
    return t.charAt(0).toUpperCase() + t.slice(1)
}
function handleHelpRequest(intent, session, callback) {
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }
    var speechOutput = "I can tell you facts about all the different Codaisseur topics, including he bootcamp, courses, teachers, costs, students and languages. Which topic are you interested in?"
    var repromptText = speechOutput
    var shouldEndSession = false
    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))
}
function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!"
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye! Thank you for using Codaisseur Bootcamp!", "", true));
}
