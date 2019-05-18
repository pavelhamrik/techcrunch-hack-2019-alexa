'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
// const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');

const app = new App();

app.use(
    new Alexa(),
    // new GoogleAssistant(),
    new JovoDebugger(),
    new FileDb()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
    LAUNCH() {
        this.$alexaSkill
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('../apl/splash.json'),
                datasources: {},
            });
        this.ask(`Hello EDHEC Student, 
            I am a voice coach, the essence of my existence is to present you career options!
            For a start, tell me which two of these matter to you the most?
            Annual wage or popularity among EDHEC students?
        `);
    },

    ShowMeTheCheeseIntent() {
        this.$alexaSkill
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('../apl/document.json'),
                datasources: require('../apl/data-sources.json'),
            });
        this.ask('Stop pestering me.', 'OK, I didn\'t mean that');
    },

    MyInterestsAreIntent() {
        this.ask('What I\'ve gotten is <prosody pitch="x-low">' + this.$inputs.interestone.value + '</prosody> and '  + this.$inputs.interesttwo.value + '.');
    },

    Unhandled() {
        this.ask('I\'m sorry, I don\'t believe I understand.');
    },

    ON_ERROR() {
        console.log(`Error: ${JSON.stringify(this.$alexaSkill.getError())}`);
        console.log(`Request: ${JSON.stringify(this.$alexaSkill.$request)}`);
    
        this.ask('There was an error. Can I help you in any other way?');
    },

    END() {
        const reason = this.$alexaSkill.getEndReason();
        console.log(reason);

        this.tell('Ta ta!');
    }
});

function prepData(sorting) {
    return {}
}

module.exports.app = app;
