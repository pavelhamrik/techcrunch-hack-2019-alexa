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
        return this.toIntent('HelloWorldIntent');
    },

    HelloWorldIntent() {
        this.ask('What\'s your name?', 'Please tell me your name.');
    },
    
    AnotherIntent() {
        this.tell('Grilling the bratwursts here,' + this.$inputs.name.value + '.');
    },

    DangerousIntent() {
        this.showImageCard(
                'Danger', 
                'Don\'t you wanna know how we keep startin\ fires? It\'s my desire. It\'s my desire', 
                'https://s3.eu-west-3.amazonaws.com/assets-di38/high-voltage-small.png'
            )
            .ask('Yes, danger, danger, high voltage!')
            .toIntent('AnotherIntent');
    },

    MyNameIsIntent() {
        const phraseProbability = Math.random();

        this.$speech.addText('Hey ' + this.$inputs.name.value + '.')
            .addText('What a name, huh?', phraseProbability < 0.5)
            .addText('I don\'t think I know any ' + this.$inputs.name.value + '.', phraseProbability >= 0.5)
        
        this.ask(this.$speech);
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

module.exports.app = app;
