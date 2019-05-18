'use strict';

const sort_by = require('./sort');
const format_for_display = require('./format');

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
            this.$alexaSkill.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('../apl/intro.json'),
                datasources: {},
            });
        }

        // this.ask(`Hello EDHEC Student`);
        this.ask(`Hello EDHEC Student, 
            I am a voice coach, the essence of my existence is to present you career options!
            For a start, tell me which two of these matter to you the most?
            Annual wage or popularity among EDHEC students?
        `);
    },

    async MyInterestsAreIntent() {
        const careersByInterest = await sort_by([this.$inputs.interestone.id]);
        this.$user.$data.careersByInterest = careersByInterest;

        console.log('GGG–––––––––––––––––––––––––––––––––––', JSON.stringify(format_for_display(
            [this.$inputs.interestone.id], 
            careersByInterest,
            3
        )), '–––––––––––––––––––––––––––––––––––');

        if (this.$request.context.System.device.supportedInterfaces['Alexa.Presentation.APL']) {
            this.$alexaSkill.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('../apl/inner_voice_list.json'),
                datasources: format_for_display(
                    'jobs',
                    careersByInterest,
                    [this.$inputs.interestone.id], 
                    3
                ),
            });
        }

        this.ask(`Popular EDHEC graduates' careers sorted by annual wage are:
            ${careersByInterest[0].FUNCTION}, 
            ${careersByInterest[1].FUNCTION}, and
            ${careersByInterest[2].FUNCTION}. 
            Which carrier should I tell you more about?
        `);
    },

    CareerDetailIntent() {
        const careersByInterest = this.$user.$data.careersByInterest;

        const reqRole = this.$inputs.roleDetail.value.toUpperCase();

        const role = careersByInterest.find(function(roleRow) {
            return reqRole == roleRow.FUNCTION;
        });

        // console.log('ROLE', role);
        // console.log('REQ_ROLE', reqRole);

        if (typeof role === 'undefined') {
            return this.toIntent('Unhandled');    
        }

        // const test = format_for_display(
        //     'alumni',
        //     careersByInterest[0],
        //     '', 
        //     3
        // )

        // console.log('GGG', test);

        // if (this.$request.context.System.device.supportedInterfaces['Alexa.Presentation.APL']) {
        //     this.$alexaSkill.addDirective({
        //         type: 'Alexa.Presentation.APL.RenderDocument',
        //         version: '1.0',
        //         document: require('../apl/job-template.json'),
        //         datasources: format_for_display(
        //             'alumni',
        //             careersByInterest,
        //             '', 
        //             3
        //         ),
        //     });
        // }

        this.ask(`
            According to the Oxford University, ${role.FUNCTION} has ${role.AUTOMATION_RISK} probability of automation. 
            It's not enough to just go through at the data. I have a couple of alumni from EDHEC, do you want to take a look?
        `);
    },

    LinkedInListIntent() {
        // if (this.$request.context.System.device.supportedInterfaces['Alexa.Presentation.APL']) {
        //     this.$alexaSkill.addDirective({
        //         type: 'Alexa.Presentation.APL.RenderDocument',
        //         version: '1.0',
        //         document: require('../apl/inner_voice_list.json'),
        //         datasources: require('../apl/data-sources.json'),
        //     });
        // }
        this.tell(`
            According to LinkedIn, these alumni have listed Lawyer as their occupation.
            I’ve sent you their details. Alumni are very forthcoming – do reach out!
            Do not forget, if you choose the quick and easy path as Lord Vader did — you will become an agent of evil.
        `);
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
