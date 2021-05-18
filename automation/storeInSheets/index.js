/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */


var { google } = require('googleapis');

function store(sheets, data) {
    let spid = 'sheet_id';

    var request = {
        spreadsheetId: spid,
        range: 'A1:D1',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [
                data
            ]
        },
    };
    sheets.spreadsheets.values.append(request, function (err, response) {
        if (err) {
            return;
        }
    });
}

function buildAndAuthorizeService(callback, data) {
    const google = require('googleapis').google;
    google.auth.getApplicationDefault((err, authClient) => {
        if (err) {
            callback(err);
            return;
        }

        if (authClient.createScopedRequired && authClient.createScopedRequired()) {
            authClient = authClient.createScoped([
                'https://www.googleapis.com/auth/spreadsheets'
            ]);
        }

        // Instantiates an authorized client
        const sheets = google.sheets({
            version: 'v4',
            auth: authClient
        });

        callback(sheets, data);
    });
}

exports.sendToSheets = (req, res) => {
    var name = req.query.name;
    var email = req.query.email;
    var company = req.query.company;
    var occur = Date().toLocaleString('es-MX');
    var sheet = req.query.sheet || 'agencies';
    let data_to_send = [name, company, email, occur, sheet];

    if (name === undefined) {
        res.status(400).send('Not enough data defined!');
    } else {
        var data = data_to_send;
        buildAndAuthorizeService(store, data);
        res.status(200).send('Success: ' + name);
    }
};