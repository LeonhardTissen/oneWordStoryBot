const { Client, GatewayIntentBits, ActivityType, Partials } = require("discord.js");
const client = new Client({
	intents: Object.values(GatewayIntentBits),
	partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
});
const fs = require('fs');
const path = require('path');

// Load token from .env file
const env = require('dotenv').config().parsed;

const maxUsers = parseInt(env.USERBLOCK); // Maximum number of consecutive users allowed to contribute

const verifyWords = env.VERIFY === 'yes';

let story = ''; // The story string
let lastUsers = []; // Array to store the last users who contributed
let storyMessage = null; // The message object of the story
let isStartOfSentence = true; // Whether the next word should be the start of a sentence

const validPunctuation = ['?', '.', '!', '...', ',']; // Punctuation that is allowed to end the sentence

const allowedSpecialCharactersList = ['%', '"', "'", ':', ';', '(', ')', '*', '<', '>'];

function allowedRegexBuilder() {
	const allowedSpecialCharacters = allowedSpecialCharactersList.join('');
	const allowedNumbers = '\\d';
	return new RegExp(`^[A-Za-z${allowedSpecialCharacters}${allowedNumbers}]+$`);
}

const allowedRegex = allowedRegexBuilder();

client.once('ready', () => {
	console.log('Bot is ready');
	client.user.setPresence({ 
		activities: [{ 
			name: 'story.Warze.org', 
			type: ActivityType.Listening,
		}], 
		status: 'idle' 
	});
});

const api = 'https://wild-erin-harp-seal-vest.cyclic.app/ww';

async function verifyWord(word) {
	console.log(`Verifying word: ${word}`);
	const response = await fetch(`${api}/check?word=${word}`);
	const responseObject = await response.json();
	console.log(responseObject);
	return responseObject.result;
}

function addToLogFile(message) {
	console.log(message);
	const filePath = path.join(__dirname, 'log.txt');
	fs.appendFileSync(filePath, message + '\n');
}

function trySendToUser(message, string) {
	message.author.send(string).catch(() => {
        console.log('Failed to send message to user');
    });
}

client.on('messageCreate', async message => {
    // Ignore messages from the bot itself and messages without the prefix
    if (message.author.bot) return;

	// Ignore messages from other channels
	if (message.channel.id !== env.CHANNEL) return;

	// Log the user's message
	const logMessage = `${message.author.username} (${message.author.id}): ${message.content}`;
	addToLogFile(logMessage);

	if (message.content.toLowerCase() === 'end of story') {
		story = '';
		storyMessage = null;
		isStartOfSentence = true;
		return;
	}

	// Delete the user's message
	message.delete();

	// Too long
	if (message.content.length > 20) {
		// Send private message to the user
		trySendToUser(message, 'Your message is too long.');
		return;
	}

    if (lastUsers.includes(message.author.id)) {
		// Send private message to the user
		trySendToUser(message, 'You have already contributed to the story. Please wait for others to contribute before you can contribute again.')
		return;
	}

	// Check if the message is either ?, . or ! these are allowed to end
	const isPunctuation = validPunctuation.includes(message.content);
	if (!isPunctuation) {

		// Verify if the message is only a single, alphanumeric word
		if (!allowedRegex.test(message.content)) {
			// Send private message to the user
			trySendToUser(message, 'Your message should only contain a single, alphanumeric word.');
			return;
		}
	
		if (verifyWords) {
			// Verify that the word is valid
			const isValidWord = await verifyWord(message.content.toLowerCase());
			if (!isValidWord) {
				// Send private message to the user
				trySendToUser(message, 'Your message should be a valid word.');
				return;
			}
		}
	}

	// Add the user to the lastUsers array
	lastUsers.push(message.author.id);

	// If the lastUsers array is larger than the maxUsers, remove the first element
	if (lastUsers.length > maxUsers) {
		lastUsers.shift();
	}

	// Capitalize the first letter of the message if it's the start of a sentence and lowercase the rest
	const word = isStartOfSentence ? message.content.charAt(0).toUpperCase() + message.content.slice(1).toLowerCase() : message.content.toLowerCase();

	const append = isPunctuation ? word : ' ' + word;

	// Add the user's message to the story
	story += append;

	if (story.length > 2000) {
		// Send a new message if the story is too long
		story = append;
		storyMessage = await message.channel.send(story);
	} else if (storyMessage) {
		storyMessage.edit(story);
	} else {
		// Send the story message
		storyMessage = await message.channel.send(story);
	}

	// console.log(lastUsers);

	// Set isStartOfSentence to true if the last character of the message is a valid punctuation
	isStartOfSentence = validPunctuation.includes(message.content) && message.content !== ',';
});

// Login to Discord with your app's token
client.login(env.TOKEN);
