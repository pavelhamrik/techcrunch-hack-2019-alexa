'use strict';

const run = require('./sort');

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
    new JovoDebugger(),
    new FileDb()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
    LAUNCH() {
        if (this.$request.context.System.device.supportedInterfaces['Alexa.Presentation.APL']) {
            this.$alexaSkill
                .addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    version: '1.0',
                    document: require('../apl/splash.json'),
                    datasources: {},
                });
        }

        this.ask(`Hello EDHEC Student`);

        // this.ask(`Hello EDHEC Student, 
        //     I am a voice coach, the essence of my existence is to present you career options!
        //     For a start, tell me which two of these matter to you the most?
        //     Annual wage or popularity among EDHEC students?
        // `);
    },

    ShowMeTheCheeseIntent() {
        if (this.$request.context.System.device.supportedInterfaces['Alexa.Presentation.APL']) {
            this.$alexaSkill
                .addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    version: '1.0',
                    document: require('../apl/document.json'),
                    datasources: require('../apl/data-sources.json'),
                });
        }
        this.ask('Stop pestering me.', 'OK, I didn\'t mean that');
    },

    async MyInterestsAreIntent() {
        // console.log('XXXX', this.$inputs.interestone.id);
        const sortedByInterest = await run([this.$inputs.interestone.id]);
        console.log(sortedByInterest);
        this.ask('Popular EDHEC graduates’ careers sorted by annual wage are:'
            + sortedByInterest[0].FUNCTION + ', '
            + sortedByInterest[1].FUNCTION + ' and '
            + sortedByInterest[2].FUNCTION + '. '
            + 'Which carrier should I tell you more about?'
        );
    },

    Unhandled() {
        this.ask('Sorry, I don\'t think I understand.');
    },

    ON_ERROR() {
        console.log(`Error: ${JSON.stringify(this.$alexaSkill.getError())}`);
        console.log(`Request: ${JSON.stringify(this.$alexaSkill.$request)}`);
    
        this.ask('Uh oh, an error. What now, huh?');
    },

    END() {
        console.log(`Termination: ${this.$alexaSkill.getEndReason()}`);

        this.tell('Ta ta!');
    }
});

function prepData(sorting) {
    return {}
}

module.exports.app = app;
