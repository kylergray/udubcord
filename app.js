/**
 * Name: Kyler Gray
 * Date: 05.18.2021
 * Section: CSE 154 AD
 *
 * This is the app.js page for the uw discord directory which handles all fetch requests from the
 * client. This includes a searchParameters request, a search request, and a submit request in
 * which the user can get and post discord servers. These servers are saved into a json files to
 * avoid resetting problems
 */
'use strict';

const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const serverFile = 'serverdata.json';
const app = express();
const discordRegex = /^https:\/\/discord.gg\/[a-z\d]{10}$/i;
const prefixRegex = /^[A-Z]{2,8}$/;
const DEFAULT_PORT = 8080;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

/**
 * GET endpoint to be able to get the possible search parameters to filter servers by.
 * These parameters will be returned as JSON to the client or a 500 error will be thrown
 * if there are any issues getting the search parameters from the file.
 */
app.get('/searchParameters', async (req, res) => {
  try {
    let result = await fs.readFile(serverFile, 'utf-8');
    result = JSON.parse(result);
    res.type('json');
    res
      .send(result.searchParameters);
  } catch (err) {
    res.type('text').status('500')
      .send(err.message);
  }
});

/**
 * POST endpoint to be able to submit certain search parameters to the API and get a response
 * with available servers which match the search parameters. These results will be returned as
 * JSON or a 500 error will be returned if there are any problems with loading the search results.
 */
app.post('/search', async (req, res) => {
  try {
    let result = await fs.readFile(serverFile, 'utf-8');
    result = JSON.parse(result);
    res.type('json');
    res
      .send(getServers(result, req.body.serverTypes, req.body.coursePrefixes));
  } catch (err) {
    res.type('text').status('500')
      .send(err.message);
  }
});

/**
 * POST endpoint to be able to submit a new server to the database. The submission will be checked
 * for proper formatting and that it is not already submitted, if these isssues arise a 400 error
 * will be returned, if there are problems saving the file a 500 error will be returned, if their
 * submission is valid they will recieve a notice of the success
 */
app.post('/submit', async (req, res) => {
  try {
    let result = await fs.readFile(serverFile, 'utf-8');
    result = JSON.parse(result);
    await checkSubmission(req, res, result);
  } catch (err) {
    res.type('text').status('500')
      .send(err.message);
  }
});

app.use(express.static('public'));
const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT);

/**
 * Gets current servers from the loaded result from the save file that match the given
 * type and prefix which were given and returns them to be sent to the requesting client
 * @param {JSON} result the results from the file to search through
 * @param {String} serverType the server type requested
 * @param {String} coursePrefix the course prefix requested
 * @returns {Array} an array of servers which match the search parameters
 */
function getServers(result, serverType, coursePrefix) {
  let serverResults = [];
  for (let server of result.servers) {
    if ((serverType === '' ||
      serverType === 'any' ||
      server.type === serverType) &&
      (coursePrefix === '' ||
        coursePrefix === 'any' ||
        server.prefix === coursePrefix)) {
      serverResults.push(server);
    }
  }
  return serverResults;
}

/**
 * Checks the submission from the user in a variety of ways to ensure it is a good submission
 * to use. This includes formatting the link, the prefix, and that the type is valid, as well
 * as checking if the submission is unique
 * @param {JSON} req the request from the user
 * @param {JSON} res the response to send to the user
 * @param {JSON} result the result of reading from the file
 */
async function checkSubmission(req, res, result) {
  if (!discordRegex.test(req.body.link)) {
    res.type('text').status('400')
      .send('Bad Link, please match the format https://discord.gg/10charcode');
  } else if (!prefixRegex.test(req.body.prefix)) {
    res.type('text').status('400')
      .send('Bad Prefix, please match the format CODE');
  } else if (!result.searchParameters.serverTypes.includes(req.body.type)) {
    res.type('text').status('400')
      .send('Bad Type, please choose from the following types ' +
        result.searchParameters.serverTypes);
  } else {
    let serverExist = serverExists(req, result);
    if (serverExist !== '') {
      res.type('text').status('400')
        .send(serverExist);
    } else {
      updateResult(req, result);
      try {
        await fs.writeFile(serverFile, JSON.stringify(result, null, 2));
        res.type('text')
          .send('Your server has been added!');
      } catch (err) {
        res.type('text').status('500')
          .send(err.message);
      }
    }
  }
}

/**
 * Checks whether the submitted file already exists in the current data file
 * @param {JSON} req the request made to check if it exists
 * @param {JSON} result the result of reading the current data json file
 * @returns {String} the message to send if the server exists already, or empty if not
 */
function serverExists(req, result) {
  for (let server of result.servers) {
    if (req.body.name === server.name) {
      return 'A server with that name already exists!';
    } else if (req.body.link === server.link) {
      return 'A server with that link already exists!';
    }
  }
  return '';
}

/**
 * Updates the loaded JSON with the new server from the client and adds the course prefix
 * to the prefixes if it does not already exist
 * @param {JSON} req the request from the client
 * @param {JSON} result the JSON from the loaded files
 */
function updateResult(req, result) {
  if (!result.searchParameters.coursePrefixes.includes(req.body.prefix)) {
    result.searchParameters.coursePrefixes.push(req.body.prefix);
  }
  result.servers.push(JSON.parse(JSON.stringify(req.body)));
}